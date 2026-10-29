// Reconcile calculated rows; a warehouse specification change reprices standard rows.
// Call only when the calculated specification changes, not on manual row edits.
export function reconcileEstimateItems(currentItems, calculatedItems, { buildItem, hasOverrides, addMissing = false, reprice = false }) {
  const calculatedByCode = new Map(calculatedItems.map(item => [item.code, item]))
  const generated = currentItems.filter(item => !item.manual || (reprice && calculatedByCode.has(item.code))).flatMap(item => {
    const calculated = calculatedByCode.get(item.code)
    if (!calculated) return []
    return [buildItem(calculated, !reprice && hasOverrides(item, calculated.label)
      ? item
      : { id: item.id || calculated.code, priceIncludesMarkup: true })]
  })
  const existing = new Set(generated.map(item => item.code))
  const manual = currentItems.filter(item => item.manual && !(reprice && calculatedByCode.has(item.code)))
  // A manually added row with a calculated code already covers that item.
  for (const item of manual) existing.add(item.code)
  const added = addMissing ? calculatedItems.filter(item => !existing.has(item.code))
    .map(item => buildItem(item, { priceIncludesMarkup: true })) : []
  return [...generated, ...added, ...manual]
}

// Only inputs that change the calculated warehouse schedule belong here.
// Notes, title, discount and order quantity must not clear edited unit rows.
export function warehousePricingSpecificationKey(input) {
  return JSON.stringify([
    input.productType, Number(input.width), Number(input.length), Number(input.wallHeight),
    input.steelFinish, input.gableMode, input.sheetingProfile, input.sheetingFinish,
  ])
}
