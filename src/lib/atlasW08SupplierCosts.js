// Tubecon Africa CASH001_1194482 and Tubecon Laser Q42690, October 2026.
// Costs exclude VAT. The quoted steel is a cost-to-company reference only;
// released structure pricing continues to use the established per-kg rates.
// PC34-PC45 are the bracket pattern for W06-W12; quantities outside the
// quoted W08 8 x 16 x 3 m configuration are provisional.
export const W08_SUPPLIER_REFERENCE = Object.freeze({
  lengthM: 16,
  eaveHeightM: 3,
  steelCost: 29765.76,
  bracketCost: 15677.99,
  steelQuote: "CASH001_1194482",
  bracketQuote: "Q42690",
})

const money = (value) => Math.round((value + Number.EPSILON) * 100) / 100

export function getAtlasStandardQuotedBracketCosts(geometry) {
  const interior = Math.max(0, geometry.portalFrames - 2)
  const bracedBays = geometry.bracedBayPositions.length
  const groups = Math.ceil(geometry.bays / 4)
  return [
    { code: "HCH1", label: "Haunch bracket PC34", quantity: Math.min(2, geometry.portalFrames), unitCost: 429.43 },
    { code: "HCH2", label: "Haunch bracket PC35", quantity: Math.min(2, geometry.portalFrames), unitCost: 429.43 },
    { code: "HCH3", label: "Haunch bracket PC36", quantity: interior, unitCost: 365.32 },
    { code: "HCH4", label: "Haunch bracket PC37", quantity: interior, unitCost: 398.60 },
    { code: "APX1", label: "Apex bracket PC38", quantity: Math.min(2, geometry.portalFrames), unitCost: 560.18 },
    { code: "APX2", label: "Apex bracket PC39", quantity: interior, unitCost: 529.21 },
    ...[155.15, 154.84, 154.44, 154.48].map((unitCost, index) => ({ code: `BRC${index + 1}`, label: `Brace bracket PC${40 + index}`, quantity: 4 * bracedBays, unitCost })),
    { code: "GSP", label: "Girt splice bracket PC44", quantity: 8 * groups, unitCost: 237.21 },
    { code: "BAS", label: "Post-base bracket PC45", quantity: 4 * geometry.portalFrames, unitCost: 229.36 },
  ].map((item) => ({ ...item, total: money(item.quantity * item.unitCost), provisionalQuantity: geometry.bays !== 4 }))
}
