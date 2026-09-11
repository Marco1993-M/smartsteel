export const metadata = {
  metadataBase: new URL("https://afgri.smartsteel.co.za"),
  title: {
    default: "AFGRI Atlas Partner Sales Portal",
    template: "%s | AFGRI Atlas Portal",
  },
  description:
    "The dedicated AFGRI and Smart Steel partner portal for Atlas product configuration, indicative pricing and quote requests.",
  robots: { index: false, follow: false },
  alternates: {
    canonical: "/partner",
  },
  openGraph: {
    title: "AFGRI Atlas Partner Sales Portal",
    description:
      "Configure Atlas structures, review indicative partner pricing and submit quote requests through the AFGRI and Smart Steel partnership.",
    url: "/partner",
    siteName: "AFGRI Atlas Partner Sales Portal",
    locale: "en_ZA",
    type: "website",
    images: [
      {
        url: "/afgri-atlas-partner-share.png",
        width: 1200,
        height: 630,
        alt: "AFGRI and Smart Steel Atlas Partner Sales Portal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AFGRI Atlas Partner Sales Portal",
    description:
      "Configure Atlas structures, review indicative partner pricing and submit quote requests.",
    images: ["/afgri-atlas-partner-share.png"],
  },
}

export default function PartnerLayout({ children }) {
  return children
}
