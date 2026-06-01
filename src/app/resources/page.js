import ResourcesPageClient from "./ResourcesPageClient";

export const metadata = {
  title: "Resources | Smart Steel",
  description:
    "Technical brochures, downloads, and support resources from Smart Steel.",
  alternates: {
    canonical: "/resources",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function Page() {
  return <ResourcesPageClient />;
}
