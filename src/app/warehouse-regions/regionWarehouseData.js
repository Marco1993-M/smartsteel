const SITE_URL = "https://www.smartsteel.co.za";

export const REGION_WAREHOUSE_WIDTHS = [8, 10, 12];
export const REGION_WAREHOUSE_LENGTHS = [10, 12.5, 15, 17.5, 20, 22.5, 25, 27.5, 30, 32.5, 35, 37.5, 40, 50];

const regionWarehousePages = {
  pretoria: {
    citySlug: "pretoria",
    name: "Pretoria",
    province: "Gauteng",
    legacySlug: "pretoria-warehouses",
    heroImage: "/images/hero.webp",
    nearby: ["Centurion", "Rosslyn", "Midrand"],
    localZones: ["Rosslyn", "Silverton", "Montana", "Centurion", "Irene"],
    description:
      "Pretoria offers strong industrial and manufacturing demand, making it one of the best regions in Gauteng for lightweight steel warehouse construction.",
    intro:
      "Smart Steel supplies lightweight steel warehouses in Pretoria for storage, workshops, agricultural buildings, and industrial operations that need faster delivery and predictable build costs.",
    industries: ["manufacturing", "distribution", "agricultural storage"],
    heroLabel: "Industrial warehouse systems for Pretoria and surrounding Gauteng zones",
    marketFocus:
      "Pretoria clients usually need fast warehouse delivery, cost control, and clear access planning for industrial, commercial, and agricultural sites.",
  },
  centurion: {
    citySlug: "centurion",
    name: "Centurion",
    province: "Gauteng",
    legacySlug: "centurion-warehouses",
    heroImage: "/images/hero.webp",
    nearby: ["Midrand", "Pretoria", "Irene"],
    localZones: ["Irene", "Samrand", "Highveld", "Route 21", "Eco Park"],
    description:
      "Centurion is a fast-growing industrial and business hub with ongoing demand for warehousing, fleet storage, and commercial steel buildings.",
    intro:
      "Smart Steel helps clients in Centurion build lightweight steel warehouses that are quicker to erect, easier to expand, and designed for long-term value.",
    industries: ["logistics", "trade depots", "commercial storage"],
    heroLabel: "Warehouse construction support for fast-growing Centurion businesses",
    marketFocus:
      "Centurion projects often balance warehousing, commercial growth, and flexible workshop space close to transport corridors and business parks.",
  },
  johannesburg: {
    citySlug: "johannesburg",
    name: "Johannesburg",
    province: "Gauteng",
    legacySlug: "johannesburg-warehouses",
    heroImage: "/images/johannesburg.webp",
    nearby: ["Roodepoort", "Midrand", "Kempton Park"],
    localZones: ["Aeroton", "Wadeville", "City Deep", "Roodepoort", "Midrand"],
    description:
      "Johannesburg is one of South Africa's busiest commercial and industrial markets, with strong demand for warehouse, distribution, and workshop space.",
    intro:
      "Smart Steel delivers lightweight steel warehouse systems across Johannesburg for buyers who need speed, scalability, and better project control.",
    industries: ["distribution", "light industrial", "fleet and logistics"],
    heroLabel: "Warehouse systems built for Johannesburg distribution and industrial demand",
    marketFocus:
      "Johannesburg warehouse projects are usually driven by logistics speed, larger stock volumes, and efficient expansion for growing operations.",
  },
  midrand: {
    citySlug: "midrand",
    name: "Midrand",
    province: "Gauteng",
    legacySlug: "midrand-warehouses",
    heroImage: "/images/hero.webp",
    nearby: ["Centurion", "Sandton", "Kempton Park"],
    localZones: ["Waterfall", "Randjespark", "Halfway House", "Kyalami", "Olifantsfontein"],
    description:
      "Midrand sits between Pretoria and Johannesburg and is ideal for warehousing, logistics, and commercial steel building projects.",
    intro:
      "Smart Steel supplies lightweight steel warehouses in Midrand for stock holding, distribution space, workshops, and scalable industrial use.",
    industries: ["logistics", "distribution", "commercial storage"],
    heroLabel: "Strategic warehouse solutions between Johannesburg and Pretoria",
    marketFocus:
      "Midrand demand is usually centred on warehousing, logistics overflow, and scalable distribution space along the Gauteng corridor.",
  },
  roodepoort: {
    citySlug: "roodepoort",
    name: "Roodepoort",
    province: "Gauteng",
    legacySlug: "roodepoort-warehouses",
    heroImage: "/images/hero.webp",
    nearby: ["Johannesburg", "Krugersdorp", "Randburg"],
    localZones: ["Laser Park", "Wilro Park", "Florida", "Krugersdorp", "Randburg"],
    description:
      "Roodepoort serves a mix of commercial, industrial, and service businesses that need practical warehouse and workshop space.",
    intro:
      "Smart Steel helps Roodepoort clients build lightweight steel warehouses for stock control, trade operations, secure storage, and industrial support space.",
    industries: ["trade services", "storage", "light industrial"],
    heroLabel: "Practical steel warehouse space for Roodepoort trade and storage projects",
    marketFocus:
      "Roodepoort warehouse projects often focus on practical storage, secure trade yards, and cost-effective steel buildings with room to expand.",
  },
  middelburg: {
    citySlug: "middelburg",
    name: "Middelburg",
    province: "Mpumalanga",
    legacySlug: "middelburg-warehouses",
    heroImage: "/images/hero.webp",
    nearby: ["Witbank", "Belfast", "Hendrina"],
    localZones: ["Witbank", "Hendrina", "Belfast", "Mhluzi", "Pullens Hope"],
    description:
      "Middelburg supports mining, agriculture, engineering, and storage demand, making steel warehouse construction a practical fit for the area.",
    intro:
      "Smart Steel supplies lightweight steel warehouses in Middelburg for equipment cover, bulk storage, farm operations, and regional industrial use.",
    industries: ["agriculture", "engineering support", "equipment storage"],
    heroLabel: "Warehouse and equipment-storage solutions for Middelburg operations",
    marketFocus:
      "Middelburg buyers usually need durable steel buildings for equipment, storage, workshop support, and regional operations tied to agriculture and industry.",
  },
  hoedspruit: {
    citySlug: "hoedspruit",
    name: "Hoedspruit",
    province: "Limpopo",
    legacySlug: "hoedspruit-warehouses",
    heroImage: "/images/hero.webp",
    nearby: ["Tzaneen", "Phalaborwa", "Lydenburg"],
    localZones: ["Phalaborwa", "Tzaneen", "Kampersrus", "Mica", "Lydenburg"],
    description:
      "Hoedspruit is well suited to agricultural, tourism-support, and storage-focused steel building projects where durability and speed matter.",
    intro:
      "Smart Steel supplies lightweight steel warehouses in Hoedspruit for agricultural storage, workshop use, and secure regional operations.",
    industries: ["agriculture", "tourism support", "secure storage"],
    heroLabel: "Fast steel warehouse systems for Hoedspruit agricultural and regional projects",
    marketFocus:
      "Hoedspruit projects typically need durable, low-maintenance warehouse space for agriculture, support operations, and secure regional storage.",
  },
  hermanus: {
    citySlug: "hermanus",
    name: "Hermanus",
    province: "Western Cape",
    legacySlug: "hermanus-warehouses",
    heroImage: "/images/hero.webp",
    nearby: ["Somerset West", "Caledon", "Grabouw"],
    localZones: ["Caledon", "Stanford", "Somerset West", "Grabouw", "Gansbaai"],
    description:
      "Hermanus and the surrounding Overberg region benefit from steel buildings for agricultural use, storage, and workshop applications near the coast.",
    intro:
      "Smart Steel delivers lightweight steel warehouses in Hermanus for storage, workshop space, and durable coastal-region steel building projects.",
    industries: ["agriculture", "coastal storage", "workshop use"],
    heroLabel: "Coastal-ready steel warehouse buildings for Hermanus and the Overberg",
    marketFocus:
      "Hermanus and Overberg buyers usually need warehouse systems that handle coastal conditions while staying efficient, durable, and practical to maintain.",
  },
  "cape-town": {
    citySlug: "cape-town",
    name: "Cape Town",
    province: "Western Cape",
    legacySlug: "cape-town-warehouses",
    heroImage: "/images/hero.webp",
    nearby: ["Bellville", "Brackenfell", "Somerset West"],
    localZones: ["Epping", "Montague Gardens", "Airport Industria", "Bellville South", "Brackenfell"],
    description:
      "Cape Town has strong demand for logistics, manufacturing support, trade warehousing, and light industrial steel buildings across the metro.",
    intro:
      "Smart Steel supplies lightweight steel warehouses in Cape Town for distribution, workshop space, stock holding, and scalable industrial operations.",
    industries: ["distribution", "light industrial", "trade warehousing"],
    heroLabel: "Steel warehouse solutions for Cape Town logistics and industrial growth",
    marketFocus:
      "Cape Town projects usually prioritise efficient warehouse footprints, rapid installation, and durable structures that support commercial growth across the metro.",
  },
  durban: {
    citySlug: "durban",
    name: "Durban",
    province: "KwaZulu-Natal",
    legacySlug: "durban-warehouses",
    heroImage: "/images/hero.webp",
    nearby: ["Pinetown", "Umhlanga", "Amanzimtoti"],
    localZones: ["Mobeni", "Springfield", "Pinetown", "Prospecton", "Cornubia"],
    description:
      "Durban is one of South Africa's most important logistics markets, making warehouse demand strong across port-linked, industrial, and trade-focused zones.",
    intro:
      "Smart Steel delivers lightweight steel warehouses in Durban for logistics, stock movement, fleet support, workshop operations, and commercial storage.",
    industries: ["logistics", "port-linked warehousing", "commercial storage"],
    heroLabel: "Warehouse systems built for Durban logistics, trade, and industrial activity",
    marketFocus:
      "Durban buyers often need warehouse space that supports fast stock movement, access planning, and scalable storage close to trade and transport routes.",
  },
  gqeberha: {
    citySlug: "gqeberha",
    name: "Gqeberha",
    province: "Eastern Cape",
    legacySlug: "gqeberha-warehouses",
    heroImage: "/images/hero.webp",
    nearby: ["Uitenhage", "Despatch", "Coega"],
    localZones: ["Coega", "Deal Party", "Uitenhage", "Despatch", "Markman"],
    description:
      "Gqeberha supports automotive, port, and industrial demand, making steel warehouse solutions a practical fit for the region.",
    intro:
      "Smart Steel supplies lightweight steel warehouses in Gqeberha for industrial storage, workshop space, fleet support, and growing regional operations.",
    industries: ["automotive support", "industrial storage", "port-linked logistics"],
    heroLabel: "Steel warehouses for Gqeberha industrial and logistics projects",
    marketFocus:
      "Gqeberha projects often focus on industrial support space, secure storage, and durable warehouse systems that can scale with regional demand.",
  },
  bloemfontein: {
    citySlug: "bloemfontein",
    name: "Bloemfontein",
    province: "Free State",
    legacySlug: "bloemfontein-warehouses",
    heroImage: "/images/hero.webp",
    nearby: ["Botshabelo", "Thaba Nchu", "Bainsvlei"],
    localZones: ["Hamilton", "Langenhoven Park", "Estoire", "Bainsvlei", "Botshabelo"],
    description:
      "Bloemfontein's central location makes it a strong warehouse region for distribution, agricultural support, and commercial storage.",
    intro:
      "Smart Steel helps clients in Bloemfontein build lightweight steel warehouses for storage, workshops, fleet cover, and regional trade support.",
    industries: ["distribution", "agricultural support", "commercial storage"],
    heroLabel: "Central South African warehouse solutions for Bloemfontein operations",
    marketFocus:
      "Bloemfontein buyers typically need practical warehouse buildings that support regional distribution, secure stock holding, and operational flexibility.",
  },
  polokwane: {
    citySlug: "polokwane",
    name: "Polokwane",
    province: "Limpopo",
    legacySlug: "polokwane-warehouses",
    heroImage: "/images/hero.webp",
    nearby: ["Mokopane", "Louis Trichardt", "Tzaneen"],
    localZones: ["Laboria", "Nirvana", "Mankweng", "Mokopane", "Seshego"],
    description:
      "Polokwane supports warehousing, agriculture, trade, and regional logistics demand across Limpopo.",
    intro:
      "Smart Steel supplies lightweight steel warehouses in Polokwane for stock holding, equipment storage, workshop use, and growing regional operations.",
    industries: ["regional logistics", "agricultural storage", "trade warehousing"],
    heroLabel: "Durable steel warehouses for Polokwane trade and regional logistics",
    marketFocus:
      "Polokwane projects often need durable warehouse systems that balance storage capacity, expansion options, and dependable regional access.",
  },
  nelspruit: {
    citySlug: "nelspruit",
    name: "Nelspruit",
    province: "Mpumalanga",
    legacySlug: "nelspruit-warehouses",
    heroImage: "/images/hero.webp",
    nearby: ["White River", "Malelane", "Barberton"],
    localZones: ["Riverside Park", "Rocky Drift", "White River", "Matsulu", "Malelane"],
    description:
      "Nelspruit supports agricultural, trade, and logistics demand, with warehouse projects often tied to regional distribution and equipment cover.",
    intro:
      "Smart Steel supplies lightweight steel warehouses in Nelspruit for distribution, workshop use, secure storage, and agricultural support buildings.",
    industries: ["agricultural support", "distribution", "equipment storage"],
    heroLabel: "Lightweight steel warehouse systems for Nelspruit and surrounding Mpumalanga",
    marketFocus:
      "Nelspruit buyers usually need practical warehouse buildings that handle storage, agricultural support, and trade operations across the region.",
  },
  rustenburg: {
    citySlug: "rustenburg",
    name: "Rustenburg",
    province: "North West",
    legacySlug: "rustenburg-warehouses",
    heroImage: "/images/hero.webp",
    nearby: ["Mogwase", "Brits", "Swartruggens"],
    localZones: ["Waterfall East", "Tlhabane", "Phokeng", "Brits", "Mogwase"],
    description:
      "Rustenburg's mining, trade, and service economy creates steady demand for warehouse, workshop, and equipment-storage buildings.",
    intro:
      "Smart Steel helps Rustenburg clients build lightweight steel warehouses for industrial support, trade operations, secure storage, and workshop use.",
    industries: ["industrial support", "equipment storage", "trade warehousing"],
    heroLabel: "Warehouse buildings for Rustenburg industrial and equipment-storage demand",
    marketFocus:
      "Rustenburg warehouse projects usually focus on practical steel buildings for support operations, secure storage, and durable workshop space.",
  },
  "east-london": {
    citySlug: "east-london",
    name: "East London",
    province: "Eastern Cape",
    legacySlug: "east-london-warehouses",
    heroImage: "/images/hero.webp",
    nearby: ["King William's Town", "Mdantsane", "Bhisho"],
    localZones: ["Wilsonia", "Arcadia", "Beacon Bay", "Bhisho", "King William's Town"],
    description:
      "East London supports industrial, automotive, trade, and coastal warehousing demand across the broader region.",
    intro:
      "Smart Steel supplies lightweight steel warehouses in East London for storage, workshop use, distribution, and durable coastal-region operations.",
    industries: ["industrial storage", "automotive support", "coastal warehousing"],
    heroLabel: "Steel warehouses for East London industrial and coastal business use",
    marketFocus:
      "East London buyers often need warehouse systems that stay durable in coastal conditions while supporting trade, storage, and regional operations.",
  },
};

