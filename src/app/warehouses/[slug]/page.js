import { notFound } from "next/navigation";
import WarehouseDetailPageClient from "./WarehouseDetailPageClient";
import { warehouses } from "../../../components/warehouse-catalogue-data";

function getWarehouseBySlug(slug) {
  return warehouses.find((warehouse) => warehouse.slug === slug) || null;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const warehouse = getWarehouseBySlug(slug);

  if (!warehouse) {
    return {
      title: "Warehouse Not Found | Smart Steel",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return {
    title: `${warehouse.name} | Smart Steel`,
    description:
      warehouse.description?.slice(0, 155) ||
      `${warehouse.name} from Smart Steel. Explore sizes, features, and next steps for this steel structure.`,
    alternates: {
      canonical: `/warehouses/${warehouse.slug}`,
    },
    openGraph: {
      title: `${warehouse.name} | Smart Steel`,
      description:
        warehouse.description?.slice(0, 155) ||
        `${warehouse.name} from Smart Steel.`,
      url: `https://www.smartsteel.co.za/warehouses/${warehouse.slug}`,
      siteName: "Smart Steel",
      locale: "en_ZA",
      type: "website",
      images: warehouse.image
        ? [
            {
              url: warehouse.image,
              alt: warehouse.name,
            },
          ]
        : [],
    },
  };
}

export default async function Page({ params }) {
  const { slug } = await params;
  const warehouse = getWarehouseBySlug(slug);

  if (!warehouse) {
    notFound();
  }

  return <WarehouseDetailPageClient params={params} />;
}
