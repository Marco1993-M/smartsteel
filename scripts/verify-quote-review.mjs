import assert from "node:assert/strict"
import fs from "node:fs/promises"
import { randomUUID } from "node:crypto"
import { reviewSlots, validReviewSlot, reviewMailApplies, reviewInvitationHtml } from "../src/lib/quoteReview.mjs"

const friday = new Date("2026-10-16T10:01:00+02:00")
const slots = reviewSlots(friday)
assert.equal(slots[0].date, "2026-10-16")
assert.equal(slots[0].slots[0], "2026-10-16T11:00:00.000Z") // 13:00 SAST, with two hours' notice.
assert.equal(slots.some((day) => [0, 6].includes(new Date(`${day.date}T12:00:00Z`).getUTCDay())), false)
assert.equal(validReviewSlot("2026-10-19T17:00:00+02:00", friday), false)
assert.equal(validReviewSlot("2026-10-19T08:30:00+02:00", friday), false)
assert.equal(validReviewSlot("2026-10-17T10:00:00+02:00", friday), false)
assert.equal(validReviewSlot("invalid", friday), false)
assert.equal(reviewSlots(friday, [slots[0].slots[0]])[0].slots.includes(slots[0].slots[0]), false)
const future = { revision: 2, status: "booked", starts_at: "2026-10-19T08:00:00+02:00" }
assert.equal(reviewMailApplies({ revision: 1, kind: "owner_reminder" }, future, friday), false)
assert.equal(reviewMailApplies({ revision: 2, kind: "owner_reminder" }, future, friday), true)
assert.equal(reviewMailApplies({ revision: 2, kind: "owner_reminder" }, { ...future, status: "cancelled" }, friday), false)
assert.equal(reviewMailApplies({ revision: 2, kind: "customer_cancellation" }, { ...future, status: "cancelled" }, friday), true)
assert.equal(reviewMailApplies({ revision: 2, kind: "owner_reminder" }, future, new Date("2026-10-20")), false)
assert.equal(reviewInvitationHtml("").length, 0)
assert.equal(reviewInvitationHtml('https://example.test/?x="<').includes('href="https://example.test/?x=&quot;&lt;"'), true)
console.log("Quote-review availability, timezone boundaries and stale-notification checks passed.")

