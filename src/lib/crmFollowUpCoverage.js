export function isCoveredByAutomatedFollowUp(lead, sequencesByLead) {
  const sequence = sequencesByLead[String(lead?.id || "")]
  return sequence?.status === "active" && Boolean(sequence.next_send_at) && !sequence.last_error
}

export function indexLatestFollowUpSequences(sequences = []) {
  const latestByLead = {}

  for (const sequence of sequences) {
    const leadId = String(sequence?.lead_id || "")
    if (leadId && !latestByLead[leadId]) latestByLead[leadId] = sequence
  }

  return latestByLead
}
