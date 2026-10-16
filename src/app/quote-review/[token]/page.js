import QuoteReviewBooking from "../../../components/quotes/QuoteReviewBooking"
export const metadata = { title: "Book a quote review | Smart Steel", robots: { index: false, follow: false }, referrer: "no-referrer" }
export default async function QuoteReviewPage({ params }) {
  const { token } = await params
  return <QuoteReviewBooking token={token} />
}
