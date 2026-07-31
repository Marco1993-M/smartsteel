function inferProjectSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function createProject({
  key,
  name,
  slug,
  location,
  region,
  projectType,
  size,
  summary,
  highlights,
  trustLine,
  gallery,
  featuredImage,
  bestForLocations = [],
}) {
  return [
    key,
    {
      key,
      name,
      slug: slug || inferProjectSlug(name),
      location,
      region,
      projectType,
      size,
      summary,
      highlights,
      trustLine,
      gallery,
      featuredImage: featuredImage || gallery[0],
      bestForLocations,
    },
  ];
}

export const projects = Object.fromEntries([
  createProject({
    key: "coffee-spa",
    name: "Coffee & Spa",
    location: "Outside Pretoria East",
    region: "greater Pretoria East",
    projectType: "Double-storey commercial structure",
    size: "200 sqm",
    summary:
      "Coffee & Spa was designed as a calm, contemporary commercial space just outside Pretoria East, bringing hospitality and wellness together in one refined double-storey building. The brief called for a structure that felt welcoming to guests while still being practical to build and efficient to operate. Lightweight steel framing was a strong fit because it supported a clean structural system, faster coordination on site, and the design flexibility needed for crisp lines, generous internal volume, and a polished modern finish.",
    highlights: [
      "200 sqm double-storey commercial building",
      "Lightweight steel frame system for efficient structural delivery",
      "Designed for a calm, modern hospitality and wellness experience",
      "A strong fit for commercial construction outside Pretoria East",
    ],
    trustLine:
      "A strong example of lightweight steel framing supporting refined, design-led commercial buildings, not only residential homes.",
    gallery: [
      "/projects/Coffee_spa_1.JPG",
      "/projects/Coffee_spa_2.jpg",
      "/projects/Coffee_spa_3.jpg",
      "/projects/Coffee_spa_4.jpg",
      "/projects/Coffee_spa_5.jpg",
    ],
    bestForLocations: ["build-in-pretoria"],
  }),
  createProject({
    key: "staff-compound",
    name: "Staff Compound",
    location: "Hoedspruit",
    region: "the Hoedspruit bushveld",
    projectType: "Residential project for staff housing",
    size: "950 sqm",
    summary:
      "Staff Compound was developed in Hoedspruit as a substantial residential staff-housing project shaped around durability, efficiency, and everyday livability in a demanding bushveld setting. The brief called for accommodation that could be delivered at scale without losing order, comfort, or long-term practicality. Lightweight steel framing was a strong fit because it supported a cleaner construction process, repeatable quality across a larger footprint, and a robust structure suited to warm conditions and hard-working daily use. The result is a 950 sqm housing project that shows how LSF can perform not only in custom homes, but also in larger residential programmes where consistency and durability matter.",
    highlights: [
      "950 sqm residential staff-housing project",
      "Lightweight steel framing used for repeatable quality at scale",
      "Planned for durability and practical day-to-day use in Hoedspruit",
      "A strong fit for larger residential accommodation programmes",
    ],
    trustLine:
      "A strong example of lightweight steel framing working well for large-format residential accommodation in warm bushveld conditions, where consistency, speed, and durability all matter.",
    gallery: [
      "/projects/hoedspruit_2.jpg",
      "/projects/hoedspruit_3.jpg",
      "/projects/hoedspruit_4.jpg",
      "/projects/hoedspruit_5.jpg",
      "/projects/hoedspruit_6.jpg",
      "/projects/hoedspruit_7.jpg",
    ],
    bestForLocations: ["build-in-hoedspruit"],
  }),
]);

export const projectList = Object.values(projects);

export function getProjectByKey(key) {
  return projects[key] || null;
}
