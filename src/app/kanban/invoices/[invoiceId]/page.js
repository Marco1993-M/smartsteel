import InvoicePrintPageClient from "./InvoicePrintPageClient"

export default async function InvoicePrintPage({ params }) {
  const { invoiceId } = await params

  return <InvoicePrintPageClient invoiceId={invoiceId} />
}
