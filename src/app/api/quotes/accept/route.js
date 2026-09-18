import { NextResponse } from 'next/server'
import { supabaseServer } from 'lib/supabase-server'
import { validateAcceptance, ACCEPTANCE_TERMS_VERSION, ACCEPTANCE_NEXT_STEPS, ACCEPTANCE_NOTICE } from 'lib/quoteAcceptance.mjs'
import { ESTIMATE_TERMS, ESTIMATE_DELIVERY_TERMS, ESTIMATE_EXCLUSIONS } from 'lib/estimates/estimateDocument'
import { sendSalesOrderConfirmation } from 'lib/salesOrderConfirmation'

export const runtime = 'nodejs'
export const maxDuration = 60
export const dynamic = 'force-dynamic'

export async function POST(request) {
  let input
  try { input = validateAcceptance(await request.json()) }
  catch (error) { return NextResponse.json({ error: error.message }, { status: 400 }) }
  const { data, error } = await supabaseServer.rpc('accept_customer_quote', {
    p_token: input.token, p_expected_updated_at: input.expectedUpdatedAt,
    p_name: input.name, p_email: input.email, p_po_reference: input.poReference,
    p_terms_version: ACCEPTANCE_TERMS_VERSION,
    p_terms: { terms: ESTIMATE_TERMS, delivery: ESTIMATE_DELIVERY_TERMS, exclusions: ESTIMATE_EXCLUSIONS, nextSteps: ACCEPTANCE_NEXT_STEPS, notice: ACCEPTANCE_NOTICE },
  })
  if (error) {
    const expected = error.code === 'P0001'
    return NextResponse.json({ error: expected ? error.message : 'Acceptance could not be recorded. Please try again or contact Smart Steel.' }, { status: expected ? 409 : 503 })
  }
  const order = Array.isArray(data) ? data[0] : data
  if (!order?.id) return NextResponse.json({ error: 'Could not confirm the saved order. Reload the quote before trying again.' }, { status: 503 })
  // Database work is already committed. A mail failure must not lose or duplicate an order.
  const confirmation = await sendSalesOrderConfirmation(order)
  return NextResponse.json({ orderNumber: order.order_number, status: order.status, confirmationSent: confirmation.sent })
}
