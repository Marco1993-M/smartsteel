const SITE_URL = "https://www.smartsteel.co.za"

export const agriculturalCategories = [
  {
    title: "Piggery structures",
    description: "Atlas steel building shells for 20-sow breeding, farrowing and growing-pig facilities.",
    status: "Available",
    href: "/agricultural-buildings/20-sow-piggery",
  },
  {
    title: "Poultry houses",
    description: "Structural shells for broiler and layer houses, developed around the supplied production brief.",
    status: "Template ready",
  },
  {
    title: "Milking and dairy sheds",
    description: "Practical steel cover for milking, holding and dairy-support areas.",
    status: "Template ready",
  },
  {
    title: "Cattle and feedlot sheds",
    description: "Roofed livestock areas and structural cover coordinated with the handling layout.",
    status: "Template ready",
  },
  {
    title: "Sheep and small-stock sheds",
    description: "Steel structures for lambing, shearing and covered small-stock facilities.",
    status: "Template ready",
  },
  {
    title: "Grain and farm storage",
    description: "Atlas storage buildings for equipment, inputs and protected on-farm operations.",
    status: "Template ready",
  },
]

const pages = {
  "20-sow-piggery": {
    slug: "20-sow-piggery",
    metaTitle: "20-Sow Piggery Buildings South Africa | Atlas Smart Steel",
    metaDescription: "Plan a 20-sow piggery building with Smart Steel. Atlas steel shells for breeding, farrowing and grower facilities, configured for South African farms.",
    eyebrow: "Agricultural structures / pig housing",
    title: "Atlas steel buildings for a 20-sow piggery",
    summary: "Start with the farming operation, not a finished building plan. Smart Steel can configure an Atlas structural shell around the required breeding, farrowing and growing-pig areas.",
    keywords: [
      "20-sow piggery",
      "20 sow pig farm layout",
      "20-sow piggery building",
      "piggery structures South Africa",
      "pig housing construction",
      "steel piggery buildings",
      "piggery structure quotation",
    ],
    primaryCta: "Request a 20-sow piggery quote",
    builderConfigurations: [
      { code: "W10 / 32", title: "Breeding and gestation shell", width: 10, length: 32, height: 3, note: "A practical Atlas starting envelope for boars, gilts, dry and pregnant sows.", basis: "ARC drawing: approximately 8.43m × 31.8m, rounded to released Atlas sizes." },
      { code: "W06 / 16", title: "Farrowing shell", width: 6, length: 16, height: 3, note: "A compact starting envelope for a dedicated five-to-six-pen farrowing area.", basis: "SA small-scale pig-farming guide: approximately 4m × 13.25–15.5m, rounded up to W06 × 16m." },
      { code: "W10 / 40", title: "Grower and finisher shell", width: 10, length: 40, height: 3, note: "A released Atlas footprint aligned with the published grower-house outline.", basis: "SA small-scale pig-farming guide: approximately 9m × 40m, rounded to W10 × 40m." },
    ],
    heroMetric: "20",
    heroMetricLabel: "Sow breeding unit",
    heroFacts: [
      ["Application", "Pig housing"],
      ["Starting point", "Farm brief"],
      ["Service area", "South Africa"],
    ],
    ctaPrompt: "Planning a 20-sow unit?",
    ctaDetail: "Send the farm location, intended production areas and preferred project timing. Smart Steel can help define the Atlas building shell from there.",
    lastReviewed: "26 October 2026",
    lastReviewedIso: "2026-10-26",
    planLabel: "20-sow breeding house",
    systemLabel: "Atlas agricultural building shell",
    locationLabel: "Projects across South Africa",
    introTitle: "Start with the production flow. Build the Atlas shell around it.",
    intro: [
      "A 20-sow piggery is more than one open shed. Published South African agricultural guidance describes separate functions for breeding stock, farrowing and growing pigs, supported by suitable passages, drainage, ventilation and manure handling.",
      "Smart Steel uses that operational outline to begin the conversation. The Atlas W-Series provides a repeatable steel frame, roof and enclosure platform that can be configured around the farm brief, site conditions and layout confirmed by the client’s agricultural and professional team.",
    ],
    planningBasis: {
      title: "What a 20-sow facility needs to accommodate",
      description: "The ARC’s published pig-housing guidance provides a useful planning basis rather than a one-size-fits-all building plan.",
      points: [
        "Breeding accommodation for boars, gilts, dry and pregnant sows",
        "A dedicated farrowing area suited to sow and piglet management",
        "Separate accommodation for weaners and growing or finishing pigs",
        "Feeding and dung passages coordinated with the internal pen layout",
        "Ventilation, temperature control, drainage, wash-down and manure handling",
      ],
      sourceLabel: "ARC: Housing requirements of pigs",
      sourceUrl: "https://www.arc.agric.za/Agricultural%20Sector%20News/Housing%20requirements%20of%20pigs.pdf",
      supportingSourceLabel: "Guide to small-scale pig farming",
      supportingSourceUrl: "https://agri4africa.com/wp-content/uploads/2020/07/Pigs-Guide-to-small-scale-pig-farming.pdf",
    },
    scope: [
      { title: "Atlas structural frame", text: "A repeatable W-Series steel building platform configured for the required spans, lengths, local loading and farm layout." },
      { title: "Roofing and enclosure", text: "Roof sheeting, ventilation openings and agreed wall-cladding zones, with finishes reviewed for the piggery environment." },
      { title: "Supply and installation", text: "A clearly defined supply-only or installation-assisted Atlas package, subject to site location, access and final engineering review." },
    ],
    responsibilities: {
      smartSteel: [
        "Translate the farm brief into an Atlas building-shell proposal",
        "Define the structural frame, roof and agreed cladding package",
        "Prepare a scope-based quotation and delivery approach",
        "Coordinate required structural information before manufacture",
      ],
      client: [
        "Confirm the intended production flow and internal facility layout",
        "Confirm the site, orientation, access and local conditions",
        "Appoint the required competent professionals and obtain approvals",
        "Confirm foundations, floors, drainage, effluent and internal equipment scope",
      ],
    },
    considerations: [
      { title: "Ventilation and temperature", text: "Openings, ridge treatment, insulation and mechanical systems must follow the production plan and specialist requirements." },
      { title: "Corrosive conditions", text: "Animal housing can expose steel and fixings to moisture and aggressive contaminants. The required material and coating specification must be agreed for the site." },
      { title: "Drainage and hygiene", text: "Floor falls, channels, wash-down systems and effluent infrastructure sit outside the standard steel shell and must be coordinated early." },
      { title: "Future farm operations", text: "Feed access, service routes, equipment movement and potential expansion should be understood before the structural grid is frozen." },
    ],
    inputs: [
      "The intended 20-sow production model and functional areas",
      "Farm location and proposed building position",
      "Required structural, roofing and wall-cladding scope",
      "Foundation and floor information, where available",
      "Ventilation, insulation and service requirements",
      "Delivery access and preferred construction programme",
    ],
    process: [
      { number: "01", title: "Share the farm brief", text: "Tell us the site, production intent, functional areas and the package you want Smart Steel to review." },
      { number: "02", title: "Shape the Atlas shell", text: "We establish a practical building envelope and separate the steel scope from civils, pens, equipment and specialist systems." },
      { number: "03", title: "Review and quote", text: "The team confirms structural assumptions, environmental finishes, delivery and installation requirements." },
      { number: "04", title: "Prepare for delivery", text: "Manufacture proceeds only after the project information, approvals and commercial scope are confirmed." },
    ],
    faqs: [
      { question: "Do I need an ARC plan before contacting Smart Steel?", answer: "No. Smart Steel can begin with your farm location, intended 20-sow production model and required functional areas. Published agricultural guidance helps establish the brief, after which the project team confirms the site-specific layout and professional requirements." },
      { question: "Is the Atlas building an official ARC piggery design?", answer: "No. Atlas is Smart Steel’s structural building system. ARC pig-housing guidance informs the operational brief, but the final facility layout, civils, animal systems and approvals remain project-specific." },
      { question: "Does the steel quotation include pens and piggery equipment?", answer: "Only items expressly listed in the quotation are included. Pens, gates, feeding systems, ventilation equipment, electrical work, plumbing and specialist animal-production equipment are excluded unless specifically agreed." },
      { question: "Are foundations, floors and effluent works included?", answer: "These are not part of the standard structural shell. They require project-specific civil and professional input and must be coordinated with the supplied piggery layout." },
      { question: "Can Smart Steel deliver outside Gauteng?", answer: "Yes. Smart Steel reviews agricultural structure enquiries across South Africa. Delivery and installation feasibility depend on project location, access and scope." },
    ],
    disclaimer: "Smart Steel is an independent structural supplier and is not affiliated with or endorsed by the Agricultural Research Council. ARC material is referenced as publicly available agricultural planning guidance; Atlas is a separate Smart Steel structural building system.",
  },
}

