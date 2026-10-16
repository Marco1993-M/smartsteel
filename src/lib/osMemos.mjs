export const MEMO_FIELDS = [
  ["proposal", "Proposal", "What are we suggesting, and what decision do we need?"],
  ["context", "Context", "Why does this matter now?"],
  ["evidence", "Evidence and assumptions", "Separate verified facts from assumptions and unanswered questions."],
  ["options", "Options and recommendation", "Include the option of keeping things as they are."],
  ["risks", "Risks and implications", "Consider cost, capacity, customer impact and dependencies."],
  ["next_steps", "Proposed next steps", "What would implementation involve, and how would we measure success?"],
]
export const MEMO_STATUSES = { draft: "Draft", discussion: "In discussion", decided: "Decision recorded", implementing: "In implementation", closed: "Closed" }
export const MEMO_DECISIONS = { approved: "Proceed", deferred: "Deferred", not_proceeding: "Not proceeding" }
export function emptyMemo() { return { title: "", content: Object.fromEntries(MEMO_FIELDS.map(([key]) => [key, ""])), editor_emails: [], decision_owner_email: "" } }
export function canEditMemo(memo, email) { return ["draft", "discussion"].includes(memo.status) && (memo.author_email === email || email === "info@smartsteel.co.za" || memo.editor_emails.includes(email)) }
export function validateMemoContent(content) { return content && typeof content === "object" && !Array.isArray(content) && Object.keys(content).every((key) => MEMO_FIELDS.some(([name]) => name === key)) && Object.values(content).every((value) => typeof value === "string" && value.length <= 12000) }
