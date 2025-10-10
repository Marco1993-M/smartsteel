// app/layout.js
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SalePopup from "../components/SalePopup";
import AnnouncementBanner from "../components/AnnouncementBanner";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL("https://www.smartsteel.co.za"),
  title: {
    default: "Smart Steel | Lightweight Steel Warehouses",
    template: "%s | Smart Steel",
  },
  description:
    "Smart Steel designs and builds lightweight steel warehouses across South Africa. Fast, durable, and cost-effective solutions for sustainable construction.",
  keywords: [
    "lightweight steel warehouses",
    "steel structures",
    "lightweight steel",
    "modular buildings",
    "warehouse kits",
    "steel sheds",
    "solar panel mounting structures",
    "prefab steel buildings",
    "South Africa",
    "Smart Steel",
  ],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title:
      "Smart Steel | Premium Light Weight Steel Structures & Warehousing Solutions",
    description:
      "High-quality lightweight steel structures, modular sheds, and warehouse kits across South Africa.",
    url: "https://www.smartsteel.co.za",
    siteName: "Smart Steel",
    images: [
      {
        url: "/smartsteel.jpg",
        width: 1200,
        height: 630,
        alt: "Smart Steel – Lightweight Steel Structures",
      },
    ],
    locale: "en_ZA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Smart Steel | Premium Light Weight Steel Structures & Warehousing Solutions",
    description:
      "High-quality lightweight steel structures, modular sheds, and warehouse kits across South Africa.",
    images: ["/favicon.png"],
  },
  icons: {
    icon: [
      { url: "/favicon/favicon.ico", sizes: "any" },
      { url: "/favicon/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: "/favicon/apple-touch-icon.png",
  },
  manifest: "/favicon/site.webmanifest",
  verification: {
    google: "PHZurmEVfVH4LcziY1ERgqZNLYs4EtmktPLXB5tPdB0",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Smart Steel",
  url: "https://www.smartsteel.co.za",
  logo: "https://www.smartsteel.co.za/logo.png",
  sameAs: ["https://www.facebook.com/profile.php?id=100091390116080"],
  description:
    "Smart Steel designs and supplies modular steel structures in South Africa. Fast, affordable, and high quality.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "869 29th Avenue",
    addressLocality: "Pretoria",
    addressRegion: "Gauteng",
    postalCode: "0084",
    addressCountry: "ZA",
  },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+27-82-123-4567",
    contactType: "Customer Service",
    areaServed: "ZA",
    availableLanguage: ["en", "af"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <head>
        {/* Google tag (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-17629050810"
          strategy="afterInteractive"
        />
        <Script
          id="google-ads-tag"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'AW-17629050810');
            `,
          }}
        />
      </head>

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-full flex flex-col`}
      >
        {/* Global JSON-LD */}
        <Script
          id="ld-org"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />

        {/* <AnnouncementBanner /> */}
        <Navbar />
        {children}
        <Footer />
        <SalePopup />
      </body>
    </html>
  );
}
