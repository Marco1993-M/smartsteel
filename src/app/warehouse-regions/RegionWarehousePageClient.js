"use client";

import { useMemo, useState } from "react";
import {
  buildRegionWarehouseContent,
  getRegionWarehouseConfigs,
} from "./regionWarehouseData";
import AtlasRegionWarehouseExperience from "./AtlasRegionWarehouseExperience";

export default function RegionWarehousePageClient({ citySlug }) {
  const content = buildRegionWarehouseContent(citySlug);
  const [selectedWidth, setSelectedWidth] = useState(8);
  const [selectedLength, setSelectedLength] = useState(20);

  const regionLinks = useMemo(
    () =>
      getRegionWarehouseConfigs()
        .filter((region) => region.citySlug !== citySlug)
        .sort((a, b) => {
          const relevance = (region) => content.nearby.includes(region.name) ? 0 : region.province === content.province ? 1 : 2;
          return relevance(a) - relevance(b);
        })
        .map((region) => ({
          href: `/${region.legacySlug}`,
          label: `Steel Warehouses ${region.name}`,
        })),
    [citySlug, content.nearby, content.province]
  );

  const buildSizeBuilderHref = (width, length) => {
    if (!content.prefillBuilderDimensions) return content.pricePath;

    const separator = content.pricePath.includes("?") ? "&" : "?";
    return `${content.pricePath}${separator}width=${width}&length=${length}&height=${width >= 10 ? 4.5 : 3}&steelFinish=Galv`;
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: content.faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://www.smartsteel.co.za/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: content.breadcrumbSectionName,
        item: "https://www.smartsteel.co.za/warehouses",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `Steel Warehouses ${content.name}`,
        item: `https://www.smartsteel.co.za/${content.legacySlug}`,
      },
    ],
  };

  return (
    <AtlasRegionWarehouseExperience
      content={content}
      selectedWidth={selectedWidth}
      setSelectedWidth={setSelectedWidth}
      selectedLength={selectedLength}
      setSelectedLength={setSelectedLength}
      buildSizeBuilderHref={buildSizeBuilderHref}
      faqSchema={faqSchema}
      breadcrumbSchema={breadcrumbSchema}
      regionLinks={regionLinks}
    />
  );
}
