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

export function quoteCreationContext(mode, loadedEstimate, createId) {
  if (mode === 'update') return { quoteFamilyId: quoteFamily(loadedEstimate), quotePurpose: loadedEstimate?.input_data?.quotePurpose || 'initial', revisionOfEstimateId: loadedEstimate?.input_data?.revisionOfEstimateId || null, copiedFromEstimateId: loadedEstimate?.input_data?.copiedFromEstimateId || null }
  if (mode === 'alternative') return { quoteFamilyId: createId(), quotePurpose: 'additional', copiedFromEstimateId: loadedEstimate?.id || null, revisionOfEstimateId: null }
  return { quoteFamilyId: quoteFamily(loadedEstimate), quotePurpose: loadedEstimate ? 'revision' : 'initial', revisionOfEstimateId: loadedEstimate?.id || null }
}

export function groupEstimateQuotes(estimates) {
  const groups = new Map()
  for (const estimate of [...estimates].sort((a,b) => Number(b.version_no)-Number(a.version_no))) {
    const family = quoteFamily(estimate)
    if (!groups.has(family)) groups.set(family, { id: family, versions: [] })
    groups.get(family).versions.push(estimate)
  }
  return [...groups.values()].map(group => ({ ...group, latest: group.versions[0], accepted: group.versions.find(q => q.status === 'accepted' && !q.won_superseded_by) || null }))
}
