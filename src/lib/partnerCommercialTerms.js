export const AFGRI_PARTNER_ADJUSTMENT_RATE = 0.05

export function calculateAfgriPartnerPrice(customerPriceExVat) {
  const recommendedCustomerPriceExVat = Number(customerPriceExVat || 0)
  const partnerAdjustmentAmount = recommendedCustomerPriceExVat * AFGRI_PARTNER_ADJUSTMENT_RATE
  const partnerPriceExVat = recommendedCustomerPriceExVat - partnerAdjustmentAmount
  const vatAmount = partnerPriceExVat * 0.15

  return {
    recommendedCustomerPriceExVat: roundMoney(recommendedCustomerPriceExVat),
    partnerAdjustmentRate: AFGRI_PARTNER_ADJUSTMENT_RATE,
    partnerAdjustmentAmount: roundMoney(partnerAdjustmentAmount),
    partnerPriceExVat: roundMoney(partnerPriceExVat),
    vatAmount: roundMoney(vatAmount),
    partnerPriceInclVat: roundMoney(partnerPriceExVat + vatAmount),
  }
}

function roundMoney(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100
}
