import { getAtlasWarehousePlanDrawing } from "../../lib/atlasWarehousePlanDrawing"

export default function AtlasWarehousePlan({ plan, showFootings = true, className = "" }) {
  if (!plan) return null
  const drawing = getAtlasWarehousePlanDrawing(plan, { showFootings })
  return <svg className={className} viewBox={drawing.viewBox} role="img" aria-label={drawing.ariaLabel} xmlns="http://www.w3.org/2000/svg" dangerouslySetInnerHTML={{ __html: drawing.markup }} />
}