const REQUIRED_PAGE_FIELDS = [
  "slug", "metaTitle", "metaDescription", "keywords", "eyebrow", "title", "summary",
  "primaryCta", "builderConfigurations", "heroMetric", "heroMetricLabel", "heroFacts", "ctaPrompt", "ctaDetail", "planLabel", "systemLabel", "locationLabel", "planningBasis",
  "introTitle", "intro", "scope", "responsibilities", "considerations", "inputs", "process",
  "faqs", "disclaimer", "lastReviewed", "lastReviewedIso",
]

function validateAgriculturalStructure(content) {
  const missing = REQUIRED_PAGE_FIELDS.filter((field) => {
    const value = content?.[field]
    return value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0)
  })
  if (missing.length) throw new Error(`Agricultural structure page "${content?.slug || "unknown"}" is missing: ${missing.join(", ")}`)
  if (!Array.isArray(content.keywords) || content.keywords.length < 3) throw new Error(`Agricultural structure page "${content.slug}" needs at least three target keywords.`)
  if (!Array.isArray(content.faqs) || content.faqs.length < 3) throw new Error(`Agricultural structure page "${content.slug}" needs at least three useful FAQs.`)
  return content
}

export function getAgriculturalStructure(slug) {
  return pages[slug] ? validateAgriculturalStructure(pages[slug]) : null
}

export function getAgriculturalStructureSlugs() {
  return Object.values(pages).map((content) => validateAgriculturalStructure(content).slug)
}

export function buildAgriculturalMetadata(content) {
  const url = `${SITE_URL}/agricultural-buildings/${content.slug}`
  return {
    title: { absolute: content.metaTitle },
    description: content.metaDescription,
    keywords: content.keywords,
    robots: { index: true, follow: true },
    alternates: { canonical: url },
    openGraph: {
      title: content.metaTitle,
      description: content.metaDescription,
      url,
      type: "website",
    },
  }
}
