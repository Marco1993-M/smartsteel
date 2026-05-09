import ContactPageClient from "./ContactPageClient";

export const metadata = {
  title: "Contact Smart Steel | Warehouse, Solar & Truss Enquiries",
  description:
    "Contact Smart Steel for warehouse, solar carport, truss, and steel structure enquiries across South Africa.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact Smart Steel",
    description:
      "Get in touch with Smart Steel for warehouse, solar carport, truss, and steel structure enquiries.",
    url: "https://www.smartsteel.co.za/contact",
    siteName: "Smart Steel",
    locale: "en_ZA",
    type: "website",
  },
};

export default function Page() {
  return <ContactPageClient />;
}
