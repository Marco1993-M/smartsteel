import CatalogItemsWorkspace from "../../../../components/os/CatalogItemsWorkspace"

const guidance = [
  {
    title: "Reusable before custom",
    body: "Capture the recurring parts and assemblies first so BOM and pricing can start from repeatable structure.",
  },
  {
    title: "Family-linked",
    body: "Link components back to the right Atlas family so the next layer can follow product logic instead of memory.",
  },
  {
    title: "Commercially useful",
    body: "A component should help the next quote, revision, or scope handoff move faster.",
  },
]

const rules = [
  "Keep primary steel, secondary steel, cladding, and fittings clearly separated enough for pricing control.",
  "Reusable components should be named once and reused across future BOM and pricing logic.",
  "If a part only exists for one unusual job, it should stay a project exception instead of becoming a default component.",
]

export default function AtlasComponentsPage() {
  return (
    <CatalogItemsWorkspace
      platformKey="atlas"
      kind="component"
      title="Live Atlas component register"
      description="Track the reusable Atlas parts and assemblies that future BOM, pricing, and revision flows should point to."
      guidance={guidance}
      rules={rules}
    />
  )
}
