import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppShell from "../components/AppShell";
import AnnouncementBanner from "../components/AnnouncementBanner";

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
    default: "Smart Steel | Warehouses, Solar Carports & Steel Systems",
    template: "%s | Smart Steel",
  },
  description:
    "Smart Steel designs and supplies lightweight steel warehouses, CFLC DIY kits, solar carports, and steel building systems across South Africa.",
  icons: {
    icon: [
      { url: "/favicon/favicon.ico", sizes: "any" },
      { url: "/favicon/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: "/favicon/apple-touch-icon.png",
  },
  manifest: "/favicon/site.webmanifest",
  openGraph: {
    title: "Smart Steel | Warehouses, Solar Carports & Steel Systems",
    description:
      "Explore Smart Steel lightweight steel warehouses, CFLC DIY kits, solar carports, and steel systems built for South African projects.",
    url: "https://www.smartsteel.co.za",
    siteName: "Smart Steel",
    locale: "en_ZA",
    type: "website",
    images: [
      {
        url: "/images/hero.webp",
        width: 1200,
        height: 630,
        alt: "Smart Steel warehouses, solar carports and steel systems",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Smart Steel | Warehouses, Solar Carports & Steel Systems",
    description:
      "Explore Smart Steel lightweight steel warehouses, CFLC DIY kits, solar carports, and steel systems for South African projects.",
    images: ["/images/hero.webp"],
  },
};



export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/*<AnnouncementBanner />*/}
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
