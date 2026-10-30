import { NextResponse } from 'next/server'
import { getOsRequestContext } from 'lib/osRouteAuth'
import { supabaseServer } from 'lib/supabase-server'
import { validateOperations } from 'lib/manufacturingOperations.mjs'
export const dynamic = 'force-dynamic'
const json = (body, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'private, no-store' } })
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
async function allRows(table, fields, sort) {
  const rows = []
  for (let from = 0; ; from += 500) {
    const { data, error } = await supabaseServer.from(table).select(fields).order(sort).range(from, from + 499)
    if (error) throw error
    rows.push(...data)
    if (data.length < 500) return rows
  }
}
export async function GET(request) {
  const auth = await getOsRequestContext(request)
  if (auth.response) return auth.response
  try {
    const id = new URL(request.url).searchParams.get('orderId')
    if (id) {
      if (!uuid.test(id)) return json({ error: 'Invalid order.' }, 400)
      const { data, error } = await supabaseServer.from('manufacturing_operation_events').select('revision,actor,note,created_at,data').eq('order_id', id).order('revision', { ascending: false }).limit(50)
      if (error) throw error
      return json({ events: data })
    }
    const [orders, operations, leads, estimates] = await Promise.all([
      allRows('sales_orders', '*', 'id'), allRows('manufacturing_operations', '*', 'order_id'),
      allRows('leads', 'id,name,last_name,status', 'id'),
      allRows('estimates', 'id,lead_id,status,title,created_at', 'id'),
    ])
    const historicalResult = await supabaseServer.from('historical_project_completions').select('*')
    // The one-off historical backfill is optional; older installations still load.
    if (historicalResult.error && !['42P01', 'PGRST205'].includes(historicalResult.error.code)) throw historicalResult.error
    const historical = historicalResult.data || []
    const completedLeads = new Set(historical.map(row => row.lead_id))
    const historicalProjects = historical.map(row => ({ ...row, lead: leads.find(lead => lead.id === row.lead_id) }))
    const handed = new Set(orders.map(order => order.estimate_id))
    const leadOrders = new Set(orders.map(order => order.lead_id))
    const pendingHandoffs = leads.filter(lead => {
      const completed = historical.find(project => project.lead_id === lead.id)
      return (lead.status === 'won' && !leadOrders.has(lead.id) && !completedLeads.has(lead.id)) || estimates.some(estimate =>
        estimate.lead_id === lead.id && estimate.status === 'accepted' && !handed.has(estimate.id) &&
        (!completed || new Date(estimate.created_at) > new Date(completed.confirmed_at)))
    })
    const byId = new Map(operations.map((row) => [row.order_id, row]))
    return json({ pendingHandoffs, historicalProjects, records: orders.sort((a,b) => b.accepted_at.localeCompare(a.accepted_at)).map((order) => ({ ...order, operations: byId.get(order.id) || null })) })
  } catch (error) {
    const setup = ['42P01','PGRST205','PGRST202'].includes(error.code)
    return json({ error: setup ? 'Manufacturing needs database setup. Apply supabase/os_manufacturing_operations.sql before using the new workspace.' : 'Manufacturing orders could not be loaded. Please retry.', setupRequired: setup }, 503)
  }
}
export async function PUT(request) {
  const auth = await getOsRequestContext(request)
  if (auth.response) return auth.response
  let body
  try { const raw = await request.text(); if (raw.length > 150000) return json({ error: 'This update is too large.' }, 413); body = JSON.parse(raw) } catch { return json({ error: 'Invalid update.' }, 400) }
  if (!uuid.test(body?.id || '') || !Number.isInteger(body.revision) || body.revision < 0 || typeof body.note !== 'string' || body.note.trim().length < 5 || body.note.length > 2000) return json({ error: 'Add an update note (5–2,000 characters).' }, 400)
  const [{ data: order, error }, { data: existing, error: loadError }] = await Promise.all([supabaseServer.from('sales_orders').select('*').eq('id', body.id).maybeSingle(), supabaseServer.from('manufacturing_operations').select('*').eq('order_id', body.id).maybeSingle()])
  if (error || loadError) return json({ error: 'Could not verify this order. Check database setup and reload.' }, 503)
  if (!order) return json({ error: 'Order not found.' }, 404)
  try { validateOperations(body.data, order, existing?.data) } catch (failure) { return json({ error: failure.message }, 400) }
  const result = await supabaseServer.rpc('save_manufacturing_operations', { p_id: body.id, p_revision: body.revision, p_data: body.data, p_actor: auth.user.email, p_note: body.note.trim() })
  if (result.error) return json({ error: result.error.code === 'P0001' ? result.error.message : 'The update could not be saved. Reload and check your entries.' }, result.error.code === 'P0001' ? 409 : 500)
  return json({ record: result.data })
}
