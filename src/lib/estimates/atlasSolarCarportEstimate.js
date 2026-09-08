import { calculateSolarCarportGeometry } from '../atlasSolarCarportGeometry.js'

export const SOLAR_COST_DEFAULTS = {
  zamRatePerTon: 28840, wastePercent: 0, fabricationPerKg: 0,
  anchorBracketEach: 350, armBracketEach: 175, purlinBracketEach: 40,
  anchorBoltEach: 0, connectionBoltSetEach: 12, moduleSupportEach: 145,
  installationPerSquareMetre: 200, deliveryPerKm: 19, deliveryMinimum: 1350,
  upliftPercent: 40,
}
export const SOLAR_COST_LABELS = {
  zamRatePerTon: 'ZAM cost / ton', wastePercent: 'Steel waste %', fabricationPerKg: 'Fabrication / kg (provisional)',
  anchorBracketEach: 'Column anchoring bracket / each', armBracketEach: 'Diagonal-arm bracket / each',
  purlinBracketEach: 'Purlin bracket / each', anchorBoltEach: 'Foundation anchor / each',
  connectionBoltSetEach: 'Complete connection bolt set / each', moduleSupportEach: 'Module supports / panel',
  installationPerSquareMetre: 'Installation / m²', deliveryPerKm: 'Delivery / km', deliveryMinimum: 'Minimum delivery', upliftPercent: 'Uplift on cost %',
}
const money = n => Math.round((n + Number.EPSILON) * 100) / 100
export function calculateAtlasSolarCarportEstimate(input, release = null) {
  const parkingRuns = Array.isArray(input.parkingRuns)
    ? input.parkingRuns.filter((run) => Number(run?.width) > 0 && [6, 12].includes(Number(run?.length)))
    : []

  if (parkingRuns.length > 0) {
    const runEstimates = parkingRuns.map((run) => calculateAtlasSolarCarportEstimate({
      ...input,
      parkingRuns: undefined,
      width: Number(run.width),
      length: Number(run.length),
      quantity: 1,
      moduleCount: Number(run.moduleCount) || 0,
      deliveryDistance: 0,
    }, release))
    const lineMap = new Map()
    runEstimates.flatMap((estimate) => estimate.lineItems).forEach((item) => {
      const key = `${item.code}|${item.label}|${item.unit}|${item.unitRate}`
      const current = lineMap.get(key)
      lineMap.set(key, current
        ? { ...current, quantity: money(current.quantity + item.quantity), total: money(current.total + item.total) }
        : { ...item })
    })
    if (release && Number(input.deliveryDistance) > 0) {
      const rate = Math.max(release.costs.deliveryMinimum, Number(input.deliveryDistance) * release.costs.deliveryPerKm)
      lineMap.set('SC-DELIVERY', { code: 'SC-DELIVERY', label: 'Delivery', quantity: 1, unit: 'lot', unitRate: rate, total: rate })
    }
    const lines = [...lineMap.values()]
    const baseTotal = release ? money(lines.reduce((sum, item) => sum + item.total, 0)) : null
    const markupMultiplier = 1 + (release?.costs.upliftPercent ?? 40) / 100
    const estimatedTotal = release ? money(baseTotal * markupMultiplier) : null
    const totalArea = money(runEstimates.reduce((sum, estimate) => sum + estimate.totals.totalArea, 0))
    const totalModules = runEstimates.reduce((sum, estimate) => sum + estimate.totals.totalModules, 0)
    const steelKg = money(runEstimates.reduce((sum, estimate) => sum + estimate.totals.steelKg, 0))
    const scope = input.scope === 'supply_install' ? 'Supply + installation' : 'Supply only'
    const schedule = parkingRuns.map((run, index) => `Run ${String.fromCharCode(65 + index)}: ${Number(run.parkingCount) * (Number(run.length) === 12 ? 2 : 1)} spaces · ${Number(run.length) === 12 ? 'butterfly' : 'single-sided'}`).join(' · ')

    return {
      input: { ...input, parkingRuns }, lineItems: lines,
      members: runEstimates.flatMap((estimate, index) => estimate.members.map((member) => ({ ...member, run: index + 1 }))),
      connections: runEstimates.flatMap((estimate, index) => estimate.connections.map((connection) => ({ ...connection, run: index + 1 }))),
      summary: { title: `${parkingRuns.length}-run Atlas Solar Carport Layout`, estimateRequest: `${schedule} · ZAM · ${scope}`, layoutNote: 'Each parking run is priced independently and consolidated into one project estimate.' },
      pricing: { baseTotal, markupMultiplier, estimatedTotal, competitorLow: estimatedTotal, competitorHigh: estimatedTotal },
      totals: { area: totalArea, totalArea, totalModules, steelKg, parkingRuns: parkingRuns.length },
      labels: { area: `${totalArea} m²`, scope, delivery: Number(input.deliveryDistance) > 0 ? `${input.deliveryDistance} km` : 'Collection / not specified', modules: String(totalModules) },
      meta: { productType: 'Solar carport', productGroup: 'solar', pricingReady: Boolean(release), pricingRevision: release?.revision || null, provisionalAllowances: true },
    }
  }

  let geometry
  try { geometry = calculateSolarCarportGeometry(input) }
  catch (error) {
    if (release) throw error
    geometry = { members: [], connections: [], totalSteelKg: 0 }
  }
  const quantity = Math.max(1, Math.round(Number(input.quantity) || 1))
  const modules = Math.max(0, Number(input.moduleCount) || 0) * quantity
  const area = Number(input.width) * Number(input.length)
  const totalArea = area * quantity
  const scope = input.scope === 'supply_install' ? 'Supply + installation' : 'Supply only'
  const lines = []
  const add = (code, label, amount, unit, rate) => lines.push({ code, label, quantity: amount, unit, unitRate: rate, total: money(amount * rate) })
  if (release) {
    const c = release.costs
    geometry.members.forEach(m => add(m.code, `${m.label} · ${m.profile.section} · ${m.cutLengthM.toFixed(3)}m`, m.totalMassKg * quantity, 'kg', c.zamRatePerTon / 1000))
    const kg = geometry.totalSteelKg * quantity
    add('SC-WASTE', 'Steel waste allowance', kg, 'kg', c.zamRatePerTon / 1000 * c.wastePercent / 100)
    add('SC-FAB', 'Fabrication allowance (provisional)', kg, 'kg', c.fabricationPerKg)
    const connectionRates = {
      'SC-BRK-BASE': c.anchorBracketEach,
      'SC-BRK-ARM': c.armBracketEach,
      'SC-BRK-PUR': c.purlinBracketEach,
      'SC-ANC': c.anchorBoltEach,
      'SC-BLT': c.connectionBoltSetEach,
    }
    geometry.connections.forEach(item => add(item.code, `${item.label} (provisional)`, item.quantity * quantity, item.unit, connectionRates[item.code]))
    add('SC-MODULE', 'Module support interfaces', modules, 'each', c.moduleSupportEach)
    if (input.scope === 'supply_install') add('SC-INSTALL', 'Installation', totalArea, 'm²', c.installationPerSquareMetre)
    if (Number(input.deliveryDistance) > 0) add('SC-DELIVERY', 'Delivery', 1, 'lot', Math.max(c.deliveryMinimum, Number(input.deliveryDistance) * c.deliveryPerKm))
  }
  const baseTotal = release ? money(lines.reduce((s, l) => s + l.total, 0)) : null
  const markupMultiplier = 1 + (release?.costs.upliftPercent ?? 40) / 100
  const estimatedTotal = release ? money(baseTotal * markupMultiplier) : null
  return {
    input, lineItems: lines, members: geometry.members, connections: geometry.connections,
    summary: { title: `${input.width}m x ${input.length}m Atlas Solar Carport`, estimateRequest: `${input.width}m x ${input.length}m · ZAM · ${quantity} structure(s) · ${scope}`, layoutNote: 'Nominal member lengths; connection detailing subject to manufacturing review.' },
    pricing: { baseTotal, markupMultiplier, estimatedTotal, competitorLow: estimatedTotal, competitorHigh: estimatedTotal },
    totals: { area, totalArea, totalModules: modules, steelKg: geometry.totalSteelKg * quantity },
    labels: { area: `${totalArea} m²`, scope, delivery: Number(input.deliveryDistance) > 0 ? `${input.deliveryDistance} km` : 'Collection / not specified', modules: String(modules) },
    meta: { productType: 'Solar carport', productGroup: 'solar', pricingReady: Boolean(release), pricingRevision: release?.revision || null, provisionalAllowances: true },
  }
}
