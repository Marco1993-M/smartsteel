import { NextResponse } from 'next/server'
import { getOsRequestContext } from 'lib/osRouteAuth'
import { supabaseServer } from 'lib/supabase-server'
import { sendSalesOrderConfirmation } from 'lib/salesOrderConfirmation'

export const runtime = 'nodejs'
export const maxDuration = 60
export const dynamic = 'force-dynamic'

export async function GET(request) {
  const auth = await getOsRequestContext(request)
  if (auth.response) return auth.response
  const records = []
  for (let from = 0; ; from += 500) {
    const { data, error } = await supabaseServer.from('sales_orders').select('*').order('created_at', { ascending: false }).order('id').range(from, from + 499)
    if (error) return NextResponse.json({ error: 'Customer orders could not be loaded. Check that the quote-acceptance migration has been applied.' }, { status: 503 })
    records.push(...data)
    if (data.length < 500) break
  }
  const leadIds = [...new Set(records.filter((order) => order.status === 'awaiting_invoice').map((order) => order.lead_id))]
  const invoices = []
  for (let index = 0; index < leadIds.length; index += 100) {
    const { data, error } = await supabaseServer.from('invoices').select('id, lead_id, invoice_number, reference_no, created_at, total').in('lead_id', leadIds.slice(index, index + 100)).order('created_at', { ascending: false })
    if (error) return NextResponse.json({ records, invoices: [], invoiceWarning: 'Invoices could not be loaded. Refresh before linking an invoice.' })
    invoices.push(...data)
  }
  return NextResponse.json({ records, invoices })
}

export async function PATCH(request) {
  const auth = await getOsRequestContext(request)
  if (auth.response) return auth.response
  let body
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }) }
  if (!/^[0-9a-f-]{36}$/i.test(body.id || '') || typeof body.action !== 'string' || String(body.note || '').length > 4000) return NextResponse.json({ error: 'Invalid order update.' }, { status: 400 })
  if (body.action === 'retry_confirmation') {
    const { data: order, error } = await supabaseServer.from('sales_orders').select('*').eq('id', body.id).single()
    if (error || !order) return NextResponse.json({ error: 'Order not found.' }, { status: 404 })
    const result = await sendSalesOrderConfirmation(order, { manualRetry: true })
    return NextResponse.json({ success: result.sent, error: result.sent ? null : 'Confirmation is still pending. Check the email service before retrying.' }, { status: result.sent ? 200 : 502 })
  }
  if (body.confirmed !== true) return NextResponse.json({ error: 'Confirm the order action before continuing.' }, { status: 400 })
  const { data, error } = await supabaseServer.rpc('advance_sales_order', {
    p_id: body.id, p_expected_status: String(body.expectedStatus || ''), p_action: body.action,
    p_note: String(body.note || '').trim(), p_invoice_id: body.invoiceId || null,
    p_actor: auth.user.email,
  })
  if (error) return NextResponse.json({ error: error.code === 'P0001' ? error.message : 'Order update failed. Refresh and try again.' }, { status: error.code === 'P0001' ? 409 : 500 })
  return NextResponse.json({ record: Array.isArray(data) ? data[0] : data })
}