function titleCaseWords(words) {
  return words
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function getRegionWarehouseCitySlugs() {
  return Object.keys(regionWarehousePages);
}

export function getRegionWarehouseConfig(citySlug) {
  if (!citySlug) return null;
  return regionWarehousePages[citySlug] || null;
}

export function getRegionWarehouseConfigByLegacySlug(legacySlug) {
  return Object.values(regionWarehousePages).find((config) => config.legacySlug === legacySlug) || null;
}

export function getRegionWarehouseConfigs() {
  return Object.values(regionWarehousePages);
}

export function getRegionWarehouseLegacyPaths() {
  return Object.values(regionWarehousePages).map((config) => `/${config.legacySlug}`);
}

export function getRegionWarehouseDynamicPaths() {
  return Object.values(regionWarehousePages).map((config) => `/${config.citySlug}/warehouses`);
}

export function buildRegionWarehouseHubMetadata() {
  const canonicalPath = "/warehouse-regions";
  const title = "Steel Warehouses by Region South Africa | Smart Steel";
  const description =
    "Explore Smart Steel warehouse regions across South Africa, including Pretoria, Midrand, Johannesburg, Centurion, and more.";

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
          url: "/images/hero.webp",
          alt: "Smart Steel warehouse regions in South Africa",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/images/hero.webp"],
    },
  };
}

