export const CUSTOM_ENGINEERED_PROJECT_TYPE = "Custom engineered project"

export function calculateCustomProjectEstimate(input = {}) {
  const width = Math.max(0, Number(input.width) || 0)
  const length = Math.max(0, Number(input.length) || 0)
  const wallHeight = Math.max(0, Number(input.wallHeight) || 0)
  const moduleCount = Math.max(0, Math.round(Number(input.moduleCount) || 0))
  const systems = Array.isArray(input.structuralSystems) ? input.structuralSystems.filter(Boolean) : []
  const scopeLabel = input.productTypeLabel?.trim() || CUSTOM_ENGINEERED_PROJECT_TYPE

  return {
    input: { ...input, width, length, wallHeight, moduleCount, structuralSystems: systems },
    lineItems: [],
    pricing: { markupMultiplier: 1 },
    summary: {
      title: scopeLabel,
      estimateRequest: [
        `${scopeLabel}: ${width || "unspecified"}m x ${length || "unspecified"}m`,
        moduleCount ? `${moduleCount} panels` : "",
        systems.length ? systems.join(" + ") : "",
      ].filter(Boolean).join(" · "),
      layoutNote: "Custom engineered scope. Pricing is built from reviewed manual line items and is not generated from a standard Atlas BOM.",
    },
    totals: {},
  }
}
