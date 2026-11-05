const SITE_URL = "https://www.smartsteel.co.za";

export const regionalPlanning = {
  pretoria: "For office and school parking, mark visitor access, accessible bays, drop-off queues and pedestrian routes. For fleet yards, confirm the tallest vehicle and turning space rather than sizing only for passenger cars.",
  centurion: "For a business park or campus brief, show how staff, visitors and service vehicles share the parking area. Identify separate runs around entrances and pedestrian links, and confirm delivery restrictions with the property manager.",
  johannesburg: "For retail, office and fleet sites, mark customer circulation, loading areas and the bays that must remain usable during works. Check vehicle heights and service access before deciding where columns and separate parking runs should go.",
  midrand: "For business parks and mixed-use sites, distinguish visitor parking from staff, loading and delivery routes. Show entrances and connections between parking areas so separate runs can be reviewed without blocking site circulation.",
  "cape-town": "For office, retail or hospitality parking, identify guest routes, service access and nearby obstructions that could shade panels. Tell the project team about coastal exposure so the steel specification, connections and maintenance requirements can be reviewed for the actual site.",
  durban: "For hospitality, retail or logistics parking, separate guest and customer routes from service vehicles. Flag coastal exposure and existing drainage routes for review; confirm the structural finish and foundation requirements rather than assuming one specification suits every property.",
  bloemfontein: "For school, office and institutional parking, mark arrival queues, pedestrian crossings and visitor access. If vehicles must keep using the site during works, identify which bays can be released and when deliveries can enter.",
  polokwane: "For commercial, institutional or fleet parking, confirm whether the structure must accommodate passenger cars, minibuses or taller vehicles. Include turning space, delivery access and the location of the intended electrical connection in your site brief.",
};

export const SOLAR_CARPORT_WIDTHS = [2.75, 5.5, 11, 16.5, 22];
export const SOLAR_CARPORT_LENGTHS = [6, 12];

const solarRegionPages = {
  pretoria: {
    citySlug: "pretoria",
    name: "Pretoria",
    province: "Gauteng",
    legacySlug: "pretoria-solar-carports",
    heroImage: "/solar_carport_hero.webp",
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
    heroImage: "/solar_carport_hero.webp",
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
    heroImage: "/solar_carport_hero.webp",
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
    heroImage: "/solar_carport_hero.webp",
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
    heroImage: "/solar_carport_hero.webp",
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
    heroImage: "/solar_carport_hero.webp",
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
    heroImage: "/solar_carport_hero.webp",
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
    heroImage: "/solar_carport_hero.webp",
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
          url: "/solar_carport_hero.webp",
          alt: "Solar carport regions in South Africa",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/solar_carport_hero.webp"],
    },
  };
}

export function buildSolarRegionMetadata(citySlug) {
  const config = getSolarRegionConfig(citySlug);
  if (!config) return {};

  const canonicalPath = `/${config.legacySlug}`;
  const title = `Solar Carports ${config.name} | Atlas 3D Builder & Pricing`;
  const description = `Plan an Atlas solar carport in ${config.name}. Compare parking layouts in 3D, see a structure-only guide price and request a reviewed quote for your site.`;

  return {
    title: { absolute: title },
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
          alt: "Smart Steel solar carport structures",
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
