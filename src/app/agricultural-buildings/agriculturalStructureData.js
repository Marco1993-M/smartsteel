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
    status: "Available",
    href: "/agricultural-buildings/poultry-houses",
  },
  {
    title: "Milking and dairy sheds",
    description: "Practical steel cover for milking, holding and dairy-support areas.",
    status: "Available",
    href: "/agricultural-buildings/dairy-milking-sheds",
  },
  {
    title: "Cattle and feedlot sheds",
    description: "Roofed livestock areas and structural cover coordinated with the handling layout.",
    status: "Available",
    href: "/agricultural-buildings/cattle-feedlot-sheds",
  },
  {
    title: "Sheep and small-stock sheds",
    description: "Steel structures for lambing, shearing and covered small-stock facilities.",
    status: "Available",
    href: "/agricultural-buildings/sheep-small-stock-sheds",
  },
  {
    title: "Grain and farm storage",
    description: "Atlas storage buildings for equipment, inputs and protected on-farm operations.",
    status: "Available",
    href: "/agricultural-buildings/grain-farm-storage",
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
    heroBuilderLabel: "Preview the W10 × 32m shell",
    builderSectionTitle: "Three shells for the main 20-sow functions",
    builderSectionDescription: "Published guidance separates breeding, farrowing and growing functions. These preliminary Atlas sizes round those outlines to released spans and 4m structural bays. They are starting points for budgeting, not final livestock-layout or engineering approval.",
    sizingGuidance: "Confirm the production flow and specialist layout before fixing the structural envelope.",
    formGuidance: "Think about the proposed site, breeding capacity, functional areas and preferred project timing. Smart Steel can use this to shape the first Atlas building-shell proposal.",
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
  "poultry-houses": {
    slug: "poultry-houses", metaTitle: "Poultry Houses South Africa | Atlas Smart Steel", metaDescription: "Plan an Atlas steel poultry house for broilers or layers in South Africa, with site, ventilation, hygiene and flock requirements considered from the start.",
    eyebrow: "Agricultural structures / poultry housing", title: "Poultry houses planned around flock, airflow and site", summary: "An effective poultry house starts with the production system and environmental brief. Smart Steel configures the Atlas structural shell around flock type, capacity, ventilation, hygiene and future operating needs.",
    keywords: ["poultry houses South Africa", "steel chicken houses", "broiler house construction", "layer chicken housing", "poultry shed quotation"], primaryCta: "Request a poultry-house review",
    heroBuilderLabel: "Explore the Atlas 3D builder", builderSectionTitle: "Capacity and environment come before a preset size", builderSectionDescription: "ARC guidance identifies siting, temperature, humidity, ventilation, lighting and cleanability as core housing decisions. A responsible shell recommendation therefore starts with the flock and environmental strategy, not a generic footprint.", sizingGuidance: "Tell us whether the project is for broilers, layers, pullets or brooding; the intended bird capacity; ventilation approach; equipment layout; and site. We will translate that brief into an appropriate released Atlas span and 4m bay length.", formGuidance: "Have the bird type and target capacity in mind, plus the proposed site, ventilation approach, equipment supplier and whether the project is naturally or mechanically ventilated.", builderConfigurations: [],
    quoteForm: { defaultProjectNeed: "Broiler poultry house", projectOptions: ["Broiler poultry house", "Layer poultry house", "Pullet or brooding house", "Other poultry structure"], briefOptions: ["I know the bird type and capacity", "I have an equipment or ventilation brief", "I have a preliminary layout", "I have professional drawings"] },
    heroMetric: "4", heroMetricLabel: "Housing priorities", heroFacts: [["Application", "Broilers or layers"], ["Sizing basis", "Flock and system"], ["Service area", "South Africa"]], ctaPrompt: "Planning a new poultry house?", ctaDetail: "Share the flock type, capacity, site and environmental-control approach. We will frame the first Atlas structural proposal around the way the house must operate.",
    lastReviewed: "26 October 2026", lastReviewedIso: "2026-10-26", planLabel: "poultry house", systemLabel: "Atlas agricultural building shell", locationLabel: "Projects across South Africa",
    introTitle: "The shell must support the poultry environment.", intro: ["Poultry housing is an environmental system as much as a building. Public ARC guidance places temperature, humidity, ventilation, ammonia management, light, floor conditions and hygiene at the centre of the housing brief.", "Smart Steel defines the Atlas frame, roof and agreed enclosure around that brief. Stocking decisions, ventilation equipment, internal systems, biosecurity and production management remain part of the farmer’s specialist poultry plan."],
    planningBasis: { title: "What the poultry brief should establish", description: "ARC poultry material provides clear planning principles without publishing one universal house size for every production system.", points: ["A well-drained site protected from flooding and suitable building orientation", "Ventilation designed for bird age, stocking density, temperature and humidity", "Rain protection, shade, lighting and an interior that can be cleaned effectively", "House separation and farm layout considered as part of disease-risk management", "Water, feeding, brooding and other equipment coordinated before the frame is fixed"], sourceLabel: "ARC: Climate-smart poultry production", sourceUrl: "https://arc.agric.za/arc-iscw/csa-toolbox/pages/assets/modules/11.pdf", supportingSourceLabel: "ARC: Poultry housing for layer chickens", supportingSourceUrl: "https://www.arc.agric.za/arc-iae/News%20Articles%20Library/Poultry%20houses%20for%20layer%20chickens.pdf" },
    scope: [{ title: "Structural frame", text: "An Atlas steel frame configured for the selected span, length, loads and equipment coordination." }, { title: "Roof and enclosure", text: "Agreed roofing and cladding zones coordinated with the chosen natural or mechanical ventilation strategy." }, { title: "Defined delivery scope", text: "A documented supply and installation package with exclusions, site requirements and finish specifications clearly recorded." }],
    responsibilities: { smartSteel: ["Translate the poultry brief into an Atlas structural proposal", "Coordinate frame geometry with agreed openings and equipment zones", "Define structural, roofing and cladding inclusions", "Confirm assumptions before manufacture"], client: ["Confirm flock type, capacity and production system", "Appoint poultry, ventilation and professional specialists where required", "Confirm site, orientation, biosecurity and approval requirements", "Coordinate floors, drainage, water, power, equipment and environmental controls"] },
    considerations: [{ title: "Ventilation", text: "Natural or mechanical ventilation changes openings, enclosure and equipment coordination." }, { title: "Heat and humidity", text: "Insulation and environmental control must suit local climate, bird age and stocking strategy." }, { title: "Hygiene and corrosion", text: "Wash-down, moisture, manure and ammonia exposure affect detailing and finish selection." }, { title: "Farm layout", text: "House spacing, access, drainage and prevailing wind should be reviewed across the whole site." }],
    inputs: ["Broiler, layer, pullet or brooding application", "Target bird capacity and management system", "Farm location, orientation and proposed position", "Natural or mechanical ventilation brief", "Feeding, watering, lighting and equipment layouts", "Roofing, insulation and cladding requirements"],
    process: [{ number: "01", title: "Define the flock brief", text: "Confirm production type, capacity, climate strategy and equipment." }, { number: "02", title: "Set the building envelope", text: "Select the Atlas span and bay length around the operational layout." }, { number: "03", title: "Coordinate the interfaces", text: "Record openings, cladding, services and specialist responsibilities." }, { number: "04", title: "Review and quote", text: "Confirm engineering, finishes, delivery and installation scope." }],
    faqs: [{ question: "Can Smart Steel recommend a poultry-house size from bird numbers alone?", answer: "Bird numbers are a starting point, but flock type, age, production system, stocking policy, ventilation and equipment layout also affect the envelope. Smart Steel confirms these inputs before recommending an Atlas size." }, { question: "Does Atlas include poultry equipment and ventilation fans?", answer: "Not as part of the standard structural shell. Equipment, controls, electrical work and specialist ventilation can be coordinated but are included only when expressly stated in the quotation." }, { question: "Is the building an official ARC poultry-house plan?", answer: "No. ARC public guidance informs the planning questions. Atlas is Smart Steel’s independent structural system and the final project remains site- and operation-specific." }, { question: "Can the house be naturally ventilated?", answer: "Potentially, subject to the production system, climate, orientation, openings and specialist assessment. The chosen approach must be confirmed before enclosure details are fixed." }],
    disclaimer: "Smart Steel is an independent structural supplier and is not affiliated with or endorsed by the Agricultural Research Council. ARC material is used as public planning guidance; final stocking, welfare, biosecurity and environmental-control decisions require the client’s agricultural and professional team.",
  },
  "dairy-milking-sheds": {
    slug: "dairy-milking-sheds", metaTitle: "Dairy Milking Sheds South Africa | Atlas Smart Steel", metaDescription: "Plan an Atlas steel milking shed around cow flow, drainage, milk-room, feed-room and dairy equipment requirements for South African farms.", eyebrow: "Agricultural structures / dairy", title: "Milking sheds shaped around cow flow and clean operation", summary: "Smart Steel configures the Atlas shell around the parlour system, holding and exit flow, milk and feed rooms, drainage strategy and the equipment team’s working clearances.", keywords: ["milking sheds South Africa", "dairy shed construction", "steel milking parlour", "small scale milking shed", "dairy farm buildings"], primaryCta: "Request a dairy-shed review",
    heroBuilderLabel: "Explore the Atlas 3D builder", builderSectionTitle: "Start with the parlour and cow-flow plan", builderSectionDescription: "ARC’s small-scale milking-shed guidance emphasises drainage, orientation, airflow and a functional relationship between the parlour, manure canal, milk room, feed room and cow routes. Those operational interfaces should determine the steel envelope.", sizingGuidance: "Send the herd size, parlour type and equipment layout, cow entry and exit arrangement, holding requirement, service rooms and site. Smart Steel will then select a practical Atlas span and released bay length.", formGuidance: "Prepare the herd size, proposed parlour or equipment supplier, cow entry and exit flow, holding area, milk-room and feed-room needs, plus the farm location.", builderConfigurations: [],
    quoteForm: { defaultProjectNeed: "Milking parlour and dairy shed", projectOptions: ["Milking parlour and dairy shed", "Covered holding area", "Milk or feed-room structure", "Other dairy structure"], briefOptions: ["I know the herd size and parlour type", "I have an equipment supplier layout", "I have a preliminary dairy layout", "I have professional drawings"] },
    heroMetric: "1:70", heroMetricLabel: "Published floor-fall reference", heroFacts: [["Application", "Milking and dairy"], ["Starting point", "Parlour layout"], ["Service area", "South Africa"]], ctaPrompt: "Planning a milking facility?", ctaDetail: "Share the herd, parlour arrangement, rooms, cow flow and site. We will shape the Atlas shell around the operating layout rather than impose a generic shed.", lastReviewed: "26 October 2026", lastReviewedIso: "2026-10-26", planLabel: "dairy or milking shed", systemLabel: "Atlas agricultural building shell", locationLabel: "Projects across South Africa",
    introTitle: "A milking shed works when movement, hygiene and services work together.", intro: ["The structure must accommodate calm cow movement, operator access, manure removal, wash-down, milk handling and the selected milking equipment. Public ARC guidance for a small-scale shed illustrates these relationships and highlights site drainage and airflow.", "Atlas supplies the structural platform around the confirmed dairy layout. Floors, falls, drains, manure systems, dairy equipment, food-safety systems and professional approvals must be coordinated as project-specific work."],
    planningBasis: { title: "What the dairy layout should resolve", description: "ARC’s public small-scale milking-shed article is a planning reference, not a universal building dimension.", points: ["A well-drained position outside flood-prone ground", "An entrance and building orientation that account for prevailing wind and airflow", "Clear cow entry, milking and exit movement", "Coordination of parlour, manure canal, feed room and milk room", "Floor falls, wash-down, drainage and equipment services resolved with the civil layout"], sourceLabel: "ARC: Erect a small-scale milking shed", sourceUrl: "https://www.arc.agric.za/Agricultural%20Sector%20News/Erect%20a%20small-scale%20milking%20shed.pdf", supportingSourceLabel: "ARC agricultural structures services", supportingSourceUrl: "https://www.arc.agric.za/arc-iae/Pages/Agricultural-Structures-and-Environmental-Engineering.aspx" },
    scope: [{ title: "Atlas shell", text: "A steel frame and roof envelope coordinated with the parlour and room arrangement." }, { title: "Openings and cover", text: "Agreed wall, door and ventilation zones positioned around cow and equipment movement." }, { title: "Project interfaces", text: "A documented division between structural supply, civils, dairy equipment, services and approvals." }],
    responsibilities: { smartSteel: ["Develop the structural envelope from the dairy brief", "Coordinate columns and clearances with the agreed layout", "Define roofing, cladding and installation scope", "Record structural assumptions before manufacture"], client: ["Confirm herd size, parlour type and equipment supplier", "Provide the cow-flow, holding and service-room layout", "Coordinate floors, falls, drains, manure and wash-down systems", "Obtain professional designs, approvals and food-safety guidance"] },
    considerations: [{ title: "Cow flow", text: "Entry, holding, milking and exit routes should avoid structural conflicts and operational bottlenecks." }, { title: "Drainage", text: "Falls, channels and manure handling are civil works that must be fixed early." }, { title: "Equipment clearances", text: "Parlour rails, pits, plant and services need coordinated working and maintenance space." }, { title: "Hygiene and corrosion", text: "Frequent wash-down and dairy conditions influence materials, finishes and detailing." }],
    inputs: ["Herd size and milking routine", "Parlour type and supplier layout", "Cow entry, holding and exit arrangement", "Milk-room, feed-room and service needs", "Site, access, orientation and drainage context", "Roofing, cladding and ventilation requirements"],
    process: [{ number: "01", title: "Map the dairy flow", text: "Confirm herd, parlour, rooms, movement and services." }, { number: "02", title: "Define clearances", text: "Coordinate the structural grid with livestock and equipment zones." }, { number: "03", title: "Separate the scopes", text: "Record steel, civils, equipment, drainage and service responsibilities." }, { number: "04", title: "Review and quote", text: "Confirm the Atlas package, engineering and delivery approach." }],
    faqs: [{ question: "Do I need a completed dairy plan first?", answer: "No. A herd target, likely parlour system, site and room requirements are enough to begin. The final envelope is confirmed as the equipment and civil layouts develop." }, { question: "Does Smart Steel build the milking pit and drains?", answer: "These are not part of the standard Atlas steel shell. Concrete floors, pits, falls, channels, manure systems and below-ground services require separate civil design and scope." }, { question: "Is this the ARC small-scale milking-shed design?", answer: "No. The ARC article is referenced for planning principles. Smart Steel provides an independent Atlas structural solution based on the project-specific operating brief." }, { question: "Can the shed include a milk room and feed room?", answer: "Yes, those spaces can be allowed for within or beside the structural envelope, subject to the confirmed layout, hygiene requirements and specialist equipment." }],
    disclaimer: "Smart Steel is an independent structural supplier and is not affiliated with or endorsed by the Agricultural Research Council. ARC material is public planning guidance; dairy equipment, food safety, civils and operational approval remain project-specific.",
  },
  "cattle-feedlot-sheds": {
    slug: "cattle-feedlot-sheds", metaTitle: "Cattle & Feedlot Shade Structures South Africa | Atlas", metaDescription: "Plan Atlas steel cattle and feedlot shade structures using herd capacity, airflow, site and published ARC heat-load guidance.", eyebrow: "Agricultural structures / cattle", title: "Cattle and feedlot cover designed for heat, airflow and access", summary: "Atlas fixed steel cover can support cattle handling, dry-lot and feedlot operations when shade area, airflow, machinery access and manure management are resolved together.", keywords: ["cattle shade structures South Africa", "feedlot shed", "steel cattle shelter", "feedlot shade construction", "cattle handling shed"], primaryCta: "Request a cattle-shed review",
    heroBuilderLabel: "Preview a 100-LSU starting envelope", builderSectionTitle: "A transparent starting point for fixed feedlot shade", builderSectionDescription: "The ARC Beef Bulletin illustrates a 100-LSU heat-load calculation using 3m² shade per animal and a 75% compromise, or 225m². The W15 × 16m Atlas shell provides 240m² of roof area as a preliminary fixed-cover envelope; it is not a universal stocking prescription.", sizingGuidance: "Confirm stocking, pen layout and specialist requirements before treating roof area as usable animal shade.", formGuidance: "Share the cattle numbers and class, feedlot or handling purpose, pen layout, shade target, machinery routes, water and feed positions, plus the proposed site.", builderConfigurations: [{ code: "W15 / 16", title: "Illustrative 100-LSU fixed-cover envelope", width: 15, length: 16, height: 3, note: "A 240m² roof-only Atlas starting point for review against the ARC bulletin’s 225m² illustrative shade target.", basis: "ARC Beef Bulletin example: 100 LSU × 3m², using a 75% compromise = 225m². Final usable shade depends on sun angle, orientation, height and layout." }],
    quoteForm: { defaultProjectNeed: "Fixed cattle or feedlot shade", projectOptions: ["Fixed cattle or feedlot shade", "Covered cattle handling area", "Feed and water-area cover", "Other cattle structure"], briefOptions: ["I know the cattle numbers and purpose", "I have a pen or handling layout", "I have a preliminary site layout", "I have professional drawings"] },
    heroMetric: "225", heroMetricLabel: "m² ARC example for 100 LSU", heroFacts: [["Application", "Shade and handling"], ["Atlas example", "240m² roof"], ["Service area", "South Africa"]], ctaPrompt: "Need fixed cattle or feedlot cover?", ctaDetail: "Send the livestock capacity, pen plan, site and operating routes. We will test an Atlas envelope against the actual shade and access brief.", lastReviewed: "26 October 2026", lastReviewedIso: "2026-10-26", planLabel: "cattle or feedlot structure", systemLabel: "Atlas roof-only or enclosed shell", locationLabel: "Projects across South Africa",
    introTitle: "Roof area is only useful when it creates effective shade.", intro: ["ARC beef guidance describes shade as a heat-load management measure and stresses airflow, position and the relationship to nearby buildings. The shadow cast by a structure changes with orientation, height and time of day, so nominal roof area is not automatically equivalent to effective animal shade.", "Smart Steel can configure Atlas as fixed roof cover or as a more enclosed handling or farm building. Livestock density, welfare, feedlot design, pen surfaces, water, feed, manure and veterinary requirements remain part of the farm’s professional operating plan."],
    planningBasis: { title: "What the cattle-cover brief should test", description: "The ARC Beef Bulletin provides a practical heat-load and shade-area example while making clear that site and airflow matter.", points: ["Airflow around fixed shade and separation from obstructions", "Shade target based on animal numbers, class and heat-load strategy", "Orientation and structural height reviewed for the actual shadow footprint", "Feed, water, pen and machinery routes kept clear of columns and bracing", "Drainage, surface wear and manure removal coordinated with the site works"], sourceLabel: "ARC Beef Bulletin 2023", sourceUrl: "https://www.arc.agric.za/arc-api/Newsletter%20Library/ARC%20Beef%20Bulletin%202023%20Digital.pdf", supportingSourceLabel: "ARC agricultural structures services", supportingSourceUrl: "https://www.arc.agric.za/arc-iae/Pages/Services.aspx" },
    scope: [{ title: "Fixed Atlas cover", text: "A roof-only or partially enclosed steel structure sized for the agreed site and load conditions." }, { title: "Operational clearances", text: "A structural grid reviewed around pens, cattle movement, feeding and machinery access." }, { title: "Defined steel package", text: "Engineering, manufacture and agreed delivery or installation scope with clear civil exclusions." }],
    responsibilities: { smartSteel: ["Develop the Atlas envelope from the livestock and site brief", "Review structural spans and column positions", "Define roofing, optional cladding and finish scope", "Confirm structural assumptions and quotation boundaries"], client: ["Confirm cattle numbers, classes and operating system", "Provide pen, handling, feed, water and access layouts", "Coordinate welfare, veterinary, drainage and manure requirements", "Appoint professionals and obtain approvals where required"] },
    considerations: [{ title: "Effective shade", text: "Orientation, height, sun angle and time determine where the shadow falls." }, { title: "Air movement", text: "Obstructions and nearby buildings can reduce the cooling benefit of shade." }, { title: "Heavy access", text: "Feed delivery, scraping and livestock routes need suitable clearances and surfaces." }, { title: "Corrosion and wear", text: "Manure, moisture and wash-down influence detailing and coating choices." }],
    inputs: ["Cattle numbers, class and operating purpose", "Target shade area or handling footprint", "Pen, feed, water and movement layout", "Farm location, terrain and nearby obstructions", "Machinery clearances and access routes", "Roof-only or enclosure requirements"],
    process: [{ number: "01", title: "Set the livestock brief", text: "Confirm numbers, use, heat strategy and operating layout." }, { number: "02", title: "Test the shade envelope", text: "Review area, orientation, height and structural grid." }, { number: "03", title: "Coordinate the site", text: "Resolve access, drainage, surfaces and civil interfaces." }, { number: "04", title: "Engineer and quote", text: "Confirm the Atlas package for the site and scope." }],
    faqs: [{ question: "Is 3m² of shade per animal a legal universal requirement?", answer: "No. It is used in the cited ARC Beef Bulletin as a practical example. The appropriate target depends on livestock, climate, operation and professional guidance." }, { question: "Why is the Atlas example 240m² rather than 225m²?", answer: "Atlas uses released spans and 4m structural length bays. A W15 × 16m roof provides 240m², slightly above the bulletin’s illustrative 225m² target." }, { question: "Does 240m² of roof guarantee 240m² of usable shade?", answer: "No. Effective shade changes with orientation, roof height, sun angle and time. The project layout must evaluate the actual shadow and animal access." }, { question: "Can Atlas cover cattle handling facilities as well as pens?", answer: "Yes. The structural envelope can be coordinated around handling and working areas, provided the livestock system, gates, races, crush and machinery clearances are confirmed." }],
    disclaimer: "The W15 × 16m option is an illustrative structural starting point derived from an ARC Beef Bulletin example, not a universal stocking or welfare specification. Smart Steel is independent of the ARC; final livestock, shade, site and approval decisions remain project-specific.",
  },
  "sheep-small-stock-sheds": {
    slug: "sheep-small-stock-sheds", metaTitle: "Sheep & Small-Stock Sheds South Africa | Atlas", metaDescription: "Plan Atlas steel sheep and small-stock sheds for lambing, shearing, handling or weather cover around flock, climate and operating needs.", eyebrow: "Agricultural structures / small stock", title: "Sheep and small-stock sheds built around the farming task", summary: "Whether the priority is lambing, shearing, handling or weather protection, the right Atlas shell begins with the flock, seasonal workflow, local climate and internal equipment.", keywords: ["sheep sheds South Africa", "small stock shelters", "lambing shed", "shearing shed South Africa", "steel livestock sheds"], primaryCta: "Request a small-stock shed review",
    heroBuilderLabel: "Explore the Atlas 3D builder", builderSectionTitle: "Choose the operation before choosing the footprint", builderSectionDescription: "Public ARC small-stock guidance highlights heat, drought, storms, water, nutrition and environmental modification. It does not provide one public universal shed dimension for lambing, shearing and handling, which are materially different uses.", sizingGuidance: "Tell us the species, flock size, seasonal use, lambing or shearing workflow, pen and race layout, equipment and site. We will select an Atlas span and bay length around that operating brief.", formGuidance: "Share the sheep or goat numbers, intended use, pen or shearing layout, seasonal occupancy, site exposure and whether the structure is open-sided or enclosed.", builderConfigurations: [],
    quoteForm: { defaultProjectNeed: "Lambing or weather-protection shed", projectOptions: ["Lambing or weather-protection shed", "Shearing shed", "Covered handling facility", "Other small-stock structure"], briefOptions: ["I know the flock size and intended use", "I have a pen, race or equipment layout", "I have a preliminary site layout", "I have professional drawings"] },
    heroMetric: "4", heroMetricLabel: "Distinct use cases", heroFacts: [["Applications", "Lambing to shearing"], ["Sizing basis", "Flock and workflow"], ["Service area", "South Africa"]], ctaPrompt: "Planning small-stock cover?", ctaDetail: "Describe the flock, seasonal task and site. Smart Steel will develop the Atlas shell around the actual work that must happen beneath it.", lastReviewed: "26 October 2026", lastReviewedIso: "2026-10-26", planLabel: "sheep or small-stock shed", systemLabel: "Atlas agricultural building shell", locationLabel: "Projects across South Africa",
    introTitle: "Lambing, shearing and handling need different buildings.", intro: ["Small-stock structures can protect vulnerable animals, support seasonal lambing, create a controlled shearing workspace or cover handling facilities. Each use has different occupancy, hygiene, ventilation, pen, equipment and movement needs.", "ARC climate-smart small-stock material provides useful context on heat, storms, water and environmental modification. Smart Steel uses the farm brief to turn those operating needs into an Atlas structural envelope without presenting a generic shed as an animal-production standard."],
    planningBasis: { title: "What the small-stock brief should resolve", description: "The public ARC resource supports a climate- and operation-led approach rather than a fixed universal building size.", points: ["Species, flock size, class and the seasonal purpose of the building", "Protection from heat, storms and prevailing weather while retaining suitable airflow", "Pens, races, shearing equipment and animal movement coordinated with columns", "Water, feeding, handling and cleaning requirements", "Dry siting, drainage, vehicle access and future expansion"], sourceLabel: "ARC: Climate-smart small-stock production", sourceUrl: "https://www.arc.agric.za/arc-iscw/CSA-Toolbox/Pages/CSA-Small-Stock-Production.aspx", supportingSourceLabel: "ARC agricultural structures services", supportingSourceUrl: "https://www.arc.agric.za/arc-iae/Pages/Services.aspx" },
    scope: [{ title: "Purpose-fit Atlas frame", text: "A released steel span and bay layout selected around the small-stock operation." }, { title: "Weather envelope", text: "Roofing and agreed cladding zones developed around exposure, airflow and use." }, { title: "Clear responsibility split", text: "A defined boundary between the steel shell, pens, equipment, civils and approvals." }],
    responsibilities: { smartSteel: ["Translate the small-stock brief into a structural envelope", "Coordinate the grid with agreed movement and equipment zones", "Define frame, roof, cladding and installation scope", "Confirm assumptions before manufacture"], client: ["Confirm species, flock size, use and seasonal workflow", "Provide pen, race, shearing or handling layouts", "Coordinate welfare, water, drainage, floors and equipment", "Confirm site, approvals and professional requirements"] },
    considerations: [{ title: "Seasonal use", text: "Peak lambing, shearing or sale periods can govern space and access." }, { title: "Weather exposure", text: "Open sides, cladding and orientation should balance shelter with airflow." }, { title: "Animal movement", text: "Pens, gates, races and exits must work with the structural grid." }, { title: "Cleaning and surfaces", text: "Floor, drainage and manure arrangements influence hygiene and durability." }],
    inputs: ["Species, flock size and animal classes", "Lambing, shearing, handling or shelter use", "Seasonal occupancy and workflow", "Pen, race and equipment layouts", "Farm location, exposure and drainage", "Roofing and enclosure preference"],
    process: [{ number: "01", title: "Define the use", text: "Establish the flock, task, season and workflow." }, { number: "02", title: "Plan movement", text: "Coordinate pens, equipment, access and structural columns." }, { number: "03", title: "Set the envelope", text: "Choose a suitable Atlas span, length and enclosure strategy." }, { number: "04", title: "Review and quote", text: "Confirm engineering, scope and delivery requirements." }],
    faqs: [{ question: "Can one shed handle lambing and shearing?", answer: "Possibly, but the seasonal workflows, hygiene, pens and equipment need to be tested together. A flexible shell should not compromise either operation." }, { question: "Why is there no preset Atlas size on this page?", answer: "ARC’s public small-stock guidance does not establish one universal building footprint, and lambing, shearing and handling have different needs. Smart Steel sizes the shell from the flock and operating layout." }, { question: "Are pens and shearing equipment included?", answer: "They are outside the standard Atlas shell unless specifically included. Their layouts should still be supplied early so columns and clearances can be coordinated." }, { question: "Can the structure be open-sided?", answer: "Yes. Roof-only and partially clad approaches can be considered based on exposure, airflow, animal use and the farm’s professional advice." }],
    disclaimer: "Smart Steel is an independent structural supplier and is not affiliated with or endorsed by the Agricultural Research Council. ARC material is referenced for public climate and production context; final animal-welfare, stocking and operating decisions remain project-specific.",
  },
  "grain-farm-storage": {
    slug: "grain-farm-storage", metaTitle: "Grain & Farm Storage Buildings South Africa | Atlas", metaDescription: "Plan an Atlas steel farm storage building for bagged grain, inputs, machinery or handling areas, with moisture, pests and workflow considered.", eyebrow: "Agricultural structures / farm storage", title: "Farm storage buildings planned around what you store and how you handle it", summary: "Atlas provides a flexible steel warehouse shell for bagged grain, farm inputs, machinery and covered handling. The contents, storage method, moisture strategy and equipment routes determine the right envelope.", keywords: ["farm storage buildings South Africa", "grain storage shed", "steel farm warehouse", "agricultural storage building", "bagged grain storage"], primaryCta: "Request a farm-storage review",
    heroBuilderLabel: "Preview a W12 × 24m shell", builderSectionTitle: "Useful warehouse envelopes, not tonnage promises", builderSectionDescription: "ARC guidance emphasises moisture, temperature, insects and protection from rain, damp and rodents. These Atlas configurations are ordinary structural starting points for discussion; capacity depends on the stored product, stacking system, aisles, equipment and fire requirements.", sizingGuidance: "Confirm product, packaging, stack height and handling method before assigning capacity.", formGuidance: "List what will be stored, whether it is bagged, palletised, bulk or machinery, the expected quantity, stack and aisle arrangement, handling equipment, loading access and moisture-control approach.", builderConfigurations: [{ code: "W10 / 20", title: "Compact farm store", width: 10, length: 20, height: 4, note: "A 200m² Atlas envelope for early layout testing of smaller storage or mixed farm use.", basis: "Released Atlas size only; no grain tonnage is implied." }, { code: "W12 / 24", title: "General farm warehouse", width: 12, length: 24, height: 4, note: "A 288m² starting envelope with a broader span for pallet, input or machinery layouts.", basis: "Released Atlas size only; capacity requires a storage and handling plan." }, { code: "W15 / 32", title: "Larger covered store", width: 15, length: 32, height: 5, note: "A 480m² preliminary shell for larger storage and covered handling studies.", basis: "Released Atlas size only; structure, fire, access and floor loads remain project-specific." }],
    quoteForm: { defaultProjectNeed: "Bagged or palletised grain store", projectOptions: ["Bagged or palletised grain store", "Farm-input warehouse", "Machinery and equipment store", "Mixed farm-storage building"], briefOptions: ["I know the products and quantities", "I have a storage and handling layout", "I have a preliminary building layout", "I have professional drawings"] },
    heroMetric: "<70", heroMetricLabel: "% RH guidance context", heroFacts: [["Applications", "Storage and handling"], ["Capacity basis", "Product and layout"], ["Service area", "South Africa"]], ctaPrompt: "Planning protected farm storage?", ctaDetail: "Tell us what you store, the volume, handling method and site. We will test Atlas envelopes against the real aisle, access and environmental brief.", lastReviewed: "26 October 2026", lastReviewedIso: "2026-10-26", planLabel: "grain or farm storage building", systemLabel: "Atlas agricultural warehouse shell", locationLabel: "Projects across South Africa",
    introTitle: "A storage building is only as good as the storage system inside it.", intro: ["ARC post-harvest guidance identifies moisture, temperature and insect control as central to safe grain storage, while its small-scale wheat material warns against rain, damp, rodents and insects. Those risks cannot be solved by roof area alone.", "Atlas can provide the structural shell for bagged or palletised goods, inputs, machinery and covered handling. It is not, by itself, a sealed grain silo or controlled-atmosphere store. Product condition, floors, aeration, fumigation, pest control and fire strategy need specialist coordination."],
    planningBasis: { title: "What the storage brief should establish", description: "Public ARC guidance supports a product- and risk-led storage plan before choosing a warehouse footprint.", points: ["Stored product, packaging, quantity and required storage period", "Moisture, temperature, ventilation and pest-management strategy", "Stack heights, floor loads, aisles and handling equipment", "Protection from rain, damp, rodents and insects", "Loading access, fire requirements, security and separation of incompatible goods"], sourceLabel: "ARC climate-smart agriculture manual", sourceUrl: "https://www.arc.agric.za/arc-iscw/CSA-Toolbox/Pages/assets/downloads/CSA%20Training%20Manual.pdf", supportingSourceLabel: "ARC stored grain and oil-seed unit", supportingSourceUrl: "https://www.arc.agric.za/arc-ppri/Pages/Pesticide%20Science/Stored-Grain-and-Oil-Seed-Unit.aspx" },
    scope: [{ title: "Warehouse frame", text: "An Atlas steel shell selected for the required span, height, site loads and handling geometry." }, { title: "Weather envelope", text: "Agreed roofing, cladding, doors and openings, with environmental systems separately defined." }, { title: "Operational interfaces", text: "Structural coordination with floors, racks, loading, equipment and specialist storage controls." }],
    responsibilities: { smartSteel: ["Develop Atlas options from the product and handling brief", "Coordinate frame geometry with access and storage zones", "Define roofing, cladding, doors and structural scope", "Confirm engineering assumptions before manufacture"], client: ["Confirm products, quantities, packaging and storage period", "Provide stack, rack, aisle and equipment layouts", "Coordinate moisture, pest, fire and food-safety strategies", "Confirm floors, drainage, services, approvals and site access"] },
    considerations: [{ title: "Moisture control", text: "Roof and walls protect from weather, but stored-product moisture and condensation require a complete strategy." }, { title: "Pest exclusion", text: "Openings, floors, doors and operating practice must address rodents and insects." }, { title: "Floor and racking loads", text: "Product stacks, forklifts, bins and racks require project-specific civil and structural coordination." }, { title: "Fire and separation", text: "Commodity type, packaging and mixed storage can change fire and safety requirements." }],
    inputs: ["Products, packaging, quantities and storage duration", "Stack, pallet, rack or machinery layout", "Forklift and vehicle movement requirements", "Moisture, ventilation and pest-control approach", "Door sizes, loading areas and security needs", "Farm site, services, floor and drainage information"],
    process: [{ number: "01", title: "Define the inventory", text: "Confirm product, volume, packaging and storage period." }, { number: "02", title: "Map handling", text: "Lay out stacks, aisles, vehicles, doors and equipment." }, { number: "03", title: "Select the envelope", text: "Compare released Atlas spans, lengths and heights." }, { number: "04", title: "Coordinate and quote", text: "Resolve environmental, civil, fire and structural interfaces." }],
    faqs: [{ question: "Can you quote grain capacity from floor area alone?", answer: "No. Capacity depends on the product, moisture condition, packaging, stack or bin geometry, aisle space, handling equipment, floor loads and safety requirements." }, { question: "Is an Atlas warehouse a grain silo?", answer: "No. Atlas is a structural building shell. A sealed silo, aeration system or controlled-atmosphere store requires specialist equipment and engineering beyond the standard shell." }, { question: "What does the ARC moisture guidance mean for my project?", answer: "It shows why product moisture, ambient humidity and temperature must be managed. It is not a guarantee that a standard building envelope will keep grain at a safe condition without the required storage systems and operating controls." }, { question: "Can I store machinery and farm inputs in the same building?", answer: "Potentially, subject to layout, contamination, fire, chemical and safety requirements. Incompatible goods may require physical separation and specialist advice." }],
    disclaimer: "The listed Atlas sizes are structural examples and do not represent ARC-approved dimensions or guaranteed grain capacities. Smart Steel is independent of the ARC; stored-product, pest, moisture, fire and food-safety performance require project-specific specialist input.",
  },
}

const REQUIRED_PAGE_FIELDS = [
  "slug", "metaTitle", "metaDescription", "keywords", "eyebrow", "title", "summary",
  "primaryCta", "builderConfigurations", "heroBuilderLabel", "builderSectionTitle", "builderSectionDescription", "sizingGuidance", "formGuidance", "heroMetric", "heroMetricLabel", "heroFacts", "ctaPrompt", "ctaDetail", "planLabel", "systemLabel", "locationLabel", "planningBasis",
  "introTitle", "intro", "scope", "responsibilities", "considerations", "inputs", "process",
  "faqs", "disclaimer", "lastReviewed", "lastReviewedIso",
]

function validateAgriculturalStructure(content) {
  const missing = REQUIRED_PAGE_FIELDS.filter((field) => {
    const value = content?.[field]
    return value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0 && field !== "builderConfigurations")
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
