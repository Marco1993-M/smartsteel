import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
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
    default: "Smart Steel South Africa | Warehouses, Solar Carports & Steel Systems",
    template: "%s | Smart Steel",
  },
  description:
    "Smart Steel South Africa designs and supplies lightweight steel warehouses, CFLC DIY kits, solar carports, roof trusses, and steel building systems.",
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
    title: "Smart Steel South Africa | Warehouses, Solar Carports & Steel Systems",
    description:
      "Explore Smart Steel South Africa lightweight steel warehouses, CFLC DIY kits, solar carports, roof trusses, and steel systems.",
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
    title: "Smart Steel South Africa | Warehouses, Solar Carports & Steel Systems",
    description:
      "Explore Smart Steel South Africa lightweight steel warehouses, CFLC DIY kits, solar carports, roof trusses, and steel systems.",
    images: ["/images/hero.webp"],
  },
};



export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-17629050810"
          strategy="afterInteractive"
        />
        <Script id="google-ads-base-tag" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = window.gtag || gtag;
            gtag('js', new Date());
            gtag('config', 'AW-17629050810');
          `}
        </Script>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/*<AnnouncementBanner />*/}
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
