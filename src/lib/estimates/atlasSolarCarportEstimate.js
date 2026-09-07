import { calculateSolarCarportGeometry } from '../atlasSolarCarportGeometry.js'

export const SOLAR_COST_DEFAULTS = {
  zamRatePerTon: 28840, wastePercent: 0, fabricationPerKg: 0,
  hardwarePerSquareMetre: 80, moduleSupportEach: 145,
  installationPerSquareMetre: 200, deliveryPerKm: 19, deliveryMinimum: 1350,
  upliftPercent: 40,
}
export const SOLAR_COST_LABELS = {
  zamRatePerTon: 'ZAM cost / ton', wastePercent: 'Steel waste %', fabricationPerKg: 'Fabrication / kg (provisional)',
  hardwarePerSquareMetre: 'Hardware allowance / m² (provisional)', moduleSupportEach: 'Module supports / panel',
  installationPerSquareMetre: 'Installation / m²', deliveryPerKm: 'Delivery / km', deliveryMinimum: 'Minimum delivery', upliftPercent: 'Uplift on cost %',
}
const money = n => Math.round((n + Number.EPSILON) * 100) / 100
export function calculateAtlasSolarCarportEstimate(input, release = null) {
  let geometry
  try { geometry = calculateSolarCarportGeometry(input) }
  catch (error) {
    if (release) throw error
    geometry = { members: [], totalSteelKg: 0 }
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
    add('SC-HARDWARE', 'Connection hardware allowance (provisional)', totalArea, 'm²', c.hardwarePerSquareMetre)
    add('SC-MODULE', 'Module support interfaces', modules, 'each', c.moduleSupportEach)
    if (input.scope === 'supply_install') add('SC-INSTALL', 'Installation', totalArea, 'm²', c.installationPerSquareMetre)
    if (Number(input.deliveryDistance) > 0) add('SC-DELIVERY', 'Delivery', 1, 'lot', Math.max(c.deliveryMinimum, Number(input.deliveryDistance) * c.deliveryPerKm))
  }
  const baseTotal = release ? money(lines.reduce((s, l) => s + l.total, 0)) : null
  const markupMultiplier = 1 + (release?.costs.upliftPercent ?? 40) / 100
  const estimatedTotal = release ? money(baseTotal * markupMultiplier) : null
  return {
    input, lineItems: lines, members: geometry.members,
    summary: { title: `${input.width}m x ${input.length}m Atlas Solar Carport`, estimateRequest: `${input.width}m x ${input.length}m · ZAM · ${quantity} structure(s) · ${scope}`, layoutNote: 'Nominal member lengths; connection detailing subject to manufacturing review.' },
    pricing: { baseTotal, markupMultiplier, estimatedTotal, competitorLow: estimatedTotal, competitorHigh: estimatedTotal },
    totals: { area, totalArea, totalModules: modules, steelKg: geometry.totalSteelKg * quantity },
    labels: { area: `${totalArea} m²`, scope, delivery: Number(input.deliveryDistance) > 0 ? `${input.deliveryDistance} km` : 'Collection / not specified', modules: String(modules) },
    meta: { productType: 'Solar carport', productGroup: 'solar', pricingReady: Boolean(release), pricingRevision: release?.revision || null, provisionalAllowances: true },
  }
}
