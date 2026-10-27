import { ATLAS_WAREHOUSE_WIDTH_OPTIONS } from "../../lib/estimates/atlasWarehouseOptions.js";
import { ATLAS_LENGTH_OPTIONS } from "../../lib/atlasConfiguration.js";

const SITE_URL = "https://www.smartsteel.co.za";
export const REGION_WAREHOUSE_WIDTHS = ATLAS_WAREHOUSE_WIDTH_OPTIONS;
// Regional guides intentionally start at 8m; the builder also supports a single 4m bay.
export const REGION_WAREHOUSE_LENGTHS = ATLAS_LENGTH_OPTIONS.filter((length) => length >= 8);

/** @typedef {{label: string, url: string, supports: string}} RegionEvidence */
/**
 * @typedef {Object} WarehouseRegion
 * @property {string} citySlug
 * @property {string} name
 * @property {string} province
 * @property {string} legacySlug
 * @property {string[]} nearby
 * @property {string[]} localZones Areas supported by the recorded primary sources.
 * @property {string} localContext Verified context, without service/performance promises.
 * @property {string[]} localConsiderations Project questions, not asserted engineering requirements.
 * @property {{question: string, answer: string}[]} localFaqs
 * @property {RegionEvidence[]} evidenceSources
 * @property {string} reviewStatus
 */
