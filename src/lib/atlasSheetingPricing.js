// Supplier supply-only prices, excl. VAT, supplied 19 October 2026.
// 700 mm is a planning cover assumption, not an ordering specification.
export const ATLAS_SHEETING_PRICING = {
  coverWidthM: 0.7,
  accessoriesAllowanceRate: 0.15,
  wasteAllowanceRate: 0.05,
  markupRate: 0.4,
  galvanised: {
    Corrugated: { supplierLinearRate: 83.99, sellingRate: 205 },
    IBR: { supplierLinearRate: 83.99, sellingRate: 205 },
    "Concealed Fix": { supplierLinearRate: 86.50, sellingRate: 210 },
  },
  chromadek: {
    Corrugated: { supplierLinearRate: 112.90, sellingRate: 275 },
    IBR: { supplierLinearRate: 112.90, sellingRate: 275 },
    "Concealed Fix": { supplierLinearRate: 114.90, sellingRate: 280 },
  },
}

export function calculateAtlasSheetingPricing(profile, finish, area) {
  const basis = ATLAS_SHEETING_PRICING
  const rates = basis[finish]?.[profile]
  if (!rates) throw new Error("Unsupported Atlas sheeting profile or finish")
  const supplierRatePerSqm = rates.supplierLinearRate / basis.coverWidthM
  const supplierSheetCost = area * supplierRatePerSqm
  const accessoriesAllowance = supplierSheetCost * basis.accessoriesAllowanceRate
  const wasteAllowance = supplierSheetCost * basis.wasteAllowanceRate
  return {
    ...rates, supplierRatePerSqm, supplierSheetCost, accessoriesAllowance, wasteAllowance,
    budgetedCost: supplierSheetCost + accessoriesAllowance + wasteAllowance,
    sellingTotal: area * rates.sellingRate,
    coverWidthM: basis.coverWidthM,
  }
}
