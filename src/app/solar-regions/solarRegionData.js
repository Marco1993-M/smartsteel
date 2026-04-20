const SITE_URL = "https://www.smartsteel.co.za";

export const SOLAR_CARPORT_WIDTHS = [3, 5, 7.5, 10];
export const SOLAR_CARPORT_LENGTHS = [6, 12];

const solarRegionPages = {
  pretoria: {
    citySlug: "pretoria",
    name: "Pretoria",
    province: "Gauteng",
    legacySlug: "pretoria-solar-carports",
    heroImage: "/images/solar-carport.webp",
    nearby: ["Centurion", "Midrand", "Rosslyn"],
    localZones: ["Menlyn", "Centurion", "Silverton", "Rosslyn", "Montana"],
    description:
      "Pretoria is a strong market for solar carports across offices, schools, estates, and commercial parking areas that want shade plus energy generation.",
    intro:
      "Smart Steel supplies solar carports in Pretoria for clients who need covered parking, integrated solar generation, and a cleaner long-term energy story.",
    applications: ["office parking", "school parking", "commercial parking"],
    heroLabel: "Solar carport systems for Pretoria businesses, estates, and institutions",
    marketFocus:
      "Pretoria buyers usually want practical covered parking, energy savings, and a professional steel structure that suits commercial and institutional sites.",
  },
  centurion: {
    citySlug: "centurion",
    name: "Centurion",
    province: "Gauteng",
    legacySlug: "centurion-solar-carports",
    heroImage: "/images/solar-carport.webp",
    nearby: ["Pretoria", "Midrand", "Irene"],
    localZones: ["Irene", "Highveld", "Samrand", "Route 21", "Eco Park"],
    description:
      "Centurion is well suited to solar carports for business parks, schools, office campuses, and mixed-use commercial developments.",
    intro:
      "Smart Steel helps Centurion clients add solar carports that protect vehicles, offset electricity costs, and create a more valuable site experience.",
    applications: ["office campuses", "business parks", "school parking"],
    heroLabel: "Smart solar carports for Centurion commercial and campus projects",
    marketFocus:
      "Centurion projects often need solar structures that support business growth, lower daytime energy costs, and create clean covered parking.",
  },
  johannesburg: {
    citySlug: "johannesburg",
    name: "Johannesburg",
    province: "Gauteng",
    legacySlug: "johannesburg-solar-carports",
    heroImage: "/images/solar-carport.webp",
    nearby: ["Roodepoort", "Midrand", "Sandton"],
    localZones: ["Sandton", "Rosebank", "City Deep", "Aeroton", "Wadeville"],
    description:
      "Johannesburg has strong demand for solar carports across office parks, retail sites, logistics yards, and commercial parking environments.",
    intro:
      "Smart Steel supplies solar carports in Johannesburg for buyers who want stronger parking infrastructure, visible sustainability gains, and on-site energy support.",
    applications: ["office parks", "retail parking", "fleet parking"],
    heroLabel: "Solar carport systems for Johannesburg commercial and parking sites",
    marketFocus:
      "Johannesburg buyers typically focus on energy savings, parking coverage, and scalable structures that suit large commercial sites.",
  },
  midrand: {
    citySlug: "midrand",
    name: "Midrand",
    province: "Gauteng",
    legacySlug: "midrand-solar-carports",
    heroImage: "/images/solar-carport.webp",
    nearby: ["Centurion", "Johannesburg", "Kempton Park"],
    localZones: ["Waterfall", "Randjespark", "Kyalami", "Halfway House", "Olifantsfontein"],
    description:
      "Midrand is ideal for solar carports in logistics, commercial, and business-park environments where parking and daytime energy use are both priorities.",
    intro:
      "Smart Steel delivers solar carports in Midrand for offices, mixed-use developments, and commercial sites that need covered parking with energy value.",
    applications: ["business parks", "mixed-use parking", "commercial sites"],
    heroLabel: "Solar-ready parking structures for Midrand business and commercial growth",
    marketFocus:
      "Midrand buyers usually need scalable solar carports that fit business parks, office parking, and fast-moving commercial developments.",
  },
  "cape-town": {
    citySlug: "cape-town",
    name: "Cape Town",
    province: "Western Cape",
    legacySlug: "cape-town-solar-carports",
    heroImage: "/images/solar-carport.webp",
    nearby: ["Bellville", "Brackenfell", "Somerset West"],
    localZones: ["Century City", "Epping", "Montague Gardens", "Bellville", "Brackenfell"],
    description:
      "Cape Town has strong commercial demand for solar carports in offices, retail sites, hospitality properties, and parking-intensive developments.",
    intro:
      "Smart Steel supplies solar carports in Cape Town for clients who want visible clean-energy infrastructure that also improves parking and site value.",
    applications: ["retail parking", "hospitality sites", "office developments"],
    heroLabel: "Solar carport systems for Cape Town commercial and hospitality parking",
    marketFocus:
      "Cape Town projects often prioritise strong presentation, coastal durability, and practical solar generation for busy commercial sites.",
  },
  durban: {
    citySlug: "durban",
    name: "Durban",
    province: "KwaZulu-Natal",
    legacySlug: "durban-solar-carports",
    heroImage: "/images/solar-carport.webp",
    nearby: ["Pinetown", "Umhlanga", "Amanzimtoti"],
    localZones: ["Umhlanga", "Springfield", "Pinetown", "Mobeni", "Prospecton"],
    description:
      "Durban offers strong potential for solar carports in retail, logistics, education, and hospitality sites where shade and energy value both matter.",
    intro:
      "Smart Steel delivers solar carports in Durban for parking areas that need weather protection, clean power generation, and a more valuable steel structure.",
    applications: ["retail parking", "logistics yards", "hospitality parking"],
    heroLabel: "Solar carports for Durban parking, retail, and commercial energy sites",
    marketFocus:
      "Durban buyers often want durable solar parking structures that handle coastal conditions while improving energy performance and site usability.",
  },
  bloemfontein: {
    citySlug: "bloemfontein",
    name: "Bloemfontein",
    province: "Free State",
    legacySlug: "bloemfontein-solar-carports",
    heroImage: "/images/solar-carport.webp",
    nearby: ["Bainsvlei", "Botshabelo", "Thaba Nchu"],
    localZones: ["Westdene", "Hamilton", "Bainsvlei", "Langenhoven Park", "Estoire"],
    description:
      "Bloemfontein is a strong regional market for solar carports across schools, offices, public-sector sites, and business parking areas.",
    intro:
      "Smart Steel supplies solar carports in Bloemfontein for clients looking to protect vehicles, lower electricity dependence, and improve site value.",
    applications: ["school parking", "office sites", "public-sector parking"],
    heroLabel: "Solar carports for Bloemfontein schools, offices, and regional parking sites",
    marketFocus:
      "Bloemfontein projects usually focus on dependable covered parking, energy savings, and straightforward solar infrastructure for practical regional use.",
  },
  polokwane: {
    citySlug: "polokwane",
    name: "Polokwane",
    province: "Limpopo",
    legacySlug: "polokwane-solar-carports",
    heroImage: "/images/solar-carport.webp",
    nearby: ["Mokopane", "Tzaneen", "Seshego"],
    localZones: ["Laboria", "Nirvana", "Mankweng", "Seshego", "Mokopane"],
    description:
      "Polokwane supports solar carport demand in commercial, educational, and fleet-parking environments across the region.",
    intro:
      "Smart Steel supplies solar carports in Polokwane for businesses and institutions that want covered parking plus long-term energy value.",
    applications: ["commercial parking", "institutional sites", "fleet parking"],
    heroLabel: "Solar-ready carport systems for Polokwane commercial and fleet parking",
    marketFocus:
      "Polokwane buyers usually need durable, low-maintenance solar parking structures that balance shade, power generation, and straightforward installation.",
  },
};

