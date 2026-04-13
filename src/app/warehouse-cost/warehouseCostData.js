const SITE_URL = 'https://www.smartsteel.co.za';
const PRICE_RATES = {
  structure: { low: 1050, high: 1300 },
  cladding: { low: 1350, high: 1500 },
  turnkey: { low: 1650, high: 2700 },
};

const warehouseCostPages = {
  '7.5x8': {
    width: 8,
    length: 7.5,
    nearbyCity: 'Pretoria',
    bestFor: ['secure stock storage', 'small dispatch hubs', 'farm implement cover'],
    suitability: 'A practical starter warehouse size for secure storage, workshop activity, and light industrial use.',
    heightGuide: 'Most clients look at 3m to 4m eaves for this footprint, depending on vehicle access and shelving.',
    leadTime: 'allow roughly 4 to 6 weeks for manufacture and installation once the design is approved',
    addOns: ['roller shutter door', 'PA door', 'insulation', 'concrete slab', 'gutters and downpipes'],
  },
  '7.5x10': {
    width: 10,
    length: 7.5,
    nearbyCity: 'Pretoria',
    bestFor: ['parts storage', 'light fabrication', 'small logistics overflow'],
    suitability: 'A versatile option when you need more depth for shelving, workstations, or a larger access bay.',
    heightGuide: 'A 3m to 4m eave height usually suits racking, workshop use, and small delivery vehicles.',
    leadTime: 'allow roughly 4 to 6 weeks for a standard shell and longer if the project includes slab and fit-out work',
    addOns: ['roller shutter door', 'personnel door', 'insulation', 'mezzanine-ready design', 'concrete slab'],
  },
  '7.5x12': {
    width: 12,
    length: 7.5,
    nearbyCity: 'Pretoria',
    bestFor: ['agricultural storage', 'larger workshops', 'regional stock holding'],
    suitability: 'This footprint gives you more storage depth without stepping into a much wider, more expensive span.',
    heightGuide: 'Clients often compare 3.5m and 4m eaves here to improve stacking height and roller door clearance.',
    leadTime: 'allow around 5 to 7 weeks depending on final engineering, slab requirements, and delivery distance',
    addOns: ['roller shutter door', 'ridge ventilation', 'insulation', 'concrete slab', 'window and louvre options'],
  },
  '10x8': {
    width: 8,
    length: 10,
    nearbyCity: 'Pretoria',
    bestFor: ['small distribution warehouses', 'trade workshops', 'equipment storage'],
    suitability: 'A popular balance between usable floor area and manageable project cost for growing businesses.',
    heightGuide: 'A 3m to 4m eave height is common, with taller options where forklifts or larger vehicles are involved.',
    leadTime: 'allow approximately 4 to 6 weeks for a standard enclosure and more time for turnkey delivery',
    addOns: ['roller shutter door', 'canopy extension', 'insulation', 'concrete slab', 'electrical-ready detailing'],
  },
  '10x10': {
    width: 10,
    length: 10,
    nearbyCity: 'Pretoria',
    bestFor: ['general warehousing', 'fleet storage', 'small industrial use'],
    suitability: 'At 100 m², this is one of the easiest sizes to compare on a cost-per-square-metre basis.',
    heightGuide: 'Many projects in this range use 4m eaves to create better access, circulation, and vertical storage.',
    leadTime: 'allow roughly 5 to 7 weeks for manufacturing and installation, subject to foundations and site access',
    addOns: ['roller shutter doors', 'insulation', 'fire-rated lining', 'concrete slab', 'office partition allowance'],
  },
  '10x12': {
    width: 12,
    length: 10,
    nearbyCity: 'Pretoria',
    bestFor: ['regional stock rooms', 'fabrication bays', 'agricultural inputs storage'],
    suitability: 'This footprint suits buyers who want more internal depth for circulation, shelving, and separated work zones.',
    heightGuide: 'A 4m eave height is often preferred to support better access and higher storage density.',
    leadTime: 'allow around 5 to 7 weeks for a standard build and longer when civil works are included',
    addOns: ['roller shutter doors', 'insulation', 'ridge ventilation', 'concrete slab', 'mezzanine-ready design'],
  },
  '15x8': {
    width: 8,
    length: 15,
    nearbyCity: 'Pretoria',
    bestFor: ['agricultural sheds', 'vehicle cover', 'light manufacturing'],
    suitability: 'A longer, narrower footprint that works well for workflow-driven spaces and covered loading areas.',
    heightGuide: 'Many projects at this size consider 4m eaves for better vehicle access and working height.',
    leadTime: 'allow about 5 to 7 weeks, depending on engineering sign-off, delivery, and ground conditions',
    addOns: ['roller shutter door', 'canopy extension', 'insulation', 'concrete slab', 'partitioned work area'],
  },
  '15x10': {
    width: 10,
    length: 15,
    nearbyCity: 'Pretoria',
    bestFor: ['mid-size warehouse storage', 'trade depots', 'assembly space'],
    suitability: 'This is a strong option when you need a more serious operational footprint without moving into a large industrial budget.',
    heightGuide: 'A 4m to 5m eave height is common if the building must handle higher roller doors or stacked stock.',
    leadTime: 'allow 6 to 8 weeks for a standard project and more if the scope includes foundations and finishes',
    addOns: ['multiple roller doors', 'insulation', 'ridge ventilation', 'concrete slab', 'office and ablution fit-out'],
  },
  '20x8': {
    width: 8,
    length: 20,
    nearbyCity: 'Pretoria',
    bestFor: ['fleet cover', 'service workshops', 'linear process layouts'],
    suitability: 'A long-span footprint that suits operational flow, drive-through access, and longer equipment storage.',
    heightGuide: 'Clients frequently compare 4m and 5m eaves to accommodate vehicles, hoists, and clear circulation.',
    leadTime: 'allow around 6 to 8 weeks once design details, foundations, and site access are confirmed',
    addOns: ['multiple roller doors', 'insulation', 'mezzanine-ready design', 'concrete slab', 'stormwater goods'],
  },
  '20x10': {
    width: 10,
    length: 20,
    nearbyCity: 'Pretoria',
    bestFor: ['distribution storage', 'industrial workshops', 'farm and equipment warehousing'],
    suitability: 'A solid commercial size for buyers who need meaningful warehouse space with room for access and work zones.',
    heightGuide: 'A 4m to 6m eave height is typical depending on access equipment, stacking needs, and door design.',
    leadTime: 'allow roughly 6 to 8 weeks, with turnkey projects taking longer because of civil and finishing works',
    addOns: ['multiple roller doors', 'insulation', 'ridge ventilation', 'concrete slab', 'office and service areas'],
  },
  '25x8': {
    width: 8,
    length: 25,
    nearbyCity: 'Pretoria',
    bestFor: ['large covered storage', 'equipment bays', 'agricultural and logistics use'],
    suitability: 'This footprint delivers substantial linear storage capacity while remaining easier to stage on long sites.',
    heightGuide: 'Most buyers review 4m to 6m eaves at this size to support practical access and storage flexibility.',
    leadTime: 'allow approximately 6 to 9 weeks, especially when site preparation and slabs are part of the scope',
    addOns: ['multiple access doors', 'insulation', 'ridge ventilation', 'concrete slab', 'loading canopy options'],
  },
};

