// Legacy estimates belong to the original option. Version numbers remain lead-wide.
export function quoteFamily(estimate) {
  return estimate?.input_data?.quoteFamilyId || "original"
}

export function supersededRevisionIds(estimates, sentEstimate) {
  return estimates.filter((item) => item.id !== sentEstimate.id
    && quoteFamily(item) === quoteFamily(sentEstimate)
    && Number(item.version_no) < Number(sentEstimate.version_no)
    && ["draft", "prepared", "sent"].includes(item.status)).map((item) => item.id)
}