if (!process.env.QUOTE_REVIEW_TEST_DB_MODULE) {
  console.log("Database tests: set QUOTE_REVIEW_TEST_DB_MODULE to a temporary @electric-sql/pglite installation to run the migration and lifecycle tests.")
  process.exit(0)
}
const { PGlite } = await import(process.env.QUOTE_REVIEW_TEST_DB_MODULE)
const db = new PGlite()
try {
  await db.exec(`
    create role anon; create role authenticated; create role service_role;
    create schema auth;
    create function auth.role() returns text language sql as $$ select coalesce(nullif(current_setting('test.auth_role',true),''),'service_role') $$;
    create table leads(id uuid primary key, name text,last_name text,email text,phone text,status text,follow_up_at timestamptz,next_action text);
    create table estimates(id uuid primary key,lead_id uuid references leads(id) on delete cascade,title text,version_no integer,status text,share_token uuid default gen_random_uuid());
    create table tasks(id uuid primary key default gen_random_uuid(),title text,due_date date,assignee text,priority text,completed boolean,notify_whole_team boolean);
    create table lead_activities(id uuid primary key default gen_random_uuid(),lead_id uuid,type text,user_name text,description text,timestamp timestamptz);
    create table crm_estimate_follow_up_sequences(id uuid primary key default gen_random_uuid(),lead_id uuid,estimate_id uuid,status text default 'active' constraint crm_estimate_follow_up_sequences_status_check check(status in ('active','cancelled','completed','failed')),next_send_at timestamptz,updated_at timestamptz);
  `)
  const sql = (await fs.readFile(new URL("../supabase/crm_quote_reviews.sql", import.meta.url), "utf8")).replace("create extension if not exists pgcrypto;", "")
  await db.exec(sql)
  await db.exec(sql) // Migration must be safe to reapply.
  const leadA = randomUUID(), leadB = randomUUID(), estimateA = randomUUID(), estimateB = randomUUID()
  await db.query("insert into leads(id,name,email,status) values($1,'Test A','a@example.test','quoted'),($2,'Test B','b@example.test','quoted')", [leadA, leadB])
  await db.query("insert into estimates(id,lead_id,title,version_no,status) values($1,$2,'Test proposal',1,'sent'),($3,$4,'Test B proposal',1,'sent')", [estimateA, leadA, estimateB, leadB])
  await db.query("insert into crm_estimate_follow_up_sequences(lead_id,estimate_id) values($1,$2)", [leadA, estimateA])
  const futureSlots = reviewSlots(new Date())[2].slots
  const call = async (id, slot, rev = null) => (await db.query("select crm_book_quote_review($1,$2,'+27820000000','Question','Africa/Johannesburg',$3) as review", [id, slot, rev])).rows[0].review
  const booked = await call(estimateA, futureSlots[0])
  assert.equal(booked.status, "booked")
  assert.equal((await call(estimateA, futureSlots[0])).id, booked.id)
  assert.equal((await db.query("select count(*)::integer as n from tasks where quote_review_id=$1", [booked.id])).rows[0].n, 1)
  assert.equal((await db.query("select status from crm_estimate_follow_up_sequences where lead_id=$1", [leadA])).rows[0].status, "paused")
  await assert.rejects(call(estimateB, futureSlots[0]), /taken/)
  await assert.rejects(call(estimateA, futureSlots[1]), /already booked/)
  const moved = await call(estimateA, futureSlots[1], booked.revision)
  assert.equal(moved.id, booked.id)
  assert.equal(moved.revision, 2)
  await assert.rejects(call(estimateA, futureSlots[2], 1), /changed/)
  // A new quote version must not restart generic emails or replace the booked snapshot.
  const revisionId = randomUUID()
  await db.query("insert into estimates(id,lead_id,title,version_no,status) values($1,$2,'Revised proposal',2,'sent')", [revisionId, leadA])
  await db.query("insert into crm_estimate_follow_up_sequences(lead_id,estimate_id,status) values($1,$2,'active')", [leadA, revisionId])
  assert.equal((await db.query("select status from crm_estimate_follow_up_sequences where estimate_id=$1", [revisionId])).rows[0].status, "paused")
  assert.equal((await db.query("select quote_version from crm_quote_reviews where id=$1", [booked.id])).rows[0].quote_version, 1)
  await db.query("select crm_block_quote_review_slot($1,'Unavailable')", [futureSlots[2]])
  await assert.rejects(call(estimateB, futureSlots[2]), /taken/)
  const other = await call(estimateB, futureSlots[0]) // Old slot was released by rescheduling.
  await assert.rejects(db.query("select crm_block_quote_review_slot($1,'Unavailable')", [futureSlots[0]]), /client is booked/)
  await assert.rejects(db.query("select crm_update_quote_review($1,'no_show','Marco',1)", [other.id]), /after the appointment/)
  const cancelled = (await db.query("select crm_update_quote_review($1,'cancel','Customer',1) as review", [other.id])).rows[0].review
  assert.equal(cancelled.status, "cancelled")
  assert.equal((await db.query("select completed from tasks where quote_review_id=$1", [other.id])).rows[0].completed, true)
  assert.equal((await db.query("select count(*)::integer as n from crm_quote_review_mail where review_id=$1 and revision=2 and kind like '%cancellation'", [other.id])).rows[0].n, 2)
  // Booked tasks cannot bypass the explicit outcome workflow through the old task editor.
  await db.exec("select set_config('test.auth_role','authenticated',false)")
  await assert.rejects(db.query("update tasks set completed=true where quote_review_id=$1", [booked.id]), /Manage this appointment/)
  await db.exec("select set_config('test.auth_role','service_role',false)")
  await db.query("update crm_quote_reviews set starts_at=now()-interval '1 hour' where id=$1", [booked.id])
  await assert.rejects(db.query("select crm_update_quote_review($1,'complete','Marco',2,'Discussed',null)", [booked.id]), /outcome/)
  await assert.rejects(db.query("select crm_update_quote_review($1,'complete','Marco',2,'Discussed','awaiting_decision')", [booked.id]), /next action/)
  const done = (await db.query("select crm_update_quote_review($1,'complete','Marco',2,'Scope confirmed','awaiting_decision','Call after site visit',now()+interval '7 days') as review", [booked.id])).rows[0].review
  assert.equal(done.status, "completed")
  assert.equal(done.follow_up_hold, true)
  assert.equal((await db.query("select completed from tasks where quote_review_id=$1", [booked.id])).rows[0].completed, true)
  const mailId = (await db.query("select id from crm_quote_review_mail where review_id=$1 and kind='owner_confirmation' limit 1", [booked.id])).rows[0].id
  assert.equal((await db.query("select crm_claim_quote_review_mail($1) as claimed", [mailId])).rows[0].claimed, true)
  assert.equal((await db.query("select crm_claim_quote_review_mail($1) as claimed", [mailId])).rows[0].claimed, false)
  await db.exec("set role authenticated")
  await assert.rejects(db.query("select * from crm_quote_reviews"), /permission denied/)
  await assert.rejects(db.query("select crm_book_quote_review($1,$2,'+27820000000','','Africa/Johannesburg',null)", [estimateB, futureSlots[3]]), /permission denied/)
  await db.exec("reset role")
  // Deleting a lead also removes active calls and pending emails, even through
  // the authenticated CRM path. Other leads and their booking history survive.
  const activeBeforeDelete = await call(estimateB, futureSlots[3])
  await db.exec("select set_config('test.auth_role','authenticated',false)")
  await db.query("delete from leads where id=$1", [leadB])
  for (const table of ["crm_quote_reviews", "crm_quote_review_events", "crm_quote_review_mail", "tasks"]) {
    const column = table === "crm_quote_reviews" ? "id" : table === "tasks" ? "quote_review_id" : "review_id"
    assert.equal((await db.query(`select count(*)::integer as n from ${table} where ${column}=any($1::uuid[])`, [[other.id, activeBeforeDelete.id]])).rows[0].n, 0)
  }
  assert.equal((await db.query("select count(*)::integer as n from crm_quote_reviews where id=$1", [booked.id])).rows[0].n, 1)
  const deletionSql = await fs.readFile(new URL("../supabase/crm_quote_review_lead_deletion.sql", import.meta.url), "utf8")
  await db.exec(deletionSql)
  await db.exec(deletionSql)
  console.log("Lead deletion cascades to calls, tasks, events and mail; unrelated bookings survive; standalone repair reapplies safely.")
  console.log("PostgreSQL migration/reapply, collision protection, idempotent booking, rescheduling, blocks, cancellation, outcomes, task protection, mail claims and access controls passed.")
} finally { await db.close() }