/** @type {Record<string, WarehouseRegion>} */
const regionWarehousePages = {
  "pretoria": {
    "citySlug": "pretoria",
    "name": "Pretoria",
    "province": "Gauteng",
    "legacySlug": "pretoria-warehouses",
    "nearby": [
      "Centurion",
      "Rosslyn",
      "Midrand"
    ],
    "warehouseSystem": "atlas",
    "heroImage": "/CFLC.webp",
    "localZones": [
      "Rosslyn",
      "Silverton",
      "Waltloo"
    ],
    "industries": [
      "manufacturing",
      "distribution",
      "agricultural storage"
    ],
    "description": "The City of Tshwane identifies Rosslyn, Silverton and Waltloo as industrial estates. Its priority-sector guidance also identifies automotive activity in Rosslyn and Silverton.",
    "intro": "Smart Steel supplies Atlas steel building packages for storage, workshops and agricultural projects in Pretoria. Choose a footprint and sheeting scope, then share your site details for a reviewed quotation.",
    "marketFocus": "For a workshop or parts-storage building, confirm vehicle access, rack heights and any equipment loads before choosing the span and openings.",
    "localContext": "The City of Tshwane identifies Rosslyn, Silverton and Waltloo as industrial estates. Its priority-sector guidance also identifies automotive activity in Rosslyn and Silverton.",
    "localConsiderations": [
      "For a workshop or parts-storage building, confirm vehicle access, rack heights and any equipment loads before choosing the span and openings."
    ],
    "localFaqs": [
      {
        "question": "What should I specify for a Pretoria workshop or parts store?",
        "answer": "Start with the equipment and stock to be accommodated, required clearances and delivery access. Tell us about racks, cranes or suspended services before the structure is reviewed; specialist loads are not implied by a standard Atlas price."
      }
    ],
    "evidenceSources": [
      {
        "label": "City of Tshwane priority sectors and spatial nodes",
        "url": "https://www.tshwane.gov.za/?page_id=64200",
        "supports": "Regional context and named areas; not Smart Steel service availability or project performance."
      },
      {
        "label": "City of Tshwane priority sectors and spatial nodes — additional reference",
        "url": "https://www.tshwane.gov.za/?page_id=64214",
        "supports": "Named areas and regional context."
      }
    ],
    "reviewStatus": "Primary-source context reviewed 2026-10-27; site-specific service scope remains subject to quotation."
  },
  "centurion": {
    "citySlug": "centurion",
    "name": "Centurion",
    "province": "Gauteng",
    "legacySlug": "centurion-warehouses",
    "nearby": [
      "Midrand",
      "Pretoria",
      "Irene"
    ],
    "warehouseSystem": "atlas",
    "heroImage": "/CFLC.webp",
    "localZones": [
      "Hennopspark",
      "Sunderland Ridge",
      "Irene",
      "Rooihuiskraal"
    ],
    "industries": [
      "logistics",
      "trade depots",
      "commercial storage"
    ],
    "description": "Tshwane lists Hennopspark, Sunderland Ridge, Irene and Rooihuiskraal among its industrial estates. These provide distinct locations to consider when planning a Centurion warehouse enquiry.",
    "intro": "Smart Steel supplies Atlas steel building packages for storage, workshops and agricultural projects in Centurion. Choose a footprint and sheeting scope, then share your site details for a reviewed quotation.",
    "marketFocus": "For a business-park site, send the actual street address and any estate access or architectural requirements. Access from the public road alone does not establish unloading space.",
    "localContext": "Tshwane lists Hennopspark, Sunderland Ridge, Irene and Rooihuiskraal among its industrial estates. These provide distinct locations to consider when planning a Centurion warehouse enquiry.",
    "localConsiderations": [
      "For a business-park site, send the actual street address and any estate access or architectural requirements. Access from the public road alone does not establish unloading space."
    ],
    "localFaqs": [
      {
        "question": "What details help with a Centurion business-park warehouse quote?",
        "answer": "Include the park name, street address, available building footprint and any estate rules. Confirm gate clearance, delivery vehicle access and unloading space so transport and installation can be scoped for the actual site."
      }
    ],
    "evidenceSources": [
      {
        "label": "City of Tshwane spatial nodes",
        "url": "https://www.tshwane.gov.za/?page_id=64214",
        "supports": "Regional context and named areas; not Smart Steel service availability or project performance."
      }
    ],
    "reviewStatus": "Primary-source context reviewed 2026-10-27; site-specific service scope remains subject to quotation."
  },
  "johannesburg": {
    "citySlug": "johannesburg",
    "name": "Johannesburg",
    "province": "Gauteng",
    "legacySlug": "johannesburg-warehouses",
    "nearby": [
      "Roodepoort",
      "Midrand",
      "Kempton Park"
    ],
    "warehouseSystem": "atlas",
    "heroImage": "/CFLC.webp",
    "localZones": [
      "Johannesburg",
      "City Deep"
    ],
    "industries": [
      "distribution",
      "light industrial",
      "fleet and logistics"
    ],
    "description": "The City of Johannesburg identifies City Deep as a freight and logistics hub, with road and rail connections. A storage building serving dispatch operations needs a layout planned around the movement of goods.",
    "intro": "Smart Steel supplies Atlas steel building packages for storage, workshops and agricultural projects in Johannesburg. Choose a footprint and sheeting scope, then share your site details for a reviewed quotation.",
    "marketFocus": "For stock holding or dispatch, separate the covered building footprint from truck turning, loading and yard space. Share opening positions and the largest delivery vehicle expected.",
    "localContext": "The City of Johannesburg identifies City Deep as a freight and logistics hub, with road and rail connections. A storage building serving dispatch operations needs a layout planned around the movement of goods.",
    "localConsiderations": [
      "For stock holding or dispatch, separate the covered building footprint from truck turning, loading and yard space. Share opening positions and the largest delivery vehicle expected."
    ],
    "localFaqs": [
      {
        "question": "Does the warehouse price include a Johannesburg dispatch yard?",
        "answer": "No. The guide covers the selected steel building and sheeting scope. Yard surfacing, loading areas, docks and vehicle circulation space need a separate site layout and agreed scope."
      }
    ],
    "evidenceSources": [
      {
        "label": "City of Johannesburg freight and logistics",
        "url": "https://joburg.org.za/work_/InvestInJoburg/Pages/Freight-and-Logistics.aspx",
        "supports": "Regional context and named areas; not Smart Steel service availability or project performance."
      }
    ],
    "reviewStatus": "Primary-source context reviewed 2026-10-27; site-specific service scope remains subject to quotation."
  },
  "midrand": {
    "citySlug": "midrand",
    "name": "Midrand",
    "province": "Gauteng",
    "legacySlug": "midrand-warehouses",
    "nearby": [
      "Centurion",
      "Sandton",
      "Kempton Park"
    ],
    "warehouseSystem": "atlas",
    "heroImage": "/CFLC.webp",
    "localZones": [
      "Halfway House",
      "Randjespark",
      "Kyalami"
    ],
    "industries": [
      "logistics",
      "distribution",
      "commercial storage"
    ],
    "description": "Johannesburg’s Region A guidance places Midrand between Johannesburg and Pretoria, connected by the N1 and K101. It identifies logistics, warehousing and distribution among the area’s development activities.",
    "intro": "Smart Steel supplies Atlas steel building packages for storage, workshops and agricultural projects in Midrand. Choose a footprint and sheeting scope, then share your site details for a reviewed quotation.",
    "marketFocus": "For a distribution or overflow-storage enquiry, specify stock heights, loading openings and access inside the property. A corridor location does not determine which delivery vehicle can enter the site.",
    "localContext": "Johannesburg’s Region A guidance places Midrand between Johannesburg and Pretoria, connected by the N1 and K101. It identifies logistics, warehousing and distribution among the area’s development activities.",
    "localConsiderations": [
      "For a distribution or overflow-storage enquiry, specify stock heights, loading openings and access inside the property. A corridor location does not determine which delivery vehicle can enter the site."
    ],
    "localFaqs": [
      {
        "question": "Can I plan a Midrand overflow-storage building online?",
        "answer": "Yes. Compare a standard Atlas footprint and sheeting scope, then share how the building will connect with your current operation. Confirm stock heights, openings, site access and any estate requirements before a final quote."
      }
    ],
    "evidenceSources": [
      {
        "label": "City of Johannesburg Region A business and suburbs",
        "url": "https://joburg.org.za/about_/regions/Pages/Region%20A%20-%20Diepsloot%2C%20Midrand/business.aspx",
        "supports": "Regional context and named areas; not Smart Steel service availability or project performance."
      },
      {
        "label": "City of Johannesburg Region A business and suburbs — additional reference",
        "url": "https://joburg.org.za/about_/regions/Pages/Region%20A%20-%20Diepsloot%2C%20Midrand/suburbs.aspx",
        "supports": "Named areas and regional context."
      }
    ],
    "reviewStatus": "Primary-source context reviewed 2026-10-27; site-specific service scope remains subject to quotation."
  },
  "roodepoort": {
    "citySlug": "roodepoort",
    "name": "Roodepoort",
    "province": "Gauteng",
    "legacySlug": "roodepoort-warehouses",
    "nearby": [
      "Johannesburg",
      "Krugersdorp",
      "Randburg"
    ],
    "warehouseSystem": "atlas",
    "heroImage": "/CFLC.webp",
    "localZones": [
      "Laser Park",
      "Florida",
      "Roodepoort"
    ],
    "industries": [
      "trade services",
      "storage",
      "light industrial"
    ],
    "description": "Johannesburg’s Region C guidance identifies industrial development at Laser Park and describes the wider Roodepoort area as a mix of residential and commercial uses.",
    "intro": "Smart Steel supplies Atlas steel building packages for storage, workshops and agricultural projects in Roodepoort. Choose a footprint and sheeting scope, then share your site details for a reviewed quotation.",
    "marketFocus": "For a proposed workshop or store, confirm the property’s permitted use and usable building area before selecting a size. Existing surrounding businesses do not establish approval for a new building.",
    "localContext": "Johannesburg’s Region C guidance identifies industrial development at Laser Park and describes the wider Roodepoort area as a mix of residential and commercial uses.",
    "localConsiderations": [
      "For a proposed workshop or store, confirm the property’s permitted use and usable building area before selecting a size. Existing surrounding businesses do not establish approval for a new building."
    ],
    "localFaqs": [
      {
        "question": "Can I use an Atlas warehouse on any Roodepoort property?",
        "answer": "The building must suit the site and its approved use. Ask the relevant authority or your professional team to confirm zoning, building lines and approvals. We can then review the steel package against the available footprint and intended use."
      }
    ],
    "evidenceSources": [
      {
        "label": "City of Johannesburg Region C business guidance",
        "url": "https://joburg.org.za/about_/regions/Pages/Region%20C%20-%20Roodepoort/Business.aspx",
        "supports": "Regional context and named areas; not Smart Steel service availability or project performance."
      },
      {
        "label": "City of Johannesburg Region C business guidance — additional reference",
        "url": "https://joburg.org.za/about_/regions/Pages/Region%20C%20-%20Roodepoort/region-c.aspx",
        "supports": "Named areas and regional context."
      }
    ],
    "reviewStatus": "Primary-source context reviewed 2026-10-27; site-specific service scope remains subject to quotation."
  },
  "middelburg": {
    "citySlug": "middelburg",
    "name": "Middelburg",
    "province": "Mpumalanga",
    "legacySlug": "middelburg-warehouses",
    "nearby": [
      "Witbank",
      "Belfast",
      "Hendrina"
    ],
    "warehouseSystem": "atlas",
    "heroImage": "/CFLC.webp",
    "localZones": [
      "Middelburg",
      "Hendrina",
      "eMalahleni (Witbank)"
    ],
    "industries": [
      "agriculture",
      "engineering support",
      "equipment storage"
    ],
    "description": "Steve Tshwete’s municipal strategy identifies Middelburg at the intersection of the N4 and N11 corridors, with industrial areas and links to surrounding farms and service centres.",
    "intro": "Smart Steel supplies Atlas steel building packages for storage, workshops and agricultural projects in Middelburg. Choose a footprint and sheeting scope, then share your site details for a reviewed quotation.",
    "marketFocus": "For equipment cover or an engineering-support store, provide the largest vehicle or item to be housed. Hoists, gantries and other concentrated loads need explicit review.",
    "localContext": "Steve Tshwete’s municipal strategy identifies Middelburg at the intersection of the N4 and N11 corridors, with industrial areas and links to surrounding farms and service centres.",
    "localConsiderations": [
      "For equipment cover or an engineering-support store, provide the largest vehicle or item to be housed. Hoists, gantries and other concentrated loads need explicit review."
    ],
    "localFaqs": [
      {
        "question": "Can a Middelburg equipment shed include a hoist?",
        "answer": "A standard building price does not include hoist or gantry loads. Provide the equipment weight, support arrangement and operating requirements so the engineering scope can be reviewed before quotation."
      }
    ],
    "evidenceSources": [
      {
        "label": "Steve Tshwete municipal development strategy",
        "url": "https://www.stlm.gov.za/documents/LED/STLM_township_development_strategy%2002092019.pdf",
        "supports": "Regional context and named areas; not Smart Steel service availability or project performance."
      }
    ],
    "reviewStatus": "Primary-source context reviewed 2026-10-27; site-specific service scope remains subject to quotation."
  },
  "hoedspruit": {
    "citySlug": "hoedspruit",
    "name": "Hoedspruit",
    "province": "Limpopo",
    "legacySlug": "hoedspruit-warehouses",
    "nearby": [
      "Tzaneen",
      "Phalaborwa",
      "Lydenburg"
    ],
    "warehouseSystem": "atlas",
    "heroImage": "/CFLC.webp",
    "localZones": [
      "Hoedspruit",
      "Blyde River farming area"
    ],
    "industries": [
      "agriculture",
      "tourism support",
      "secure storage"
    ],
    "description": "Maruleng’s municipal planning identifies commercial agriculture, including citrus and mango production, in the Hoedspruit area and along the Blyde River.",
    "intro": "Smart Steel supplies Atlas steel building packages for storage, workshops and agricultural projects in Hoedspruit. Choose a footprint and sheeting scope, then share your site details for a reviewed quotation.",
    "marketFocus": "For farm storage, distinguish machinery cover from produce handling or controlled storage. Share the farm entrance location, final access route and the equipment clearances required.",
    "localContext": "Maruleng’s municipal planning identifies commercial agriculture, including citrus and mango production, in the Hoedspruit area and along the Blyde River.",
    "localConsiderations": [
      "For farm storage, distinguish machinery cover from produce handling or controlled storage. Share the farm entrance location, final access route and the equipment clearances required."
    ],
    "localFaqs": [
      {
        "question": "Is a Hoedspruit farm shed suitable for storing fresh produce?",
        "answer": "An Atlas building can provide a structural starting point. Temperature control, ventilation, hygiene, pest exclusion and produce-handling systems must be specified separately with the relevant specialist. The standard steel package does not establish cold-storage suitability."
      }
    ],
    "evidenceSources": [
      {
        "label": "Maruleng municipal agricultural planning",
        "url": "https://www.maruleng.gov.za/Documents/Draft%20IDP%20202526.pdf",
        "supports": "Regional context and named areas; not Smart Steel service availability or project performance."
      }
    ],
    "reviewStatus": "Primary-source context reviewed 2026-10-27; site-specific service scope remains subject to quotation."
  },
  "hermanus": {
    "citySlug": "hermanus",
    "name": "Hermanus",
    "province": "Western Cape",
    "legacySlug": "hermanus-warehouses",
    "nearby": [
      "Somerset West",
      "Caledon",
      "Grabouw"
    ],
    "warehouseSystem": "atlas",
    "heroImage": "/CFLC.webp",
    "localZones": [
      "Hermanus",
      "Overstrand"
    ],
    "industries": [
      "agriculture",
      "coastal storage",
      "workshop use"
    ],
    "description": "Overstrand Municipality identifies tourism, agriculture and agri-processing, local services and construction among the area’s growth sectors. Storage requirements should be defined around the activity the building will support.",
    "intro": "Smart Steel supplies Atlas steel building packages for storage, workshops and agricultural projects in Hermanus. Choose a footprint and sheeting scope, then share your site details for a reviewed quotation.",
    "marketFocus": "For a coastal or farm site, describe exposure, stored materials and maintenance expectations. Steel finish, sheeting and fixings should be reviewed for the actual environment.",
    "localContext": "Overstrand Municipality identifies tourism, agriculture and agri-processing, local services and construction among the area’s growth sectors. Storage requirements should be defined around the activity the building will support.",
    "localConsiderations": [
      "For a coastal or farm site, describe exposure, stored materials and maintenance expectations. Steel finish, sheeting and fixings should be reviewed for the actual environment."
    ],
    "localFaqs": [
      {
        "question": "Which steel finish should I choose for a Hermanus site?",
        "answer": "Share the site address, environmental exposure and intended contents. Mild steel, ZAM and galvanised options can be discussed, but the appropriate finish and maintenance requirements must be confirmed for your project; a standard guide is not a coastal-performance guarantee."
      }
    ],
    "evidenceSources": [
      {
        "label": "Overstrand Municipality economic sectors",
        "url": "https://www.overstrand.gov.za/overstrand-to-host-120-day-growth-initiative-in-hermanus/",
        "supports": "Regional context and named areas; not Smart Steel service availability or project performance."
      }
    ],
    "reviewStatus": "Primary-source context reviewed 2026-10-27; site-specific service scope remains subject to quotation."
  },
  "cape-town": {
    "citySlug": "cape-town",
    "name": "Cape Town",
    "province": "Western Cape",
    "legacySlug": "cape-town-warehouses",
    "nearby": [
      "Bellville",
      "Brackenfell",
      "Somerset West"
    ],
    "warehouseSystem": "atlas",
    "heroImage": "/CFLC.webp",
    "localZones": [
      "Epping",
      "Montague Gardens",
      "Airport Industria",
      "Brackenfell"
    ],
    "industries": [
      "distribution",
      "light industrial",
      "trade warehousing"
    ],
    "description": "Cape Town publishes industrial-area profiles for Epping, Montague Gardens, Airport Industria and Brackenfell. These are useful reference areas when specifying a storage or workshop project.",
    "intro": "Smart Steel supplies Atlas steel building packages for storage, workshops and agricultural projects in Cape Town. Choose a footprint and sheeting scope, then share your site details for a reviewed quotation.",
    "marketFocus": "For an industrial property, plan the building together with loading space and vehicle circulation. Describe coastal exposure and any estate or landlord requirements when requesting a quotation.",
    "localContext": "Cape Town publishes industrial-area profiles for Epping, Montague Gardens, Airport Industria and Brackenfell. These are useful reference areas when specifying a storage or workshop project.",
    "localConsiderations": [
      "For an industrial property, plan the building together with loading space and vehicle circulation. Describe coastal exposure and any estate or landlord requirements when requesting a quotation."
    ],
    "localFaqs": [
      {
        "question": "What should I send for a Cape Town industrial-site quotation?",
        "answer": "Send the property address, proposed footprint, required height and door positions, plus any landlord or estate requirements. Include loading and unloading space and environmental exposure so the building scope, finish and transport can be reviewed together."
      }
    ],
    "evidenceSources": [
      {
        "label": "City of Cape Town industrial-area profiles",
        "url": "https://www.capetown.gov.za/work-and-business/education-and-research-materials/data-statistics-and-research/industria-overview/",
        "supports": "Regional context and named areas; not Smart Steel service availability or project performance."
      }
    ],
    "reviewStatus": "Primary-source context reviewed 2026-10-27; site-specific service scope remains subject to quotation."
  },
  "durban": {
    "citySlug": "durban",
    "name": "Durban",
    "province": "KwaZulu-Natal",
    "legacySlug": "durban-warehouses",
    "nearby": [
      "Pinetown",
      "Umhlanga",
      "Amanzimtoti"
    ],
    "warehouseSystem": "atlas",
    "heroImage": "/CFLC.webp",
    "localZones": [
      "Durban"
    ],
    "industries": [
      "logistics",
      "port-linked warehousing",
      "commercial storage"
    ],
    "description": "Transnet’s KZN Logistics Hub guidance identifies the Port of Durban’s container and automotive role. For a warehouse supporting goods movement, the operational layout matters as much as the covered floor area.",
    "intro": "Smart Steel supplies Atlas steel building packages for storage, workshops and agricultural projects in Durban. Choose a footprint and sheeting scope, then share your site details for a reviewed quotation.",
    "marketFocus": "For port-linked stock or fleet cover, share loading movements, vehicle clearances and the actual site address. Include environmental exposure when reviewing steel and sheeting finishes.",
    "localContext": "Transnet’s KZN Logistics Hub guidance identifies the Port of Durban’s container and automotive role. For a warehouse supporting goods movement, the operational layout matters as much as the covered floor area.",
    "localConsiderations": [
      "For port-linked stock or fleet cover, share loading movements, vehicle clearances and the actual site address. Include environmental exposure when reviewing steel and sheeting finishes."
    ],
    "localFaqs": [
      {
        "question": "Does the Durban guide price include loading facilities?",
        "answer": "No. Loading docks, yard works and handling equipment are separate requirements. Tell us how goods and vehicles will move through the property so openings and the structural package can be reviewed alongside the site plan."
      }
    ],
    "evidenceSources": [
      {
        "label": "Transnet KZN Logistics Hub",
        "url": "https://www.transnet.net/SubsiteRender.aspx?id=5723346",
        "supports": "Regional context and named areas; not Smart Steel service availability or project performance."
      }
    ],
    "reviewStatus": "Primary-source context reviewed 2026-10-27; site-specific service scope remains subject to quotation."
  },
  "gqeberha": {
    "citySlug": "gqeberha",
    "name": "Gqeberha",
    "province": "Eastern Cape",
    "legacySlug": "gqeberha-warehouses",
    "nearby": [
      "Uitenhage",
      "Despatch",
      "Coega"
    ],
    "warehouseSystem": "atlas",
    "heroImage": "/CFLC.webp",
    "localZones": [
      "Coega",
      "Kariega (Uitenhage)"
    ],
    "industries": [
      "automotive support",
      "industrial storage",
      "port-linked logistics"
    ],
    "description": "Coega identifies commercial, logistics and automotive zones, while its Nelson Mandela Bay Logistics Park supports automotive manufacturing in Kariega, formerly Uitenhage.",
    "intro": "Smart Steel supplies Atlas steel building packages for storage, workshops and agricultural projects in Gqeberha. Choose a footprint and sheeting scope, then share your site details for a reviewed quotation.",
    "marketFocus": "For component storage or an industrial-support building, specify racks, handling equipment, dispatch openings and any imposed loads. Specialist production equipment is separate from the standard steel package.",
    "localContext": "Coega identifies commercial, logistics and automotive zones, while its Nelson Mandela Bay Logistics Park supports automotive manufacturing in Kariega, formerly Uitenhage.",
    "localConsiderations": [
      "For component storage or an industrial-support building, specify racks, handling equipment, dispatch openings and any imposed loads. Specialist production equipment is separate from the standard steel package."
    ],
    "localFaqs": [
      {
        "question": "Can an Atlas building support a Gqeberha automotive supplier?",
        "answer": "It can be considered for a suitable storage or workshop scope. Confirm component storage, racks, handling equipment, opening clearances and any specialist loads. Production systems and industry-specific requirements need separate review."
      }
    ],
    "evidenceSources": [
      {
        "label": "Coega zones and Nelson Mandela Bay Logistics Park",
        "url": "https://www.coega.co.za/site/map/map.html",
        "supports": "Regional context and named areas; not Smart Steel service availability or project performance."
      },
      {
        "label": "Coega zones and Nelson Mandela Bay Logistics Park — additional reference",
        "url": "https://tenders.coega.co.za/Content.aspx?objID=89",
        "supports": "Named areas and regional context."
      }
    ],
    "reviewStatus": "Primary-source context reviewed 2026-10-27; site-specific service scope remains subject to quotation."
  },
  "bloemfontein": {
    "citySlug": "bloemfontein",
    "name": "Bloemfontein",
    "province": "Free State",
    "legacySlug": "bloemfontein-warehouses",
    "nearby": [
      "Botshabelo",
      "Thaba Nchu",
      "Bainsvlei"
    ],
    "warehouseSystem": "atlas",
    "heroImage": "/CFLC.webp",
    "localZones": [
      "Bloemfontein"
    ],
    "industries": [
      "distribution",
      "agricultural support",
      "commercial storage"
    ],
    "description": "Mangaung’s transport planning identifies the N1, N6 and N8 as national connections serving Bloemfontein. A depot or store still needs its own workable entrance, loading area and circulation layout.",
    "intro": "Smart Steel supplies Atlas steel building packages for storage, workshops and agricultural projects in Bloemfontein. Choose a footprint and sheeting scope, then share your site details for a reviewed quotation.",
    "marketFocus": "For a distribution store or regional depot, show vehicle turning space and separate the building footprint from yard operations. Exact delivery routing and unloading are confirmed for the property.",
    "localContext": "Mangaung’s transport planning identifies the N1, N6 and N8 as national connections serving Bloemfontein. A depot or store still needs its own workable entrance, loading area and circulation layout.",
    "localConsiderations": [
      "For a distribution store or regional depot, show vehicle turning space and separate the building footprint from yard operations. Exact delivery routing and unloading are confirmed for the property."
    ],
    "localFaqs": [
      {
        "question": "How should I size a Bloemfontein depot?",
        "answer": "Start with covered stock, equipment and required clearances. Allow separately for vehicle turning, loading and yard operations. The Atlas footprint is the building area, rather than the total operational area of the depot."
      }
    ],
    "evidenceSources": [
      {
        "label": "Mangaung transport-network planning",
        "url": "https://www.mangaung.co.za/wp-content/uploads/2023/04/Annexure-F-FINAL-Integrated-Human-Settlement-Plan-2019-25-Version-1-2022.pdf",
        "supports": "Regional context and named areas; not Smart Steel service availability or project performance."
      }
    ],
    "reviewStatus": "Primary-source context reviewed 2026-10-27; site-specific service scope remains subject to quotation."
  },
  "polokwane": {
    "citySlug": "polokwane",
    "name": "Polokwane",
    "province": "Limpopo",
    "legacySlug": "polokwane-warehouses",
    "nearby": [
      "Mokopane",
      "Louis Trichardt",
      "Tzaneen"
    ],
    "warehouseSystem": "atlas",
    "heroImage": "/CFLC.webp",
    "localZones": [
      "Polokwane",
      "Seshego",
      "Mankweng"
    ],
    "industries": [
      "regional logistics",
      "agricultural storage",
      "trade warehousing"
    ],
    "description": "Polokwane’s spatial development framework identifies Polokwane and Seshego as the main economic concentration, with Mankweng providing a secondary economic cluster.",
    "intro": "Smart Steel supplies Atlas steel building packages for storage, workshops and agricultural projects in Polokwane. Choose a footprint and sheeting scope, then share your site details for a reviewed quotation.",
    "marketFocus": "For a trade store or distribution building, identify customer collections, delivery movements and secure stock areas. Share whether the delivery site is within the urban area or on a separate rural property.",
    "localContext": "Polokwane’s spatial development framework identifies Polokwane and Seshego as the main economic concentration, with Mankweng providing a secondary economic cluster.",
    "localConsiderations": [
      "For a trade store or distribution building, identify customer collections, delivery movements and secure stock areas. Share whether the delivery site is within the urban area or on a separate rural property."
    ],
    "localFaqs": [
      {
        "question": "Can I combine a Polokwane trade store and stock area?",
        "answer": "Share the intended customer, vehicle and stock movements so the proposed footprint and openings can be considered together. Offices, counters, partitions, security and fire requirements are additional scope to confirm, rather than assumed inclusions."
      }
    ],
    "evidenceSources": [
      {
        "label": "Polokwane spatial development framework",
        "url": "https://www.polokwane.gov.za/wp-content/uploads/2024/04/Polokwane-SDF-2024-JS.pdf",
        "supports": "Regional context and named areas; not Smart Steel service availability or project performance."
      }
    ],
    "reviewStatus": "Primary-source context reviewed 2026-10-27; site-specific service scope remains subject to quotation."
  },
  "nelspruit": {
    "citySlug": "nelspruit",
    "name": "Nelspruit",
    "province": "Mpumalanga",
    "legacySlug": "nelspruit-warehouses",
    "nearby": [
      "White River",
      "Malelane",
      "Barberton"
    ],
    "warehouseSystem": "atlas",
    "heroImage": "/CFLC.webp",
    "localZones": [
      "Mbombela (Nelspruit)"
    ],
    "industries": [
      "agricultural support",
      "distribution",
      "equipment storage"
    ],
    "description": "Mpumalanga’s economic development agency identifies the Lowveld with fruit, nut and other agricultural production, including citrus in the Mbombela area.",
    "intro": "Smart Steel supplies Atlas steel building packages for storage, workshops and agricultural projects in Nelspruit. Choose a footprint and sheeting scope, then share your site details for a reviewed quotation.",
    "marketFocus": "For an agricultural-support building, distinguish equipment and packaging storage from food processing or controlled produce storage. Send the actual farm or business address and access information.",
    "localContext": "Mpumalanga’s economic development agency identifies the Lowveld with fruit, nut and other agricultural production, including citrus in the Mbombela area.",
    "localConsiderations": [
      "For an agricultural-support building, distinguish equipment and packaging storage from food processing or controlled produce storage. Send the actual farm or business address and access information."
    ],
    "localFaqs": [
      {
        "question": "Can the Nelspruit building be used for agricultural packaging storage?",
        "answer": "Describe the materials, stock heights, handling equipment and environmental requirements. A steel storage shell can be reviewed for the project, while food-processing, hygiene, cold-chain or controlled-environment requirements must be specified separately."
      }
    ],
    "evidenceSources": [
      {
        "label": "Mpumalanga Economic Growth Agency agriculture profile",
        "url": "https://mega.gov.za/mega-key-sectors/agriculture-2/",
        "supports": "Regional context and named areas; not Smart Steel service availability or project performance."
      }
    ],
    "reviewStatus": "Primary-source context reviewed 2026-10-27; site-specific service scope remains subject to quotation."
  },
  "rustenburg": {
    "citySlug": "rustenburg",
    "name": "Rustenburg",
    "province": "North West",
    "legacySlug": "rustenburg-warehouses",
    "nearby": [
      "Mogwase",
      "Brits",
      "Swartruggens"
    ],
    "warehouseSystem": "atlas",
    "heroImage": "/CFLC.webp",
    "localZones": [
      "Rustenburg"
    ],
    "industries": [
      "industrial support",
      "equipment storage",
      "trade warehousing"
    ],
    "description": "Rustenburg’s municipal development plan identifies mining and beneficiation, industrial development and manufacturing among its economic sectors.",
    "intro": "Smart Steel supplies Atlas steel building packages for storage, workshops and agricultural projects in Rustenburg. Choose a footprint and sheeting scope, then share your site details for a reviewed quotation.",
    "marketFocus": "For equipment storage or workshop support, identify vehicle heights, heavy components and any crane or hoist needs. Those requirements must be checked before relying on a standard building configuration.",
    "localContext": "Rustenburg’s municipal development plan identifies mining and beneficiation, industrial development and manufacturing among its economic sectors.",
    "localConsiderations": [
      "For equipment storage or workshop support, identify vehicle heights, heavy components and any crane or hoist needs. Those requirements must be checked before relying on a standard building configuration."
    ],
    "localFaqs": [
      {
        "question": "Does a Rustenburg workshop price include heavy-equipment supports?",
        "answer": "No. Cranes, hoists, plant supports, heavy-duty floors and specialist loading are not assumed in the standard guide. Provide those requirements so the engineering and commercial scope can be reviewed."
      }
    ],
    "evidenceSources": [
      {
        "label": "Rustenburg municipal development plan",
        "url": "https://www.rustenburg.gov.za/wp-content/uploads/2025/04/IDP-REVIEW-2025-2026-31-MARCH-2025.pdf",
        "supports": "Regional context and named areas; not Smart Steel service availability or project performance."
      }
    ],
    "reviewStatus": "Primary-source context reviewed 2026-10-27; site-specific service scope remains subject to quotation."
  },
  "east-london": {
    "citySlug": "east-london",
    "name": "East London",
    "province": "Eastern Cape",
    "legacySlug": "east-london-warehouses",
    "nearby": [
      "King William's Town",
      "Mdantsane",
      "Bhisho"
    ],
    "warehouseSystem": "atlas",
    "heroImage": "/CFLC.webp",
    "localZones": [
      "East London",
      "East London IDZ"
    ],
    "industries": [
      "industrial storage",
      "automotive support",
      "coastal warehousing"
    ],
    "description": "The East London IDZ identifies automotive manufacturing, component production and logistics as activities supported by its industrial platform.",
    "intro": "Smart Steel supplies Atlas steel building packages for storage, workshops and agricultural projects in East London. Choose a footprint and sheeting scope, then share your site details for a reviewed quotation.",
    "marketFocus": "For an industrial-support store, share component sizes, rack heights and dispatch arrangements. Specify environmental exposure and any industrial-estate requirements for the proposed property.",
    "localContext": "The East London IDZ identifies automotive manufacturing, component production and logistics as activities supported by its industrial platform.",
    "localConsiderations": [
      "For an industrial-support store, share component sizes, rack heights and dispatch arrangements. Specify environmental exposure and any industrial-estate requirements for the proposed property."
    ],
    "localFaqs": [
      {
        "question": "What needs review for an East London industrial-support store?",
        "answer": "Provide the site address, storage and handling needs, clear heights and opening positions. Include any estate requirements, special loads and environmental exposure so the structural package and finish can be reviewed before quotation."
      }
    ],
    "evidenceSources": [
      {
        "label": "East London IDZ automotive sector",
        "url": "https://www.elidz.co.za/automotive-sector/",
        "supports": "Regional context and named areas; not Smart Steel service availability or project performance."
      }
    ],
    "reviewStatus": "Primary-source context reviewed 2026-10-27; site-specific service scope remains subject to quotation."
  }
};

