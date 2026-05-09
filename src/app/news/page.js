import NewsPageClient from "./NewsPageClient";

export const metadata = {
  title: "Smart Steel News & Events",
  description:
    "Read the latest Smart Steel news, project updates, steel building articles, and company announcements.",
  alternates: {
    canonical: "/news",
  },
  openGraph: {
    title: "Smart Steel News & Events",
    description:
      "Read the latest Smart Steel news, project updates, and lightweight steel building articles.",
    url: "https://www.smartsteel.co.za/news",
    siteName: "Smart Steel",
    locale: "en_ZA",
    type: "website",
  },
};

export default function Page() {
  return <NewsPageClient />;
}
