import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SalePopup from "../components/SalePopup";
import AnnouncementBanner from "../components/AnnouncementBanner";
import Head from "next/head";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Smart Steel",
  description: "Smarter, modular steel construction.",
  icons: {
    icon: [
      { url: "/favicon/favicon.ico", sizes: "any" },
      { url: "/favicon/favicon-96x96.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/favicon/apple-touch-icon.png",
  },
  manifest: "/favicon/site.webmanifest",
  openGraph: {
    title: "Smart Steel",
    description: "Explore our lightweight steel structures and prefab kits.",
    images: [
      {
        url: "/logo-512x512.png",
        width: 1200,
        height: 630,
        alt: "Smart Steel Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Smart Steel",
    description: "Explore our lightweight steel structures and prefab kits.",
    images: ["/logo-512x512.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <Head>
  {/* Organization Schema */}
  <script type="application/ld+json" dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Smart Steel",
      "url": "https://www.smartsteel.co.za",
      "logo": "https://www.smartsteel.co.za/logo.png",
      "sameAs": [
        "https://www.facebook.com/smartsteelsa",
        "https://www.instagram.com/smartsteelsa"
      ],
      "description": "Smart Steel designs and supplies modular steel structures in South Africa. Fast, affordable, and high quality.",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "123 Industrial Ave",
        "addressLocality": "Pretoria",
        "addressRegion": "Gauteng",
        "postalCode": "0181",
        "addressCountry": "ZA"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+27-82-123-4567",
        "contactType": "Customer Service",
        "areaServed": "ZA",
        "availableLanguage": ["en", "af"]
      }
    })
  }} />

  {/* Product Schema: 8m Warehouse */}
  <script type="application/ld+json" dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Product",
      "name": "8m Wide Modular Steel Warehouse",
      "description": "Modular warehouse structure, 8 meters wide, customizable length, made with high-quality galvanized steel.",
      "brand": "Smart Steel",
      "sku": "WH-8M",
      "offers": {
        "@type": "Offer",
        "priceCurrency": "ZAR",
        "price": "69000",
        "availability": "https://schema.org/InStock",
        "url": "https://www.smartsteel.co.za"
      }
    })
  }} />

  {/* Product Schema: 10m Warehouse */}
  <script type="application/ld+json" dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Product",
      "name": "10m Wide Modular Steel Warehouse",
      "description": "10-meter wide steel warehouse solution, modular design, quick installation, ideal for storage or commercial use.",
      "brand": "Smart Steel",
      "sku": "WH-10M",
      "offers": {
        "@type": "Offer",
        "priceCurrency": "ZAR",
        "price": "89000",
        "availability": "https://schema.org/InStock",
        "url": "https://www.smartsteel.co.za"
      }
    })
  }} />

  {/* Product Schema: 12m Warehouse */}
  <script type="application/ld+json" dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Product",
      "name": "12m Wide Modular Steel Warehouse",
      "description": "12-meter wide modular steel warehouse, strong, scalable, and ideal for agricultural or industrial use.",
      "brand": "Smart Steel",
      "sku": "WH-12M",
      "offers": {
        "@type": "Offer",
        "priceCurrency": "ZAR",
        "price": "105000",
        "availability": "https://schema.org/InStock",
        "url": "https://www.smartsteel.co.za"
      }
    })
  }} />
</Head>

      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AnnouncementBanner />
        <Navbar />
        {children}
        <Footer />
        {/* <SalePopup /> */}
      </body>
    </html>
  );
}
