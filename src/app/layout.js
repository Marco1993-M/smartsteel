import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SalePopup from "../components/SalePopup";

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
      { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
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

import AnnouncementBanner from "../components/AnnouncementBanner";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
         <AnnouncementBanner />
        <Navbar />
        {children}
        <Footer />
        <SalePopup />
      </body>
    </html>
  );
}
