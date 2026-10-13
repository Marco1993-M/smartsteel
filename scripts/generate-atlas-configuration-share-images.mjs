import sharp from "sharp"

const WIDTH = 1200
const HEIGHT = 630

function warehouseDiagram() {
  const columns = Array.from({ length: 7 }, (_, index) => {
    const x = 734 + index * 62
    return `<line x1="${x}" y1="263" x2="${x}" y2="420" stroke="#b5c8d8" stroke-width="1.5" stroke-dasharray="5 5"/>
      <circle cx="${x}" cy="263" r="5" fill="#0043f3"/><circle cx="${x}" cy="420" r="5" fill="#0043f3"/>`
  }).join("")

  return `<rect x="734" y="263" width="372" height="157" fill="#f5f9fc" stroke="#173247" stroke-width="2"/>
    ${columns}
    <line x1="734" y1="341.5" x2="1106" y2="341.5" stroke="#8ba8bd" stroke-width="1.5" stroke-dasharray="9 6"/>
    <line x1="734" y1="314" x2="734" y2="369" stroke="#0043f3" stroke-width="4" stroke-dasharray="8 5"/>
    <text x="920" y="466" fill="#607489" font-family="Arial, sans-serif" font-size="18" text-anchor="middle">INDICATIVE WAREHOUSE PLAN</text>`
}

function solarDiagram() {
  const bays = Array.from({ length: 5 }, (_, index) => {
    const x = 742 + index * 71
    return `<rect x="${x}" y="270" width="65" height="132" fill="${index % 2 ? "#eaf3fb" : "#f4f9fc"}" stroke="#8ba8bd" stroke-width="1.5"/>
      <line x1="${x + 7}" y1="287" x2="${x + 58}" y2="287" stroke="#9ab9ce" stroke-width="2"/>
      <line x1="${x + 7}" y1="307" x2="${x + 58}" y2="307" stroke="#9ab9ce" stroke-width="2"/>
      <line x1="${x + 7}" y1="327" x2="${x + 58}" y2="327" stroke="#9ab9ce" stroke-width="2"/>
      <line x1="${x + 7}" y1="347" x2="${x + 58}" y2="347" stroke="#9ab9ce" stroke-width="2"/>
      <line x1="${x + 7}" y1="367" x2="${x + 58}" y2="367" stroke="#9ab9ce" stroke-width="2"/>`
  }).join("")

  return `<path d="M 730 259 H 1108 V 412 H 730 Z" fill="#f5f9fc" stroke="#173247" stroke-width="2"/>
    ${bays}
    <line x1="730" y1="416" x2="1108" y2="416" stroke="#0043f3" stroke-width="3"/>
    ${[730, 824, 919, 1013, 1108].map((x) => `<circle cx="${x}" cy="416" r="5" fill="#0043f3"/>`).join("")}
    <text x="920" y="466" fill="#607489" font-family="Arial, sans-serif" font-size="18" text-anchor="middle">INDICATIVE PARKING PLAN</text>`
}

function imageSvg({ product, diagram }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#001d2e"/><stop offset="1" stop-color="#073a89"/></linearGradient>
      <linearGradient id="mark" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#1266ff"/><stop offset="1" stop-color="#0043f3"/></linearGradient>
      <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M 32 0 H 0 V 32" fill="none" stroke="#8bb6df" stroke-width="1" opacity="0.12"/></pattern>
    </defs>
    <rect width="1200" height="630" fill="url(#bg)"/>
    <rect width="1200" height="630" fill="url(#grid)"/>
    <path d="M 540 0 L 810 0 L 570 630 L 300 630 Z" fill="#0043f3" opacity="0.16"/>
    <rect x="76" y="62" width="66" height="66" rx="13" fill="url(#mark)"/>
    <path d="M 95 113 L 108 78 H 120 L 133 113 H 119 L 114 93 L 108 113 Z" fill="#fff"/>
    <text x="162" y="93" fill="#fff" font-family="Arial, sans-serif" font-size="32" font-weight="700" letter-spacing="3">ATLAS SYSTEM</text>
    <text x="163" y="120" fill="#bed5e7" font-family="Arial, sans-serif" font-size="15" font-weight="700" letter-spacing="3">DEVELOPED BY SMART STEEL</text>
    <rect x="76" y="197" width="182" height="35" rx="17" fill="#c1d9e5" opacity="0.16" stroke="#c1d9e5" stroke-width="1"/>
    <text x="167" y="221" text-anchor="middle" fill="#c1d9e5" font-family="Arial, sans-serif" font-size="16" font-weight="700" letter-spacing="2">VIEW ONLY</text>
    <text x="75" y="307" fill="#fff" font-family="Arial, sans-serif" font-size="57" font-weight="700">PROJECT</text>
    <text x="75" y="373" fill="#fff" font-family="Arial, sans-serif" font-size="57" font-weight="700">CONFIGURATION</text>
    <rect x="76" y="413" width="490" height="66" rx="7" fill="#0043f3"/>
    <text x="101" y="455" fill="#fff" font-family="Arial, sans-serif" font-size="28" font-weight="700" letter-spacing="1.5">${product}</text>
    <text x="77" y="559" fill="#bed5e7" font-family="Arial, sans-serif" font-size="21">A read-only view of the selected layout</text>
    <rect x="662" y="69" width="483" height="475" rx="18" fill="#fff"/>
    <rect x="682" y="89" width="443" height="435" rx="10" fill="#fff" stroke="#d8e4ed" stroke-width="2"/>
    <text x="713" y="141" fill="#0043f3" font-family="Arial, sans-serif" font-size="15" font-weight="700" letter-spacing="3">ATLAS  /  LAYOUT PREVIEW</text>
    <line x1="713" y1="163" x2="1093" y2="163" stroke="#d8e4ed" stroke-width="2"/>
    <text x="713" y="214" fill="#001d2e" font-family="Arial, sans-serif" font-size="30" font-weight="700">${product === "WAREHOUSE" ? "Warehouse" : "Solar carport"}</text>
    ${diagram}
    <rect x="0" y="612" width="1200" height="18" fill="#0043f3"/>
  </svg>`
}

for (const entry of [
  { product: "WAREHOUSE", diagram: warehouseDiagram(), filename: "public/atlas-warehouse-configuration-share.png" },
  { product: "SOLAR CARPORT", diagram: solarDiagram(), filename: "public/atlas-solar-configuration-share.png" },
]) {
  await sharp(Buffer.from(imageSvg(entry))).png().toFile(entry.filename)
  process.stdout.write(`${entry.filename}\n`)
}