export function getSolarRegionConfigs() {
  return Object.values(solarRegionPages);
}

export function getSolarRegionCitySlugs() {
  return Object.keys(solarRegionPages);
}

export function getSolarRegionConfig(citySlug) {
  if (!citySlug) return null;
  return solarRegionPages[citySlug] || null;
}

export function buildSolarRegionHubMetadata() {
  const canonicalPath = "/solar-carports";
  const title = "Solar Carports by Region South Africa | Smart Steel";
  const description =
    "Explore Smart Steel solar carport pages by region, including Pretoria, Johannesburg, Midrand, Cape Town, Durban, and more.";

  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}${canonicalPath}`,
      type: "website",
      images: [
        {
          url: "/images/solar-carport.webp",
          alt: "Solar carport regions in South Africa",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/images/solar-carport.webp"],
    },
  };
}

export function buildSolarRegionMetadata(citySlug) {
  const config = getSolarRegionConfig(citySlug);
  if (!config) return {};

  const canonicalPath = `/${config.legacySlug}`;
  const title = `Solar Carports ${config.name} | Smart Steel`;
  const description = `Solar carports in ${config.name}. Compare covered parking options, pricing guidance, delivery areas, and regional solar carport planning with Smart Steel.`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}${canonicalPath}`,
      type: "website",
      images: [
        {
          url: config.heroImage,
          alt: `Solar carports in ${config.name}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [config.heroImage],
    },
  };
}

export function buildSolarRegionContent(citySlug) {
  const config = getSolarRegionConfig(citySlug);
  if (!config) return null;

  const faqItems = [
    {
      question: `How long does it take to install a solar carport in ${config.name}?`,
      answer: `Most solar carport projects in ${config.name} move from approval to installation within a few weeks, depending on structure size, solar scope, foundations, and electrical integration.`,
    },
    {
      question: `What does a solar carport cost in ${config.name}?`,
      answer: `Solar carport pricing in ${config.name} depends on the covered area, steel scope, number of solar panels, electrical equipment, foundations, and whether the project is structure-only or turnkey.`,
    },
    {
      question: `Do you handle structure and solar integration?`,
      answer: `Yes. Smart Steel can support the steel structure, solar-ready layout, and broader project planning so the final system is coordinated properly.`,
    },
    {
      question: `Do you install outside ${config.name}?`,
      answer: `Yes. We support solar carport projects in ${config.name} as well as nearby areas such as ${config.nearby.join(", ")} and other South African regions.`,
    },
  ];

  return {
    ...config,
    pricePath: "/contact",
    lastUpdated: "Updated April 20, 2026",
    faqItems,
    proofStats: [
      { value: "Dual purpose", label: "covered parking plus solar generation in one structure" },
      { value: "Modular steel", label: "layouts that scale from small parking zones to larger commercial bays" },
      { value: "South Africa", label: "engineered for local site conditions and practical installation" },
    ],
    benefits: [
      "Covered parking that also supports long-term solar generation",
      "Lightweight galvanized steel structures suited to cleaner installation and expansion",
      "A stronger commercial proposition for schools, offices, retail, and business parks",
      "Layouts that can be adapted around parking counts, power goals, and site movement",
    ],
    trustPoints: [
      "Smart Steel focuses on lightweight steel systems designed for practical installation, durability, and scalable parking coverage.",
      `We support solar carport enquiries in ${config.name} and nearby zones such as ${config.localZones.join(", ")}.`,
      "Our structures are planned around parking use, solar coverage, and long-term site value rather than treated as generic shade canopies.",
    ],
    useCases: [
      {
        title: `${config.name} office parking`,
        description: "A strong option for office sites that want shaded parking and visible clean-energy infrastructure for staff and visitors.",
      },
      {
        title: "Retail and customer parking",
        description: "Useful for shopping, service, and public-facing sites that want parking value plus better energy positioning.",
      },
      {
        title: "Schools, campuses, and institutions",
        description: "Practical for education and institutional sites that need structured parking, solar value, and long-term durability.",
      },
    ],
    buyerQuestions: [
      `How many parking bays do we want to cover in ${config.name}?`,
      "Are we prioritising parking shade, solar output, or both equally?",
      "Do we want a structure-only carport or a fuller turnkey solar package?",
      "What site conditions, electrical scope, and approvals will affect the final price?",
    ],
    processSteps: [
      {
        title: "Define the parking requirement",
        description: `We scope the bay count, span, parking layout, and solar intent for your ${config.name} project.`,
      },
      {
        title: "Refine the structure and solar scope",
        description: "We compare structure-only, solar-ready, and fuller turnkey options based on your commercial and technical goals.",
      },
      {
        title: "Manufacture and prepare delivery",
        description: "Once approved, the steel structure moves into production and we plan delivery and installation around the site.",
      },
      {
        title: "Install and coordinate handover",
        description: "The finished solar carport structure is installed and prepared for the required solar integration and final project closeout.",
      },
    ],
    pricingBands: [
      {
        title: "Structure only",
        value: "From about R6,500 to R9,500 per bay",
        description: "A planning range for steel-only parking cover before final structural and site details are confirmed.",
      },
      {
        title: "Solar-ready structure",
        value: "Project specific",
        description: "Depends on structural span, solar loading assumptions, electrical intent, and finish level.",
      },
      {
        title: "Turnkey solar carport",
        value: "Quoted per project",
        description: "Includes the steel structure plus the broader solar and electrical scope required for the site.",
      },
    ],
    internalLinks: [
      { href: "/solar-carports", label: "Solar carport regions hub" },
      { href: "/solar", label: "Main solar page" },
      { href: "/warehouse-regions", label: "Warehouse regions hub" },
      { href: "/lightweight-steel-warehouses", label: "Warehouse systems" },
      { href: "/contact", label: "Request a project quote" },
    ],
    sizeBlurb: `Typical solar carport layouts in ${config.name} range from compact single-bay coverage to wider multi-bay parking structures depending on the site and power goals.`,
  };
}
