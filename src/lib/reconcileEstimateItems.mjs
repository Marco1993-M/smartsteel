// Reconcile a changed specification without discarding deliberate line edits.
// Call only when the calculated specification changes, not on manual row edits.
export function reconcileEstimateItems(currentItems, calculatedItems, { buildItem, hasOverrides, addMissing = false }) {
  const calculatedByCode = new Map(calculatedItems.map(item => [item.code, item]))
  const generated = currentItems.filter(item => !item.manual).flatMap(item => {
    const calculated = calculatedByCode.get(item.code)
    if (!calculated) return []
    return [buildItem(calculated, hasOverrides(item, calculated.label)
      ? item
      : { id: item.id || calculated.code, priceIncludesMarkup: true })]
  })
  const existing = new Set(generated.map(item => item.code))
  const manual = currentItems.filter(item => item.manual)
  // A manually added row with a calculated code already covers that item.
  for (const item of manual) existing.add(item.code)
  const added = addMissing ? calculatedItems.filter(item => !existing.has(item.code))
    .map(item => buildItem(item, { priceIncludesMarkup: true })) : []
  return [...generated, ...added, ...manual]
}
