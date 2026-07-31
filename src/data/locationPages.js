export const basePackages = [
  {
    name: "Starter Home",
    price: "From R850,000",
    size: "Approx. 60-90 m2",
    details: [
      "Efficient lightweight steel frame shell",
      "Well suited to smaller private homes, refined cottages, or guest-use buildings",
      "Best for straightforward sites and disciplined, well-considered finishes",
    ],
  },
  {
    name: "Family Home",
    price: "From R1.45m",
    size: "Approx. 120-180 m2",
    featured: true,
    details: [
      "Open-plan layouts with stronger insulation and comfort upgrades",
      "Works well for permanent homes, estate living, and multibedroom layouts",
      "Can be tailored for verandas, shading, and indoor-outdoor living",
    ],
  },
  {
    name: "Large Custom Home",
    price: "From R2.8m+",
    size: "180 m2 and up",
    details: [
      "Architect-led custom planning for larger sites and premium finishes",
      "Suitable for view-focused homes, signature builds, and complex briefs",
      "Often paired with solar, water storage, and off-grid-ready systems",
    ],
  },
];

function titleCase(value) {
  return value
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function inferSlug(place, slug) {
  if (slug) return slug;
  return `build-in-${place.toLowerCase().replace(/\s+/g, "-")}`;
}

function inferHeroEyebrow(place, localContext) {
  return `LSF homes for ${localContext} in ${place}`;
}

function inferMetaDescription(place, province, localContext, supportingSearchTerms) {
  return `Architect-designed lightweight steel frame home builders in ${place}, ${province}. Explore LSF homes, residential construction guidance, and planning for ${localContext}, with ${supportingSearchTerms.join(", ")}.`;
}

function inferIntro({
  place,
  localContext,
  climaticFocus,
  regulatoryFocus,
  serviceAreaType,
}) {
  return `Pequeño designs and builds lightweight steel frame homes in ${place} for clients who want a more considered architectural outcome without sacrificing build quality or delivery discipline. Our approach is shaped by the realities of the area: ${climaticFocus}, ${regulatoryFocus}, and the practical demands of ${serviceAreaType}.`;
}

function inferLocalNeedTitle(place) {
  return `Why LSF works well in ${place}`;
}

function inferSeoKeywords(place, province, region, supportingSearchTerms) {
  return [
    `home builders ${place}`,
    `new home builders ${place}`,
    `residential construction ${place}`,
    `build in ${place}`,
    `lightweight steel frame homes ${place}`,
    `LSF homes ${place}`,
    `modular homes ${place}`,
    `steel frame homes ${place}`,
    `homes in ${place}`,
    `Pequeno ${place}`,
    `lightweight steel homes ${province}`,
    `prefab homes ${place}`,
    `architect designed homes ${place}`,
    ...supportingSearchTerms.map((term) => `${term} ${place}`),
    ...supportingSearchTerms.map((term) => `${term} ${region}`),
  ];
}

function inferLocalCommercialTerms(place) {
  return [
    `home builders ${place}`,
    `new home builders ${place}`,
    `residential construction ${place}`,
    `lightweight steel frame homes ${place}`,
    `steel frame homes ${place}`,
    `modular homes ${place}`,
  ];
}

export function createLocationPage({
  key,
  place,
  province,
  region,
  heroImage,
  slug,
  localContext,
  climaticFocus,
  regulatoryFocus,
  serviceAreaType,
  localNeeds,
  projectTypes,
  localPlanning,
  nearbyAreas,
  faq,
  featuredSnippet,
  featuredProjectKey,
  supportingSearchTerms = [
    "modern family homes",
    "off-grid retreats",
    "energy-efficient living",
  ],
  localCommercialTerms,
  heroEyebrow,
  intro,
  metaDescription,
  localNeedTitle,
}) {
  const resolvedSlug = inferSlug(place, slug);
  const resolvedHeroEyebrow = heroEyebrow || inferHeroEyebrow(place, localContext);
  const resolvedMetaDescription =
    metaDescription ||
    inferMetaDescription(place, province, localContext, supportingSearchTerms);
  const resolvedIntro =
    intro ||
    inferIntro({
      place,
      localContext,
      climaticFocus,
      regulatoryFocus,
      serviceAreaType,
    });

  return [
    key,
    {
      key,
      slug: resolvedSlug,
      place,
      province,
      region,
      heroImage,
      heroEyebrow: resolvedHeroEyebrow,
      metaDescription: resolvedMetaDescription,
      intro: resolvedIntro,
      localNeedTitle: localNeedTitle || inferLocalNeedTitle(place),
      localNeeds,
      projectTypes,
      localPlanning,
      nearbyAreas,
      faq,
      featuredSnippet,
      featuredProjectKey,
      localContext,
      climaticFocus,
      regulatoryFocus,
      serviceAreaType,
      supportingSearchTerms,
      localCommercialTerms:
        localCommercialTerms || inferLocalCommercialTerms(place),
      seoKeywords: inferSeoKeywords(place, province, region, supportingSearchTerms),
      seoTitle: `Build in ${place} | LSF Home Builders & Construction | Pequeno`,
      pageTitle: `Build in ${place}: Lightweight Steel Frame Homes`,
      pageSummary: `Architect-designed LSF homes and residential construction guidance for ${place}, ${province}, with content tailored to ${region}.`,
      serviceName: `Pequeño lightweight steel frame homes in ${place}`,
    },
  ];
}

export const locationPages = Object.fromEntries([
  createLocationPage({
    key: "hoedspruit",
    place: "Hoedspruit",
    province: "Limpopo",
    region: "the Limpopo Lowveld",
    heroImage: "/hoedspruit.webp",
    localContext: "bushveld sites, wildlife estates, and warm-climate living",
    climaticFocus: "bushveld heat, seasonal storms, and strong sun exposure",
    regulatoryFocus: "estate design rules and site-specific build constraints",
    serviceAreaType: "wildlife estates, rural plots, and lifestyle properties",
    supportingSearchTerms: [
      "bushveld homes",
      "wildlife estate homes",
      "off-grid homes",
      "modern prefab homes",
    ],
    localNeeds: [
      {
        title: "Built for warm bushveld conditions",
        description:
          "Good insulation, shading strategy, and efficient wall assemblies matter in Hoedspruit. LSF gives us a precise structure that supports high-performance envelopes and comfortable year-round living.",
      },
      {
        title: "Helpful on remote or estate sites",
        description:
          "Many Hoedspruit projects sit on wildlife estates, lifestyle estates, or rural plots where cleaner coordination and faster assembly are valuable. Lightweight framing can reduce site disruption compared with slower conventional methods.",
      },
      {
        title: "Strong for modern, open spaces",
        description:
          "LSF is a strong fit for contemporary bushveld homes with generous glazing, large roof overhangs, and flexible indoor-outdoor layouts.",
      },
    ],
    projectTypes: [
      "Permanent family homes on bushveld and lifestyle estates",
      "Weekend houses and safari-style retreats",
      "Guest cottages, ancillary buildings, and private retreat spaces",
    ],
    localPlanning: [
      "Estate design guidelines often shape roof forms, materials, and colour palettes.",
      "Site access, transport, and foundation conditions can vary widely between town properties and bushveld plots.",
      "Passive cooling, solar orientation, and covered outdoor living are usually worth prioritising early in the design.",
    ],
    nearbyAreas: [
      "Hoedspruit town and surrounding residential plots",
      "Wildlife and lifestyle estates in the greater Hoedspruit area",
      "Properties around Kampersrus and the broader Lowveld approach to Hoedspruit",
    ],
    faq: [
      {
        question: "Do you only build inside Hoedspruit town?",
        answer:
          "No. We can help with projects in Hoedspruit itself as well as surrounding estates and nearby properties where the site, access, and brief make sense for our system.",
      },
      {
        question: "Are lightweight steel homes suitable for Hoedspruit's climate?",
        answer:
          "Yes, when the home is designed properly. The frame is only one part of the system. We pair it with insulation, cladding choices, ventilation planning, and shading strategies suited to warm Lowveld conditions.",
      },
      {
        question: "Can you design for off-grid or low-infrastructure sites?",
        answer:
          "Yes. Many clients in the area want solar readiness, water storage, or a lower-services approach. We can shape the design around those goals from the start.",
      },
    ],
    featuredSnippet:
      "A typical Hoedspruit brief might be a modern bushveld home on or near a wildlife estate, where shaded outdoor living, solar readiness, and practical delivery to a more remote site all matter from the first concept sketch.",
    featuredProjectKey: "staff-compound",
  }),
  createLocationPage({
    key: "dullstroom",
    place: "Dullstroom",
    province: "Mpumalanga",
    region: "the Mpumalanga Highlands",
    heroImage: "/dullstroom.webp",
    localContext: "highland climates, weekend retreats, and estate living",
    climaticFocus: "cooler temperatures, mist, and moisture-sensitive detailing",
    regulatoryFocus: "estate-driven design standards and performance-led material choices",
    serviceAreaType: "weekend houses, trout properties, and highland lifestyle sites",
    supportingSearchTerms: [
      "highland homes",
      "weekend retreat homes",
      "trout estate houses",
      "energy-efficient homes",
    ],
    localNeeds: [
      {
        title: "Strong thermal performance matters",
        description:
          "Dullstroom's cooler highland climate makes insulation, airtight detailing, and moisture-aware assemblies especially important. LSF supports precise, repeatable construction where envelope quality matters.",
      },
      {
        title: "Ideal for weekend-home programs",
        description:
          "Many Dullstroom projects are second homes, cabins, or estate houses where clients want a clear process, controlled quality, and efficient delivery.",
      },
      {
        title: "Works with contemporary highland design",
        description:
          "LSF gives flexibility for clean-lined architecture, large glazing zones, covered verandas, and layered cladding palettes that sit well in the Highlands.",
      },
    ],
    projectTypes: [
      "Weekend homes and family retreats",
      "Trout estate houses and smaller cabins",
      "Primary residences designed for cool-climate comfort",
    ],
    localPlanning: [
      "Insulation, glazing specification, and heating strategy should be considered earlier than many clients expect.",
      "Highland weather and moisture exposure make detailing and material selection important.",
      "Estate approvals may influence form, cladding, and visual character from the outset.",
    ],
    nearbyAreas: [
      "Dullstroom town and nearby residential plots",
      "Highland estates and trout properties in the surrounding area",
      "Selected rural and lifestyle properties within the broader Dullstroom catchment",
    ],
    faq: [
      {
        question: "Can LSF homes feel warm enough in Dullstroom?",
        answer:
          "Yes. Comfort depends on the whole building system, not just the frame. With the right insulation, glazing, and detailing, an LSF home can perform very well in cooler highland conditions.",
      },
      {
        question: "Do you work on estate projects in and around Dullstroom?",
        answer:
          "Yes. Estate homes are a good fit for our process, especially when the brief values design consistency, energy performance, and efficient delivery.",
      },
      {
        question: "Can you help with a retreat as well as a larger house?",
        answer:
          "Yes. We work across a range of scales, from smaller getaway homes to larger custom family houses, as long as the brief aligns with our architecture and system.",
      },
    ],
    featuredSnippet:
      "In Dullstroom, we often think about how a house will feel on a cold misty morning as much as how it looks on arrival, especially for retreat-style homes near trout estates and weekend properties beyond the town centre.",
  }),
  createLocationPage({
    key: "pretoria",
    place: "Pretoria",
    province: "Gauteng",
    region: "the greater Tshwane area",
    heroImage: "/pretoria.webp",
    localContext: "suburban sites, infill plots, and modern family living",
    climaticFocus: "hot summers, storms, and strong west-facing sun",
    regulatoryFocus: "estate rules, municipal processes, and urban site coordination",
    serviceAreaType: "suburban stands, estates, and urban residential properties",
    supportingSearchTerms: [
      "suburban homes",
      "estate homes",
      "modern family homes",
      "prefab homes",
    ],
    localNeeds: [
      {
        title: "A clean fit for suburban and estate plots",
        description:
          "Pretoria builds often need efficient coordination on tighter suburban or estate sites. Precision fabrication and a cleaner build sequence can be a real advantage.",
      },
      {
        title: "Comfort-focused for hot summers",
        description:
          "Thoughtful insulation, shading, glazing, and roof design all matter in Pretoria. LSF supports envelope performance and design flexibility rather than forcing a generic plan.",
      },
      {
        title: "Works for modern architecture",
        description:
          "From contemporary family homes to larger executive residences, LSF works well when the brief calls for clean detailing, open-plan living, and disciplined delivery momentum.",
      },
    ],
    projectTypes: [
      "Suburban family homes on standalone stands",
      "Estate houses for modern lifestyles",
      "Guest suites, pavilions, and ancillary buildings on premium residential properties",
    ],
    localPlanning: [
      "Estate approval rules can shape materials, massing, and facade character.",
      "Urban service connections and municipal approvals should be planned early in the process.",
      "Summer heat, storms, and west-facing sun make passive design decisions especially important.",
    ],
    nearbyAreas: [
      "Pretoria East, Pretoria North, and surrounding suburban neighbourhoods",
      "Estate developments across the broader Tshwane area",
      "Selected projects in the Pretoria-Centurion urban catchment",
    ],
    faq: [
      {
        question: "Is LSF suitable for a full-time family home in Pretoria?",
        answer:
          "Yes. It is well suited to full-time residential projects when the design, envelope, and services are resolved properly around the way your household lives.",
      },
      {
        question: "Can you work on an estate-controlled site?",
        answer:
          "Yes. Estate projects are common, and we can coordinate the design approach around the relevant guidelines and approval requirements.",
      },
      {
        question: "Do you only offer small prefab units?",
        answer:
          "No. We design across a range of home sizes, including larger custom residences. The right solution depends on the site, budget, and architectural brief.",
      },
    ],
    featuredSnippet:
      "A Pretoria project may need to reconcile estate rules, west-facing afternoon sun, and the expectations of modern suburban family life, especially on better stands in the eastern parts of the greater Tshwane area.",
    featuredProjectKey: "coffee-spa",
  }),
  createLocationPage({
    key: "stellenbosch",
    place: "Stellenbosch",
    province: "Western Cape",
    region: "the Cape Winelands",
    heroImage: "/images/modular-hero.jpg",
    localContext: "winelands estates, lifestyle properties, and contemporary family homes",
    climaticFocus: "hot dry summers, mountain-influenced microclimates, and strong indoor-outdoor living expectations",
    regulatoryFocus: "estate guidelines, heritage sensitivity in parts of town, and design-led approval environments",
    serviceAreaType: "wine farm properties, security estates, and residential plots across the broader Stellenbosch area",
    supportingSearchTerms: [
      "winelands homes",
      "estate homes",
      "luxury modular homes",
      "architect designed homes",
    ],
    localNeeds: [
      {
        title: "Well suited to design-led estates and lifestyle sites",
        description:
          "Stellenbosch clients often care deeply about architecture, views, materiality, and how a home sits within the landscape. LSF works well where design quality and construction precision both matter.",
      },
      {
        title: "Good for hot summers and shaded outdoor living",
        description:
          "Homes in Stellenbosch need to handle strong summer sun while still feeling open and connected to courtyards, terraces, and gardens. That makes envelope performance and solar control especially important.",
      },
      {
        title: "Flexible for primary homes and second properties",
        description:
          "The area supports everything from full-time family residences to guest accommodation and vineyard-linked lifestyle builds, so flexibility in scale and planning is valuable.",
      },
    ],
    projectTypes: [
      "Contemporary family homes on residential and estate plots",
      "Winelands lifestyle homes and guest accommodation",
      "Design-led guest suites, secondary pavilions, and refined ancillary buildings",
    ],
    localPlanning: [
      "Some Stellenbosch projects are shaped by heritage, visual character, or estate architectural guidelines.",
      "Mountain views, privacy, and sun orientation usually deserve careful planning from the first concept stage.",
      "Material selection should balance long-term durability with the architectural expectations common in the Winelands.",
    ],
    nearbyAreas: [
      "Stellenbosch town and surrounding residential neighbourhoods",
      "Winelands estates and lifestyle developments in the broader Stellenbosch area",
      "Selected properties toward Jonkershoek, Devon Valley, and nearby rural edges",
    ],
    faq: [
      {
        question: "Can lightweight steel homes work for premium Stellenbosch builds?",
        answer:
          "Yes. LSF can support high-end architectural outcomes when the design, detailing, and materials are resolved properly. It is not limited to small or basic prefabricated units.",
      },
      {
        question: "Do you work on estate-controlled sites around Stellenbosch?",
        answer:
          "Yes. We can shape the design response around estate rules, view lines, and the performance expectations that often come with Winelands residential projects.",
      },
      {
        question: "Can this approach suit both a main home and a second property?",
        answer:
          "Yes. The same system can work for permanent family homes, guest accommodation, or a carefully designed ancillary building, depending on the brief.",
      },
    ],
    featuredSnippet:
      "Around Stellenbosch, a strong brief often starts with orientation, mountain views, and a home that feels equally suited to everyday family life and long afternoons opening onto a shaded Winelands terrace.",
  }),
  createLocationPage({
    key: "hermanus",
    place: "Hermanus",
    province: "Western Cape",
    region: "the Overberg and Whale Coast",
    heroImage: "/images/off-grid.jpg",
    localContext: "coastal homes, holiday properties, and retirement living",
    climaticFocus: "coastal winds, salt-laden air, changing weather, and strong sea-facing conditions",
    regulatoryFocus: "site exposure, design controls in some areas, and the demands of coastal durability",
    serviceAreaType: "cliffside plots, residential neighbourhoods, and nearby lifestyle properties",
    supportingSearchTerms: [
      "coastal homes",
      "holiday homes",
      "retirement homes",
      "sea view homes",
    ],
    localNeeds: [
      {
        title: "Useful where coastal durability matters",
        description:
          "Homes in Hermanus need thoughtful material choices and detailing because salt air, wind exposure, and coastal moisture can be tough on poorly resolved buildings.",
      },
      {
        title: "Strong fit for view-focused layouts",
        description:
          "Many Hermanus briefs prioritise ocean views, natural light, and sheltered outdoor living. LSF works well for contemporary plans that need generous openings and clean geometry.",
      },
      {
        title: "Works across permanent and seasonal homes",
        description:
          "The town attracts full-time residents, retirees, and holiday-home owners, so homes often need to balance comfort, low maintenance, and long-term durability.",
      },
    ],
    projectTypes: [
      "Permanent coastal homes for families and retirees",
      "Holiday houses and second homes near the coast",
      "Ancillary coastal buildings and guest accommodation",
    ],
    localPlanning: [
      "Coastal exposure and salt air should influence cladding, fixings, and maintenance planning.",
      "Sites with strong views often need careful glazing, privacy, and wind-management strategies.",
      "The best results usually come from treating outdoor living spaces as part of the architecture rather than an afterthought.",
    ],
    nearbyAreas: [
      "Hermanus town and established residential neighbourhoods",
      "Properties toward Onrus, Sandbaai, and the greater Hermanus edge",
      "Selected coastal and lifestyle plots in the wider Hermanus catchment",
    ],
    faq: [
      {
        question: "Are lightweight steel homes suitable for coastal conditions in Hermanus?",
        answer:
          "Yes, provided the home is detailed and specified appropriately for the coast. The structure, cladding, fixings, and maintenance plan should all be chosen with coastal exposure in mind.",
      },
      {
        question: "Can you design for a sea-view or slope site?",
        answer:
          "Yes. Many coastal projects benefit from a lighter, more precise structural approach, especially where views, levels, and site logistics all matter.",
      },
      {
        question: "Do you only build holiday homes in Hermanus?",
        answer:
          "No. We can help with full-time residences, retirement-focused homes, or second homes, depending on the site and design brief.",
      },
    ],
    featuredSnippet:
      "For Hermanus, a project might centre on a sea-facing stand or a quieter neighbourhood toward Onrus, where wind, salt exposure, and low-maintenance material choices become as important as the plan itself.",
  }),
  createLocationPage({
    key: "george",
    place: "George",
    province: "Western Cape",
    region: "the central Garden Route",
    heroImage: "/steel-framing.jpg",
    localContext: "Garden Route family homes, estates, and lifestyle properties",
    climaticFocus: "fast-changing weather, mountain influence, humidity, and year-round outdoor living",
    regulatoryFocus: "estate rules, suburban coordination, and site planning across a growing regional hub",
    serviceAreaType: "suburban plots, golf estates, and broader Garden Route residential sites",
    supportingSearchTerms: [
      "Garden Route homes",
      "estate homes",
      "family homes",
      "energy-efficient homes",
    ],
    localNeeds: [
      {
        title: "Useful in a climate that changes quickly",
        description:
          "George's weather can shift fast because of the influence of both the coast and the Outeniqua Mountains. Homes here benefit from balanced insulation, moisture-aware detailing, and sensible weather protection.",
      },
      {
        title: "Strong fit for growing residential demand",
        description:
          "As a major Garden Route hub, George sees a mix of suburban growth, estate development, and lifestyle building. A cleaner, well-managed building system is helpful across all three.",
      },
      {
        title: "Works well for contemporary family layouts",
        description:
          "LSF suits homes that want open living spaces, generous glazing, and adaptable layouts without losing structural clarity.",
      },
    ],
    projectTypes: [
      "Suburban family homes across the greater George area",
      "Estate houses and lifestyle-focused residences",
      "Guest accommodation, ancillary buildings, and secondary pavilions",
    ],
    localPlanning: [
      "Homes in George should be detailed for moisture, airflow, and shifting weather conditions.",
      "Golf and lifestyle estates may bring additional design review requirements.",
      "Orientation, covered outdoor spaces, and durable external materials are often worth prioritising early.",
    ],
    nearbyAreas: [
      "George central neighbourhoods and surrounding suburbs",
      "Residential and estate properties across the greater George catchment",
      "Selected sites toward Wilderness-facing and inland Garden Route edges",
    ],
    faq: [
      {
        question: "Is LSF a good fit for George's climate?",
        answer:
          "Yes. The key is to design the whole building system well for George's rainfall, humidity, and changing weather. With the right envelope and detailing, it can perform very well.",
      },
      {
        question: "Can you work on suburban and estate sites in George?",
        answer:
          "Yes. We can help with standalone residential sites as well as estate projects where design controls and programme certainty matter.",
      },
      {
        question: "Do you only focus on small homes?",
        answer:
          "No. We work across a range of scales, from smaller support dwellings to larger custom homes, depending on the project brief.",
      },
    ],
    featuredSnippet:
      "In George, a family home might need to feel robust through changing Garden Route weather while still opening comfortably to a covered braai terrace and garden on a suburban or estate plot.",
  }),
  createLocationPage({
    key: "knysna",
    place: "Knysna",
    province: "Western Cape",
    region: "the Garden Route lagoon and forest belt",
    heroImage: "/images/harsh.jpg",
    localContext: "lagoon-view homes, forest-edge properties, and lifestyle estates",
    climaticFocus: "temperate conditions, moisture, indigenous vegetation, and sites shaped by water and slope",
    regulatoryFocus: "environmentally sensitive settings, estate design controls, and view-led planning",
    serviceAreaType: "residential neighbourhoods, lagoon-facing properties, and nearby lifestyle estates",
    supportingSearchTerms: [
      "lagoon homes",
      "forest homes",
      "estate homes",
      "Garden Route homes",
    ],
    localNeeds: [
      {
        title: "Strong where site character really matters",
        description:
          "Knysna properties often respond to lagoon views, forest surroundings, slope, and privacy. That makes tailored design much more important than a generic house type.",
      },
      {
        title: "Good for moisture-aware construction",
        description:
          "The area's temperate climate and greener setting mean detailing, ventilation, and external durability should be considered carefully from the start.",
      },
      {
        title: "Flexible for permanent and lifestyle homes",
        description:
          "Knysna attracts both full-time residents and second-home owners, so homes often need to balance comfort, low maintenance, and a strong connection to the setting.",
      },
    ],
    projectTypes: [
      "Primary residences in and around Knysna neighbourhoods",
      "Lifestyle homes with lagoon, forest, or garden outlooks",
      "Guest-use buildings, ancillary pavilions, and secondary accommodation",
    ],
    localPlanning: [
      "Slope, vegetation, drainage, and privacy can heavily influence how a Knysna home is planned.",
      "Moisture management and material specification should be handled carefully in greener, more sheltered conditions.",
      "Good architecture in Knysna usually responds strongly to the natural setting rather than forcing a generic suburban layout.",
    ],
    nearbyAreas: [
      "Knysna town and established surrounding neighbourhoods",
      "Lagoon-facing and lifestyle properties in the greater Knysna area",
      "Selected sites toward nearby estate and forest-edge residential zones",
    ],
    faq: [
      {
        question: "Can lightweight steel homes work on a slope or view site in Knysna?",
        answer:
          "Yes. Many projects in Knysna benefit from a precise structural approach, especially where terrain, outlook, and access all affect the design.",
      },
      {
        question: "Is this system suitable for the wetter Garden Route environment?",
        answer:
          "Yes, when the envelope and detailing are resolved properly. Material choice, ventilation, and water management all remain important.",
      },
      {
        question: "Do you work on both permanent homes and second homes?",
        answer:
          "Yes. We can help with either, provided the site and design brief are a good fit for our process and architecture.",
      },
    ],
    featuredSnippet:
      "A Knysna home often becomes a careful response to slope, vegetation, and privacy, especially on sites where lagoon outlooks or forest-edge conditions shape where the house should open up and where it should shelter.",
  }),
  createLocationPage({
    key: "plettenberg-bay",
    place: "Plettenberg Bay",
    province: "Western Cape",
    region: "the eastern Garden Route coast",
    heroImage: "/images/modular.jpg",
    localContext: "coastal lifestyle homes, holiday properties, and view-driven family houses",
    climaticFocus: "moderate coastal weather, sea air, strong outdoor-living expectations, and beach-oriented sites",
    regulatoryFocus: "coastal durability, neighbourhood character, and site planning around views and exposure",
    serviceAreaType: "coastal plots, residential neighbourhoods, and nearby lifestyle properties",
    supportingSearchTerms: [
      "coastal homes",
      "holiday homes",
      "beach houses",
      "Garden Route homes",
    ],
    localNeeds: [
      {
        title: "A strong fit for relaxed but design-led coastal homes",
        description:
          "Plettenberg Bay homes often want open living, strong indoor-outdoor connection, and a clear response to views, sunlight, and privacy. LSF works well where those design demands matter.",
      },
      {
        title: "Useful where low-maintenance durability matters",
        description:
          "Second homes and coastal properties both benefit from construction systems and material strategies that support easier long-term upkeep.",
      },
      {
        title: "Flexible across family and holiday use",
        description:
          "The local brief is rarely one-size-fits-all. Some clients want a permanent home, others want a lock-up-and-go holiday house, and some want a mix of both.",
      },
    ],
    projectTypes: [
      "Beach-oriented family homes and permanent residences",
      "Holiday houses and lock-up-and-go coastal homes",
      "Secondary units and guest accommodation on larger properties",
    ],
    localPlanning: [
      "Ocean exposure, sea air, and strong view lines should all inform the design from the outset.",
      "Homes in Plett often benefit from sheltered terraces, durable material palettes, and strong privacy planning.",
      "A carefully resolved layout can outperform a larger generic plan on many coastal plots.",
    ],
    nearbyAreas: [
      "Plettenberg Bay town and established residential areas",
      "Coastal and lifestyle properties across the broader Plett catchment",
      "Selected sites toward Robberg-side, lagoon-side, and nearby estate settings",
    ],
    faq: [
      {
        question: "Can lightweight steel homes suit a coastal site in Plettenberg Bay?",
        answer:
          "Yes. As with any coastal project, the detailing and specification matter. We approach these homes with durability, maintenance, and exposure in mind.",
      },
      {
        question: "Do you work on both holiday and permanent homes in Plett?",
        answer:
          "Yes. The design approach can be shaped around either a full-time living brief or a lower-maintenance holiday-home model.",
      },
      {
        question: "Can you design for smaller sites as well as larger coastal plots?",
        answer:
          "Yes. We can work across different property scales as long as the site and architectural goals align with our process.",
      },
    ],
    featuredSnippet:
      "In Plettenberg Bay, the brief is often about balancing coastal ease with practical durability, whether the site sits closer to the beach, the lagoon side, or a more tucked-away residential pocket.",
  }),
  createLocationPage({
    key: "mbombela",
    place: "Mbombela",
    province: "Mpumalanga",
    region: "the Kruger Lowveld",
    heroImage: "/images/structure-e.jpg",
    localContext: "Lowveld family homes, suburban properties, and gateway-to-Kruger living",
    climaticFocus: "subtropical heat, summer rainfall, and high-value shading and ventilation decisions",
    regulatoryFocus: "suburban approvals, estate rules where relevant, and site coordination in a growing regional city",
    serviceAreaType: "urban plots, suburban properties, and nearby lifestyle sites across the Lowveld catchment",
    supportingSearchTerms: [
      "Lowveld homes",
      "suburban homes",
      "family homes",
      "modern prefab homes",
    ],
    localNeeds: [
      {
        title: "Designed for subtropical Lowveld conditions",
        description:
          "Mbombela homes need to stay comfortable through heat, humidity, and summer storms. That makes shading, ventilation, and envelope performance central to the design.",
      },
      {
        title: "A practical fit for a growing regional hub",
        description:
          "As a key city in the Lowveld and a gateway to the wider Kruger region, Mbombela combines everyday suburban demand with more lifestyle-oriented projects around the edge of town.",
      },
      {
        title: "Good for efficient family-home delivery",
        description:
          "For clients who want a modern, well-performing home without the mess and drag of a slower conventional build, LSF can be a very good fit.",
      },
    ],
    projectTypes: [
      "Full-time family homes on suburban and estate plots",
      "Modern lifestyle homes in the greater Lowveld catchment",
      "Guest suites, additional accommodation, and ancillary buildings",
    ],
    localPlanning: [
      "Subtropical heat and rainfall should influence roof design, shading, and material decisions from the start.",
      "Well-ventilated layouts and sensible solar orientation usually matter more than adding floor area.",
      "Urban and edge-of-city sites can differ a lot in access, drainage, and servicing requirements.",
    ],
    nearbyAreas: [
      "Mbombela residential neighbourhoods and suburban plots",
      "Properties in the broader Lowveld catchment around the city edge",
      "Selected lifestyle and estate settings linked to the greater Mbombela area",
    ],
    faq: [
      {
        question: "Are LSF homes suitable for Mbombela's subtropical climate?",
        answer:
          "Yes. They can perform very well when designed with the right insulation, ventilation, shading, and storm-aware detailing for Lowveld conditions.",
      },
      {
        question: "Do you only work on bush or tourism-style homes nearby?",
        answer:
          "No. We can also help with standard suburban and family-home briefs in and around Mbombela, provided the site and design goals are a good fit.",
      },
      {
        question: "Can you help with a modern permanent home rather than a prefab cabin?",
        answer:
          "Yes. Our approach is intended for real homes with proper architectural planning, not only smaller modular cabins.",
      },
    ],
    featuredSnippet:
      "For Mbombela, a well-performing home usually means taking Lowveld heat seriously, with generous shading, airflow, and outdoor spaces that still feel usable after afternoon storms roll through.",
  }),
  createLocationPage({
    key: "ballito",
    place: "Ballito",
    province: "KwaZulu-Natal",
    region: "the Dolphin Coast",
    heroImage: "/images/structure-c.jpg",
    localContext: "coastal estates, modern family homes, and North Coast lifestyle living",
    climaticFocus: "humid subtropical weather, salt air, and strong indoor-outdoor coastal living",
    regulatoryFocus: "estate design controls, coastal maintenance demands, and privacy on high-value residential sites",
    serviceAreaType: "coastal estates, suburban plots, and nearby North Coast residential properties",
    supportingSearchTerms: [
      "Dolphin Coast homes",
      "estate homes",
      "coastal homes",
      "family homes",
    ],
    localNeeds: [
      {
        title: "A good fit for estate-driven North Coast projects",
        description:
          "Ballito has a strong estate and lifestyle market, and those projects often reward a more controlled, well-coordinated build process with high architectural consistency.",
      },
      {
        title: "Helpful in humid coastal conditions",
        description:
          "Homes on the Dolphin Coast need material choices and building details that acknowledge humidity, salt air, and strong summer weather.",
      },
      {
        title: "Works for open, contemporary family living",
        description:
          "Ballito homes often want large living spaces, entertainment areas, and a strong indoor-outdoor relationship. LSF can support that cleanly.",
      },
    ],
    projectTypes: [
      "Modern family homes in Ballito and nearby estates",
      "Coastal lifestyle residences and second homes",
      "Secondary accommodation, support buildings, and ancillary structures",
    ],
    localPlanning: [
      "Coastal maintenance and specification choices should be resolved carefully on Ballito projects.",
      "Estate approvals may shape facade treatment, roof form, and overall design language.",
      "Shading, airflow, and covered external spaces often matter as much as floor area on the North Coast.",
    ],
    nearbyAreas: [
      "Ballito residential areas and surrounding suburban neighbourhoods",
      "Coastal estates and lifestyle developments across the greater Ballito area",
      "Selected nearby North Coast settings toward Salt Rock, Sheffield Beach, and Shaka's Rock",
    ],
    faq: [
      {
        question: "Can lightweight steel homes suit Ballito's coastal climate?",
        answer:
          "Yes. They can work very well on the coast when the detailing, cladding, and maintenance strategy are chosen appropriately for humidity and salt exposure.",
      },
      {
        question: "Do you work on estate homes in Ballito?",
        answer:
          "Yes. Estate projects are often a strong fit because they benefit from a controlled design and build approach with clear architectural intent.",
      },
      {
        question: "Can this approach work for a permanent family home on the North Coast?",
        answer:
          "Yes. We design for full-time family living as well as second homes, and the brief can be shaped around how you actually want to live on the site.",
      },
    ],
    featuredSnippet:
      "A Ballito project often needs to work hard on comfort and maintenance at the same time, especially on North Coast estate sites where humidity, sea air, and entertainment-focused living all shape the design.",
  }),
]);

export const locationPageList = Object.values(locationPages);

export function getRelatedLocationPages(currentSlug, limit = 6) {
  const currentLocation = getLocationPage(currentSlug);

  if (!currentLocation) {
    return locationPageList.slice(0, limit);
  }

  const sameProvince = locationPageList.filter(
    (location) =>
      location.slug !== currentSlug &&
      location.province === currentLocation.province,
  );

  const sameRegion = locationPageList.filter(
    (location) =>
      location.slug !== currentSlug &&
      location.region === currentLocation.region &&
      location.province !== currentLocation.province,
  );

  const remainder = locationPageList.filter(
    (location) =>
      location.slug !== currentSlug &&
      location.province !== currentLocation.province &&
      location.region !== currentLocation.region,
  );

  return [...sameProvince, ...sameRegion, ...remainder].slice(0, limit);
}

export function getFeaturedLocationPages(limit = 8) {
  return locationPageList.slice(0, limit);
}

export function getLocationPage(slug) {
  return locationPageList.find((location) => location.slug === slug);
}

export function getLocationMetadata(location) {
  const title = location.seoTitle || `Lightweight Steel Frame Homes in ${location.place} | Pequeno`;
  const url = `https://www.pequenohome.com/${location.slug}`;

  return {
    title,
    description: location.metaDescription,
    keywords: location.seoKeywords,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description: location.metaDescription,
      url,
      siteName: "Pequeño",
      locale: "en_ZA",
      type: "article",
      images: [
        {
          url: location.heroImage,
          width: 1600,
          height: 900,
          alt: `Lightweight steel frame homes in ${location.place}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: location.metaDescription,
      images: [location.heroImage],
    },
  };
}

export const exampleLocationPage = createLocationPage({
  key: "example-town",
  place: titleCase("example-town"),
  province: "Province Name",
  region: "the broader local region",
  heroImage: "/town-image.webp",
  localContext: "the main local housing use cases",
  climaticFocus: "the weather and site factors that matter locally",
  regulatoryFocus: "estate rules, approvals, and design constraints",
  serviceAreaType: "the kinds of plots, estates, or neighbourhoods you serve",
  localNeeds: [
    {
      title: "What matters most in this town",
      description: "Explain one truly local design or construction consideration.",
    },
    {
      title: "How the system helps here",
      description: "Explain another local reason LSF is a strong fit.",
    },
    {
      title: "What clients often want",
      description: "Explain the local style, layout, or performance brief.",
    },
  ],
  projectTypes: [
    "Typical project type one",
    "Typical project type two",
    "Typical project type three",
  ],
  localPlanning: [
    "Important planning note one",
    "Important planning note two",
    "Important planning note three",
  ],
  nearbyAreas: [
    "Nearby area or estate one",
    "Nearby area or estate two",
    "Nearby area or estate three",
  ],
  faq: [
    {
      question: "Question people in this town actually ask?",
      answer: "Clear, honest answer grounded in how you work.",
    },
    {
      question: "Another local buying-stage question?",
      answer: "Useful answer that helps people understand fit, scope, and next steps.",
    },
    {
      question: "A design or build process question?",
      answer: "Short answer that builds trust and relevance.",
    },
  ],
});
