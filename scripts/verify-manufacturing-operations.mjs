import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import { emptyOperations, summarizeOperations, validateOperations, todaySast } from '../src/lib/manufacturingOperations.mjs'
const order = { id: randomUUID(), status: 'awaiting_payment', quote_snapshot: { total: 100000 }, specifications_confirmed_at: '2026-10-01', invoice_id: randomUUID() }
const entry = (amount, reference = 'Bank reference') => ({ amount, date: todaySast(), reference, kind: 'payment' })
let data = emptyOperations()
assert.equal(summarizeOperations(order,data).deposit,86250)
assert.equal(summarizeOperations(order,data).baseline,null)
assert.equal(summarizeOperations(order,data).stage,'deposit')
validateOperations(data,order)
data.engineering.status='drafting'
assert.throws(()=>validateOperations(data,order),/75%/)
data.payments=[entry(86250)]
validateOperations(data,order)
data.engineering={...data.engineering,status:'approved',reference:'W08-16',revision:'A',applicability:'8x16x3 roof only',matchConfirmed:true}
validateOperations(data,order)
data.baseline={structure:60000,sheeting:10000,other:0,source:'Original quote allowance dated 2026-10-01',locked:true}
const frozen=structuredClone(data)
assert.throws(()=>validateOperations({...data,baseline:{...data.baseline,structure:50000}},order,frozen),/locked/)
for(const s of data.suppliers) { s.name='Supplier';s.quotedCost=s.key==='structure'?55000:9000;s.quoteReference='Q-001';s.status='manufacturing' }
assert.throws(()=>validateOperations(data,order),/supplier payment/)
for(const s of data.suppliers) {s.payments=[entry(10000)];s.status='ready'}
validateOperations(data,order,frozen)
assert.equal(summarizeOperations(order,data).variance,6000)
assert.equal(summarizeOperations(order,{...data,suppliers:data.suppliers.map(s=>({...s,status:'quoted'}))}).committed,null)
assert.equal(summarizeOperations(order,data).invoicesComplete,false)
data.qualityChecked=true;data.packed=true
assert.equal(summarizeOperations(order,data).stage,'balance')
data.deliveryDate=todaySast();data.deliveryReference='POD-001'
assert.throws(()=>validateOperations(data,order),/full client payment/)
data.payments.push(entry(28750))
validateOperations(data,order)
assert.equal(summarizeOperations(order,data).stage,'delivered')
assert.throws(()=>validateOperations({...data,payments:[...data.payments,entry(2,'')]},order),/payments require/)
assert.throws(()=>validateOperations(data,{...order,invoice_id:null}),/link the invoice/)
assert.throws(()=>validateOperations({...data,engineering:{...data.engineering,url:'javascript:alert(1)'}},order),/HTTPS/)
assert.throws(()=>validateOperations({...data,suppliers:[data.suppliers[0]]},order),/Both/)
console.log('Deposit, missing-cost semantics, locked baseline, supplier gates, VAT, refunds and delivery validation passed.')
if(!process.env.MANUFACTURING_TEST_DB_MODULE) process.exit(0)
const { PGlite }=await import(process.env.MANUFACTURING_TEST_DB_MODULE)
const db=new PGlite()
try {
 await db.exec(`create role anon;create role authenticated;create role service_role;create table sales_orders(id uuid primary key,status text,quote_snapshot jsonb,specifications_confirmed_at timestamptz,invoice_id uuid,updated_at timestamptz);create table sales_order_events(order_id uuid,action text,actor text,note text);`)
 const sql=await fs.readFile(new URL('../supabase/os_manufacturing_operations.sql',import.meta.url),'utf8')
 await db.exec(sql);await db.exec(sql)
 await db.query('insert into sales_orders values($1,$2,$3,now(),$4,now())',[order.id,order.status,order.quote_snapshot,order.invoice_id])
 const save=async(revision,d)=> (await db.query('select to_jsonb(save_manufacturing_operations($1,$2,$3,$4,$5)) as record',[order.id,revision,d,'info@smartsteel.co.za','Verified test update'])).rows[0].record
 let record=await save(0,emptyOperations())
 await assert.rejects(save(0,emptyOperations()),/changed/)
 await assert.rejects(db.query("update sales_orders set status='in_production' where id=$1",[order.id]),/deposit/)
 record=await save(1,frozen)
 await assert.rejects(db.query("update sales_orders set status='in_production' where id=$1",[order.id]),/supplier manufacturing/)
 await assert.rejects(db.query("update sales_orders set status='ready_for_dispatch' where id=$1",[order.id]),/suppliers, quality/)
 await assert.rejects(save(2,{...frozen,baseline:{...frozen.baseline,structure:1}}),/locked/)
 await assert.rejects(db.query("update sales_orders set status='delivered' where id=$1",[order.id]),/balance/)
 record=await save(2,data)
 assert.equal(record.revision,3)
 assert.equal((await db.query('select status from sales_orders where id=$1',[order.id])).rows[0].status,'delivered')
 await assert.rejects(save(3,{...data,deliveryReference:'changed'}),/cannot be overwritten/)
 assert.equal((await db.query('select count(*)::int n from manufacturing_operation_events')).rows[0].n,3)
 await db.exec('set role authenticated')
 await assert.rejects(db.query('select * from manufacturing_operations'),/permission denied/)
 await assert.rejects(save(3,data),/permission denied/)
 console.log('SQL reapply, revision conflicts, immutable baseline, stage bypass protection, delivery and RLS passed.')
} finally {await db.close()}
