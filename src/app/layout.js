// app/layout.js or app/layout.tsx
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppChrome from "@/components/AppChrome";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "600"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Pequeno Home | Pequeño Lightweight Steel Homes South Africa",
  description:
    "Pequeno Home, also styled Pequeño, designs and builds architect-led modular lightweight steel homes in South Africa with precision, speed, and considered architectural detail.",
  keywords: [
    "Pequeno",
    "Pequeno Home",
    "Pequeño",
    "lightweight steel homes",
    "steel construction",
    "eco-friendly housing",
    "affordable steel homes",
    "Pequeño homes",
    "modern prefab",
    "Prefab homes",
    "Steel homes",
    "Modular steel homes",
    "Sustainable modular homes",
    "Modern prefab houses",
    "Modular lightweight steel homes in South Africa",
    "Affordable modular steel homes for families",
    "Fast-build sustainable steel frame houses",
  ],
  authors: [{ name: "Pequeño Team", url: "https://www.pequenohome.com" }],
  creator: "Pequeño",
  metadataBase: new URL("https://www.pequenohome.com"),
  openGraph: {
    title: "Pequeno Home | Pequeño Lightweight Steel Homes South Africa",
    description:
      "Discover architect-led lightweight steel homes, prefab-style builds, and modular steel homes designed for South African conditions.",
    url: "https://www.pequenohome.com",
    siteName: "Pequeño",
    images: [
      {
        url: "https://www.pequenohome.com/images/modular-hero.jpg",
        width: 1600,
        height: 900,
        alt: "Pequeño lightweight steel home architecture",
      },
    ],
    locale: "en_ZA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pequeno Home | Pequeño Lightweight Steel Homes South Africa",
    description:
      "Discover architect-led lightweight steel homes and modular steel homes designed for South African conditions.",
    images: ["https://www.pequenohome.com/images/modular-hero.jpg"],
    creator: "@pequeno", // Update or remove if not using Twitter
  },
  icons: {
    icon: [
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.ico",
  },
  manifest: "/site.webmanifest",
  appleWebApp: {
    title: "Pequeño",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased text-gray-900`}
      >
        <AppChrome>{children}</AppChrome>
      </body>
    </html>
  );
}
