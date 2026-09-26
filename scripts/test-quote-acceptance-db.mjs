// Isolated PostgreSQL test runtime; no production credentials or customer data.
// PGLITE_MODULE=/tmp/.../node_modules/@electric-sql/pglite/dist/index.js node scripts/test-quote-acceptance-db.mjs
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
const { PGlite } = await import(process.env.PGLITE_MODULE || '@electric-sql/pglite')
const db = new PGlite()
await db.exec(`
create role anon; create role authenticated; create role service_role;
create table leads(id uuid primary key default gen_random_uuid(),email text,status text,quote_value numeric,follow_up_at timestamptz,next_action text);
create table estimates(id uuid primary key default gen_random_uuid(),lead_id uuid references leads(id),version_no int,title text,product_type text,input_data jsonb default '{}',line_items jsonb default '[]',subtotal numeric,total numeric,notes text,share_token uuid unique default gen_random_uuid(),created_at timestamptz default now(),updated_at timestamptz default now(),status text,accepted_at timestamptz,accepted_by_name text,accepted_by_email text);
create table crm_estimate_follow_up_sequences(id uuid default gen_random_uuid(),lead_id uuid,status text,next_send_at timestamptz,cancelled_at timestamptz,cancellation_reason text,updated_at timestamptz);
create table crm_estimate_follow_up_responses(id uuid default gen_random_uuid(),lead_id uuid);
create table lead_activities(lead_id uuid,type text,user_name text,description text,timestamp timestamptz);
create table invoices(id uuid primary key default gen_random_uuid(),lead_id uuid,created_at timestamptz default now(),total numeric,reference_no text);
`)
const migration = (await readFile(new URL('../supabase/quote_acceptance_sales_orders.sql', import.meta.url), 'utf8')).replace('create extension if not exists pgcrypto;', '')
await db.exec(migration)
await db.exec(migration) // deployment rerun is safe
const one = async (sql, params = []) => (await db.query(sql, params)).rows[0]
async function fixture(overrides = {}) {
  const lead = await one("insert into leads(email,status) values('client@example.com','quoted') returning *")
  const quote = await one("insert into estimates(lead_id,version_no,title,status,total,subtotal,created_at) values($1,1,'Test structure',$2,1000,1000,$3) returning *", [lead.id, overrides.status || 'sent', overrides.createdAt || new Date().toISOString()])
  await db.query("insert into crm_estimate_follow_up_sequences(lead_id,status) values($1,'active')", [lead.id])
  return { lead, quote }
}
const accept = (quote, expected = quote.updated_at) => one('select * from accept_customer_quote($1,$2,$3,$4,$5,$6,$7)', [quote.share_token, expected, 'Client Name', 'client@example.com', '', { terms: ['Test terms'] }, 'test-v1'])
const advance = (order, action, note = 'Confirmed reference', invoice = null) => one('select * from advance_sales_order($1,$2,$3,$4,$5,$6)', [order.id, order.status, action, note, invoice, 'staff@smartsteel.co.za'])
try {
const { lead, quote } = await fixture()
let order = await accept(quote)
assert.equal(order.status, 'awaiting_specifications')
assert.equal(order.quote_snapshot.total, 1000)
assert.equal((await accept(quote)).id, order.id)
assert.equal((await one('select count(*)::int as n from sales_orders where estimate_id=$1', [quote.id])).n, 1)
assert.equal((await one('select status from leads where id=$1', [lead.id])).status, 'won')
assert.equal((await one('select status from crm_estimate_follow_up_sequences where lead_id=$1', [lead.id])).status, 'cancelled')
await assert.rejects(db.query("update estimates set total=1 where id=$1", [quote.id]), /cannot be edited/)
await assert.rejects(db.query("update estimates set status='sent' where id=$1", [quote.id]), /cannot be edited/)
await db.query("update crm_estimate_follow_up_sequences set status='active' where lead_id=$1", [lead.id])
assert.equal((await one('select status from crm_estimate_follow_up_sequences where lead_id=$1', [lead.id])).status, 'cancelled')
await assert.rejects(db.query('insert into crm_estimate_follow_up_responses(lead_id) values($1)', [lead.id]), /already been accepted/)
await assert.rejects(advance(order, 'release_production'), /not permitted/)
await assert.rejects(advance(order, 'confirm_specifications', ''), /confirmed specifications/)
order = await advance(order, 'confirm_specifications', 'Client confirmed 8m x 12m, delivery and site access unchanged.')
assert.equal(order.status, 'awaiting_invoice')
const invoice = await one('insert into invoices(lead_id,total,reference_no) values($1,1150,$2) returning *', [lead.id, order.order_number])
await assert.rejects(advance(order, 'link_invoice', '', quote.id), /Select a positive/)
order = await advance(order, 'link_invoice', 'Invoice sent to client', invoice.id)
await assert.rejects(advance(order, 'release_production'), /not permitted/)
order = await advance(order, 'confirm_payment', 'Deposit receipt ABC123')
order = await advance(order, 'release_production', 'Approved drawing REV-A / pack 123')
assert.equal(order.status, 'in_production')
assert.ok(order.production_released_at)
await assert.rejects(advance(order, 'cancel'), /not permitted/)
await assert.rejects(advance({ ...order, status: 'ready_for_release' }, 'release_production'), /changed/)
for (const action of ['ready_for_dispatch', 'delivered', 'complete']) order = await advance(order, action)
assert.equal(order.status, 'complete')
const expired = await fixture({ createdAt: '2020-01-01' }); await assert.rejects(accept(expired.quote), /expired/)
const stale = await fixture(); await assert.rejects(accept(stale.quote, '2000-01-01'), /changed/)
const old = await fixture(); await db.query("insert into estimates(lead_id,version_no,title,status,total) values($1,2,'Revised','prepared',900)", [old.lead.id]); await assert.rejects(accept(old.quote), /newer/)
for (const status of ['prepared','cancelled','declined','superseded']) { const sample = await fixture({ status }); await assert.rejects(accept(sample.quote), /not open/) }
const cancelled = await fixture(); const cancelledOrder = await advance(await accept(cancelled.quote), 'cancel', 'Client requested smaller structure')
assert.equal((await accept(cancelled.quote)).status, 'cancelled')
assert.equal((await one('select status from leads where id=$1', [cancelled.lead.id])).status, 'won', 'Cancellation must not automatically mark Lost')
assert.equal(cancelledOrder.status, 'cancelled')
const revised = await one("insert into estimates(lead_id,version_no,title,status,total) values($1,2,'Smaller structure','sent',800) returning *", [cancelled.lead.id])
assert.equal((await accept(revised)).status, 'awaiting_specifications')
await db.exec('set role anon')
await assert.rejects(db.query('select * from sales_orders'), /permission denied/)
await assert.rejects(accept(quote), /permission denied/)
await db.exec('reset role')
console.log('PostgreSQL migration and acceptance lifecycle passed: duplicate protection, stale/expired/replaced quotes, immutable snapshots, release gates, cancellation/revision, follow-up guards and anonymous access.')
} finally { await db.close() }
