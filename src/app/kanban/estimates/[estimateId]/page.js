import EstimatePrintPageClient from "./EstimatePrintPageClient"

export default async function EstimatePrintPage({ params }) {
  const { estimateId } = await params

  return <EstimatePrintPageClient estimateId={estimateId} />
}
