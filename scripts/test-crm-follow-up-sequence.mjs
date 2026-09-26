import assert from "node:assert/strict"
import {
  buildFollowUpCopy,
  buildFollowUpHtml,
  getFollowUpPlan,
  getNextFollowUpAt,
} from "../src/lib/crmEstimateFollowUps.js"

const plan = getFollowUpPlan()
assert.deepEqual(plan.map((step) => step.businessDays), [2, 5, 7])

const sentAt = "2026-09-14T10:00:00.000Z"
const first = getNextFollowUpAt(sentAt, 1)
const second = getNextFollowUpAt(first, 2)
const third = getNextFollowUpAt(second, 3)
assert.equal(first, "2026-09-16T06:00:00.000Z")
assert.equal(second, "2026-09-23T06:00:00.000Z")
assert.equal(third, "2026-10-02T06:00:00.000Z")

const lead = { name: "Robert", last_name: "Coutts Website Enquiry" }
const estimate = { title: "Custom Solar Structure", version_no: 1 }
const copies = [1, 2, 3].map((stepNumber) => buildFollowUpCopy({ stepNumber, lead, estimate }))
assert.equal(new Set(copies.map((copy) => copy.heading)).size, 3)
assert.match(copies[0].body, /Good day Robert Coutts,/)
assert.doesNotMatch(copies[0].body, /Website Enquiry/i)
assert.equal(copies[1].showProof, true)
assert.match(copies[2].body, /final scheduled follow-up/i)

const proofHtml = buildFollowUpHtml({
  copy: copies[1],
  estimate,
  shareUrl: "https://www.smartsteel.co.za/quotes/test",
  responseBaseUrl: "https://www.smartsteel.co.za/estimate-response/test",
  isAtlas: false,
})
assert.match(proofHtml, /https:\/\/www\.smartsteel\.co\.za\/recent/)
assert.match(proofHtml, /View estimate/)

console.log("CRM acknowledgement strategy, 2/7/14 cadence, distinct follow-up purposes and proof link verified.")