export function getRegionWarehouseCitySlugs() { return Object.keys(regionWarehousePages); }
export function getRegionWarehouseConfig(citySlug) { return regionWarehousePages[citySlug] || null; }
export function getRegionWarehouseConfigs() { return Object.values(regionWarehousePages); }
export function getRegionWarehouseConfigByLegacySlug(slug) { return getRegionWarehouseConfigs().find((region) => region.legacySlug === slug) || null; }
export function getRegionWarehouseLegacyPaths() { return getRegionWarehouseConfigs().map((region) => `/${region.legacySlug}`); }
export function getRegionWarehouseDynamicPaths() { return getRegionWarehouseConfigs().map((region) => `/${region.citySlug}/warehouses`); }

function metadataFor({ title, description, path, image, alt }) {
  // This absolute title includes the brand once; do not append the root title template.
  const brandedTitle = `${title} | Smart Steel`;
  return {
    title: { absolute: brandedTitle },
    description,
    alternates: { canonical: `${SITE_URL}${path}` },
    openGraph: { title: brandedTitle, description, url: `${SITE_URL}${path}`, type: "website", images: [{ url: `${SITE_URL}${image}`, alt }] },
    twitter: { card: "summary_large_image", title: brandedTitle, description, images: [`${SITE_URL}${image}`] },
  };
}

