import { supabaseServer } from './supabase-server'
import { ACCEPTANCE_NEXT_STEPS, ACCEPTANCE_NOTICE } from './quoteAcceptance.mjs'
const escape = (value) => String(value || '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]))

export async function sendSalesOrderConfirmation(order, { manualRetry = false } = {}) {
  if (order.confirmation_sent_at) return { sent: true }
  if (order.status === 'cancelled') return { sent: false }
  if (!manualRetry && Date.now() - Date.parse(order.created_at) > 23 * 60 * 60 * 1000) return { sent: false }
  // Resend deduplicates this fixed key for 24 hours. Older failures require an internal retry.
  if (!process.env.RESEND_API_KEY) return { sent: false }
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json', 'Idempotency-Key': `quote-accepted-${order.id}` },
      body: JSON.stringify({
        from: process.env.CLIENT_CONFIRMATION_FROM || 'Smart Steel <info@smartsteel.co.za>',
        to: [order.recipient_email], reply_to: 'info@smartsteel.co.za',
        subject: `Acceptance received — ${order.order_number}`,
        html: `<div style="max-width:620px;margin:auto;font-family:Arial,sans-serif;color:#0f172a;line-height:1.7;padding:24px"><h1>Your acceptance has been received.</h1><p>Thank you, ${escape(order.accepted_by_name)}.</p><p>Your order reference is <strong>${escape(order.order_number)}</strong>, for ${escape(order.quote_snapshot.title)} (V${Number(order.quote_snapshot.version_no)}).</p><p>Accepted total including VAT: <strong>R ${(Number(order.quote_snapshot.total) * 1.15).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>.</p><h2>What happens next?</h2><ol>${ACCEPTANCE_NEXT_STEPS.map((step) => `<li><strong>${escape(step.title)}</strong><br>${escape(step.text)}</li>`).join('')}</ol><p><strong>${escape(ACCEPTANCE_NOTICE)}</strong></p><p>Reply to this email if you need to change anything.<br>Smart Steel · info@smartsteel.co.za · +27 82 846 4555</p></div>`,
      }),
      signal: AbortSignal.timeout(15000),
    })
    if (!response.ok) throw new Error('Email provider did not accept the confirmation.')
    const { error } = await supabaseServer.from('sales_orders').update({ confirmation_sent_at: new Date().toISOString(), confirmation_error: null }).eq('id', order.id)
    if (error) throw new Error('Email sent; delivery receipt could not be saved.')
    return { sent: true }
  } catch (error) {
    await supabaseServer.from('sales_orders').update({ confirmation_error: error.message }).eq('id', order.id)
    return { sent: false }
  }
}

export async function retryPendingOrderConfirmations() {
  if (!process.env.RESEND_API_KEY) return { sent: 0, pending: true }
  const { data, error } = await supabaseServer.from('sales_orders').select('*')
    .is('confirmation_sent_at', null).neq('status', 'cancelled')
    .gte('created_at', new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: true }).limit(3)
  if (error) return { sent: 0, error: 'Pending order confirmations could not be loaded.' }
  const outcomes = await Promise.all((data || []).map((order) => sendSalesOrderConfirmation(order)))
  return { sent: outcomes.filter((outcome) => outcome.sent).length, attempted: outcomes.length }
}
