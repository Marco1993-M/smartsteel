// Accepted quote identity is authoritative. Superseded snapshots remain history.
export function pendingManufacturingHandoffs(leads, estimates, orders, historical = []) {
 const handed = new Set(orders.map(order => order.estimate_id))
 const orderedLeads = new Set(orders.map(order => order.lead_id))
 return leads.filter(lead => {
  const completed = historical.find(project => project.lead_id === lead.id)
  return (lead.status === 'won' && !orderedLeads.has(lead.id) && !completed) || estimates.some(estimate =>
   estimate.lead_id === lead.id && estimate.status === 'accepted' && !estimate.won_superseded_by && !handed.has(estimate.id) &&
   (!completed || new Date(estimate.created_at) > new Date(completed.confirmed_at)))
 })
}