export function buildRegionWarehouseHubMetadata() {
  return metadataFor({ title: "Steel Warehouses by Region South Africa", description: "Find your local Smart Steel warehouse guide. Compare Atlas building sizes, supply-only prices and site requirements across South Africa.", path: "/warehouse-regions", image: "/CFLC.webp", alt: "Atlas steel warehouse system" });
}

export function buildRegionWarehouseMetadata(citySlug) {
  const region = getRegionWarehouseConfig(citySlug);
  if (!region) return {};
  const areas = region.localZones.filter((name) => name !== region.name).slice(0, 2);
  const coverage = areas.length ? `${region.name}, ${areas.join(" and ")}` : region.name;
  return metadataFor({
    title: `Steel Warehouses ${region.name} | Prices & Supply`,
    description: `Explore Atlas steel warehouses for ${coverage}. Compare sizes and supply-only prices, then request a quote. Delivery and installation quoted separately.`,
    path: `/${region.legacySlug}`, image: region.heroImage, alt: "Atlas cold-formed steel warehouse members",
  });
}

export function buildRegionWarehouseContent(citySlug) {
  const region = getRegionWarehouseConfig(citySlug);
  if (!region) return null;
  return {
    ...region,
    pricePath: "/warehouse-builder?productType=Atlas%20Warehouse",
    prefillBuilderDimensions: true,
    breadcrumbSectionName: "Warehouses",
    heroDescription: `Plan an Atlas warehouse for your ${region.name} site. Compare standard sizes and current supply-only prices for storage, workshops and agricultural buildings.`,
    faqItems: [
      { question: `How much does a steel warehouse cost in ${region.name}?`, answer: "The live guide uses the selected width, length and eave height with galvanised steel and, where included, galvanised IBR sheeting. Compare structure only, roof sheeted, roof with side walls, or fully enclosed with gables. VAT is shown separately. Delivery, installation, foundations, slabs, doors and project-specific work are quoted separately." },
      { question: `Which warehouse sizes can I order for ${region.name}?`, answer: `Atlas standard widths are ${REGION_WAREHOUSE_WIDTHS.map((width) => `${width}m`).join(", ")}. Regional guides cover 8m to 100m lengths in 4m bays. The builder also supports a single 4m bay. The guide states the selected eave height; other available heights can be explored in the builder before review.` },
      ...region.localFaqs,
      { question: `How is delivery to ${region.name} priced?`, answer: "Delivery is quoted for the confirmed building package and exact site address. Share the final access route, gate clearances, unloading arrangements and any restrictions. A nearby main road does not confirm vehicle access to the property." },
      { question: `Can you review installation for my ${region.name} project?`, answer: "Yes. Request an installation review with the site location, foundation status and project timing. Availability, travel, equipment and the installation scope are confirmed separately before quotation; they are not included in the supply-only guide." },
      { question: "Are foundations and municipal approvals included?", answer: "Foundations, floor slabs and site works are excluded unless expressly included in the quotation. The client is responsible for municipal and statutory approvals unless these are expressly included. Confirm site conditions and the final engineered requirements before construction." },
      { question: `How long will my ${region.name} warehouse take?`, answer: "The programme is confirmed after the building scope, engineering requirements, manufacturing, foundations, site access and delivery have been reviewed. The price guide does not promise a fixed lead time." },
    ],
  };
}
