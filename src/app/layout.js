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

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Smart Steel",
  url: "https://www.smartsteel.co.za",
  logo: "https://www.smartsteel.co.za/logo.png",
  sameAs: [
    "https://www.facebook.com/smartsteelsa",
    "https://www.instagram.com/smartsteelsa"
  ],
  description: "Smart Steel designs and supplies modular steel structures in South Africa. Fast, affordable, and high quality.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "123 Industrial Ave",
    addressLocality: "Pretoria",
    addressRegion: "Gauteng",
    postalCode: "0181",
    addressCountry: "ZA"
  },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+27-82-123-4567",
    contactType: "Customer Service",
    areaServed: "ZA",
    availableLanguage: ["en", "af"]
  },
  makesOffer: [
    {
      "@type": "Product",
      name: "8m Wide Warehouse",
      description: "Modular warehouse 8m wide, customizable length.",
      brand: "Smart Steel"
    },
    {
      "@type": "Product",
      name: "10m Wide Warehouse",
      description: "Modular warehouse 10m wide, customizable length.",
      brand: "Smart Steel"
    },
    {
      "@type": "Product",
      name: "12m Wide Warehouse",
      description: "Modular warehouse 12m wide, customizable length.",
      brand: "Smart Steel"
    }
  ]
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
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