const formatArea = (value) => `${Number.isInteger(value) ? value : value.toFixed(1)} m²`;
const formatCurrency = (value) => `R${Math.round(value).toLocaleString('en-ZA')}`;
const formatDimension = (value) => `${Number.isInteger(value) ? value : value.toFixed(1)}m`;

export function getWarehouseCostPageConfig(slug) {
  const base = warehouseCostPages[slug];
  if (!base) {
    return null;
  }

  const area = base.width * base.length;
  const structureRange = {
    low: area * PRICE_RATES.structure.low,
    high: area * PRICE_RATES.structure.high,
  };
  const claddingRange = {
    low: area * PRICE_RATES.cladding.low,
    high: area * PRICE_RATES.cladding.high,
  };
  const turnkeyRange = {
    low: area * PRICE_RATES.turnkey.low,
    high: area * PRICE_RATES.turnkey.high,
  };
  const displaySize = `${formatDimension(base.length)} x ${formatDimension(base.width)}`;
  const altSize = `${base.width}x${base.length}`;
  const path = `/warehouse-cost/${slug}`;
  const fullUrl = `${SITE_URL}${path}`;

  return {
    ...base,
    slug,
    area,
    displaySize,
    altSize,
    path,
    fullUrl,
    areaLabel: formatArea(area),
    updatedLabel: 'Updated April 13, 2026',
    pricePerSquareMetre: {
      structure: `${formatCurrency(PRICE_RATES.structure.low)} to ${formatCurrency(PRICE_RATES.structure.high)} per m²`,
      cladding: `${formatCurrency(PRICE_RATES.cladding.low)} to ${formatCurrency(PRICE_RATES.cladding.high)} per m²`,
      turnkey: `${formatCurrency(PRICE_RATES.turnkey.low)} to ${formatCurrency(PRICE_RATES.turnkey.high)} per m²`,
    },
    prices: {
      structure: {
        label: `${formatCurrency(structureRange.low)} - ${formatCurrency(structureRange.high)}`,
        shortLabel: `${formatCurrency(structureRange.low)} to ${formatCurrency(structureRange.high)}`,
      },
      cladding: {
        label: `${formatCurrency(claddingRange.low)} - ${formatCurrency(claddingRange.high)}`,
        shortLabel: `${formatCurrency(claddingRange.low)} to ${formatCurrency(claddingRange.high)}`,
      },
      turnkey: {
        label: `${formatCurrency(turnkeyRange.low)} - ${formatCurrency(turnkeyRange.high)}+`,
        shortLabel: `${formatCurrency(turnkeyRange.low)} to ${formatCurrency(turnkeyRange.high)}+`,
      },
    },
    faqs: [
      {
        q: `How much does a ${displaySize} warehouse cost in South Africa?`,
        a: `For a ${formatArea(area)} lightweight steel warehouse, structure-only pricing usually starts around ${formatCurrency(structureRange.low)} and can reach ${formatCurrency(structureRange.high)}. A fully enclosed shell with cladding is typically ${formatCurrency(claddingRange.low)} to ${formatCurrency(claddingRange.high)}, while a turnkey project can range from ${formatCurrency(turnkeyRange.low)} to ${formatCurrency(turnkeyRange.high)} or more depending on site work, height, doors, and finishes.`,
      },
      {
        q: `What is the cost per m² for a ${displaySize} warehouse?`,
        a: `A warehouse of this size usually works out to about ${formatCurrency(PRICE_RATES.structure.low)} to ${formatCurrency(PRICE_RATES.structure.high)} per m² for structure-only, ${formatCurrency(PRICE_RATES.cladding.low)} to ${formatCurrency(PRICE_RATES.cladding.high)} per m² with cladding, and ${formatCurrency(PRICE_RATES.turnkey.low)} to ${formatCurrency(PRICE_RATES.turnkey.high)} per m² for turnkey delivery.`,
      },
      {
        q: `What usually changes the final price for a ${displaySize} warehouse?`,
        a: `The biggest price drivers are site preparation, foundation requirements, eave height, door sizes, insulation, transport distance, and whether you need a shell only or a full turnkey build.`,
      },
      {
        q: `How long does it take to complete a ${displaySize} steel warehouse?`,
        a: `As a guide, ${base.leadTime}. Final timing depends on engineering approval, civil works, and the complexity of the finishes you choose.`,
      },
    ],
  };
}

export function buildWarehouseCostMetadata(slug) {
  const config = getWarehouseCostPageConfig(slug);
  if (!config) {
    return {};
  }

  const title = `${config.displaySize} Warehouse Cost in South Africa (2026) | Smart Steel`;
  const description = `See estimated ${config.displaySize} steel warehouse costs in South Africa, including structure-only, cladding, and turnkey pricing for ${config.areaLabel.toLowerCase()} warehouse builds.`;

  return {
    title,
    description,
    keywords: [
      `${config.displaySize} warehouse cost`,
      `${config.altSize} warehouse cost`,
      `${config.displaySize} steel warehouse price`,
      `warehouse cost South Africa`,
      `steel warehouse prices`,
      `prefab warehouse cost`,
    ],
    alternates: {
      canonical: config.path,
    },
    openGraph: {
      title,
      description,
      url: config.fullUrl,
      siteName: 'Smart Steel',
      locale: 'en_ZA',
      type: 'article',
      images: [
        {
          url: '/og-warehouse.jpg',
          width: 1200,
          height: 630,
          alt: `${config.displaySize} warehouse cost guide`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-warehouse.jpg'],
    },
  };
}

export function getWarehouseCostSlugs() {
  return Object.keys(warehouseCostPages);
}