export function buildRegionWarehouseMetadata(citySlug) {
  const config = getRegionWarehouseConfig(citySlug);
  if (!config) return {};

  const canonicalPath = `/${config.legacySlug}`;
  const title = `Steel Warehouses ${config.name} | Lightweight Steel Buildings | Smart Steel`;
  const description = `Lightweight steel warehouses in ${config.name}. Explore warehouse sizes, pricing guidance, delivery areas, and fast-build steel building solutions from Smart Steel.`;

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
          alt: `Steel warehouses in ${config.name}`,
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

export function buildRegionWarehouseContent(citySlug) {
  const config = getRegionWarehouseConfig(citySlug);
  if (!config) return null;

  const titlePrefix = titleCaseWords(["steel warehouses", config.name]);
  const pricePath = "/warehouse-builder";
  const faqItems = [
    {
      question: `How long does it take to build a steel warehouse in ${config.name}?`,
      answer: `Most standard warehouse shells in ${config.name} move from final approval to installation within a few weeks, depending on size, access, foundations, and optional extras.`,
    },
    {
      question: `What does a steel warehouse cost in ${config.name}?`,
      answer: `Lightweight steel warehouse pricing in ${config.name} depends on width, length, cladding, access openings, slab scope, and whether you need supply-only or installation. Use our warehouse builder for a fast visual starting point, or the estimator if you want a simpler budget check.`,
    },
    {
      question: `Do you install outside ${config.name}?`,
      answer: `Yes. Smart Steel works across South Africa and can support projects in ${config.name} as well as surrounding areas like ${config.nearby.join(", ")}.`,
    },
    {
      question: `Can I customise a warehouse for ${config.name}?`,
      answer: `Yes. We can tailor span, length, cladding, doors, insulation, and layout to suit warehouse, workshop, fleet, agricultural, or mixed-use requirements in ${config.name}.`,
    },
  ];

  return {
    ...config,
    titlePrefix,
    pricePath,
    faqItems,
    lastUpdated: "Updated April 20, 2026",
    benefits: [
      "Faster build programmes than many traditional construction routes",
      "Scalable layouts with practical 8m, 10m, and 12m modular widths",
      "Galvanized steel systems designed for lower maintenance and long-term durability",
      "Suitable for warehouses, workshops, storage, fleet cover, and light industrial use",
    ],
    proofStats: [
      { value: "23321+", label: "lightweight steel meters supplied" },
      { value: "30%", label: "average cost saving versus heavier conventional builds" },
      { value: "50%", label: "faster build time on many comparable projects" },
    ],
    trustPoints: [
      "Smart Steel focuses on lightweight steel systems engineered for speed, durability, and clean installation.",
      `We support warehouse projects in ${config.name} and surrounding areas like ${config.localZones.join(", ")}.`,
      "Our modular warehouse system makes it easier to compare widths, lengths, delivery scope, and expansion options before you commit.",
    ],
    useCases: [
      {
        title: `Warehousing in ${config.name}`,
        description: "Secure storage, dispatch, and stock-holding layouts for businesses that need practical spans and fast installation.",
      },
      {
        title: "Workshop and trade space",
        description: "Layouts that support fabrication, repair work, vehicle access, and operational flow without heavy wet-trade construction.",
      },
      {
        title: "Agricultural and equipment storage",
        description: "A practical option for machinery, feed, tools, and weather-protected farm operations where expansion may matter later.",
      },
    ],
    processSteps: [
      {
        title: "Scope the building",
        description: `We define the warehouse width, length, use case, and delivery requirements for your ${config.name} project.`,
      },
      {
        title: "Price and refine",
        description: "You compare options for cladding, installation, access doors, insulation, and other commercial requirements.",
      },
      {
        title: "Manufacture and deliver",
        description: "Once approved, we move into production and prepare for delivery and installation around your site schedule.",
      },
      {
        title: "Install and hand over",
        description: "The finished warehouse shell is erected quickly, ready for final fit-out, storage use, or operational setup.",
      },
    ],
    buyerQuestions: [
      `How much warehouse space do we really need in ${config.name}?`,
      "What span and length make the most sense for the site?",
      "Should we build structure-only, installed shell, or a larger turnkey scope?",
      "What door, cladding, and insulation options will affect final pricing?",
    ],
    internalLinks: [
      { href: "/warehouse-builder", label: "Build your warehouse online" },
      { href: "/tools/estimator", label: "Warehouse estimator" },
      { href: "/warehouses", label: "All warehouse systems" },
      { href: "/warehouse-regions", label: "Warehouse regions hub" },
      { href: "/warehouse-cost", label: "Warehouse cost guide" },
      { href: "/warehouse-cost/10x10", label: "10m x 10m warehouse cost" },
      { href: "/warehouse-cost/20x10", label: "20m x 10m warehouse cost" },
    ],
    sizeBlurb: `Popular warehouse footprints in ${config.name} start with modular widths of 8m, 10m, and 12m, with lengths scaled to suit storage, workshop, and operational requirements.`,
  };
}
