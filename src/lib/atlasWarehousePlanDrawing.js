function escapeXml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[character])
}

// Shared SVG drawing for the builder, estimate and foundation PDF.
export function getAtlasWarehousePlanDrawing(plan, { showFootings = true } = {}) {
  const scale = Math.min(48, 900 / plan.lengthM, 440 / plan.widthM)
  const length = plan.lengthM * scale
  const width = plan.widthM * scale
  // Keep the left span dimension inside the SVG even on long configurations.
  const viewWidth = Math.max(700, length + 190)
  const viewHeight = Math.max(540, width + 240)
  const left = (viewWidth - length) / 2
  const top = (viewHeight - width) / 2
  const right = left + length
  const bottom = top + width
  const footingSide = (plan.footingSizeMm / 1000) * scale
  const gableColumns = [
    ...(plan.frontGableColumnOffsetsM || []).map((offsetM) => ({ x: left, y: top + offsetM * scale })),
    ...(plan.rearGableColumnOffsetsM || []).map((offsetM) => ({ x: right, y: top + offsetM * scale })),
  ]
  const frames = Array.from({ length: plan.portalFrames }, (_, index) => ({ x: left + index * plan.baySpacingM * scale, label: String(index + 1) }))
  const openingHeight = (plan.frontOpeningWidthM || 0) * scale
  const openingTop = top + (width - openingHeight) / 2
  const openingBottom = openingTop + openingHeight
  const ink = "#173247"
  const secondary = "#607489"
  const grid = "#aabac7"
  const bubble = (x, y, label) => `<circle cx="${x}" cy="${y}" r="12" fill="#fff" stroke="${secondary}" stroke-width="1"/><text x="${x}" y="${y + 4}" text-anchor="middle" fill="${ink}" font-size="11" font-weight="600">${label}</text>`
  const column = (x, y, kind) => `<g data-column-kind="${kind}">${showFootings ? `<rect x="${x - footingSide / 2}" y="${y - footingSide / 2}" width="${footingSide}" height="${footingSide}" fill="#fff" fill-opacity="0.75" stroke="#b87c36" stroke-width="1"/>` : ""}<circle cx="${x}" cy="${y}" r="2.8" fill="${ink}"/></g>`
  const ariaLabel = `Indicative plan of Atlas ${plan.familyCode}, ${plan.widthM} by ${plan.lengthM} metres, ${plan.bays} four-metre bays, ${plan.columnCount} main columns and ${plan.gableColumnCount || 0} gable columns`
  const markup = `<rect width="${viewWidth}" height="${viewHeight}" fill="#fff"/>
    ${frames.map(({ x, label }) => `<g><line x1="${x}" y1="${top - 44}" x2="${x}" y2="${bottom + 44}" stroke="${grid}" stroke-width="0.8" stroke-dasharray="5 4"/>${[top - 43, bottom + 43].map((y) => bubble(x, y, label)).join("")}</g>`).join("")}
    ${[{ y: top, label: "A" }, { y: bottom, label: "B" }].map(({ y, label }) => `<g><line x1="${left - 45}" y1="${y}" x2="${right + 45}" y2="${y}" stroke="${grid}" stroke-width="0.8" stroke-dasharray="5 4"/>${[left - 44, right + 44].map((x) => bubble(x, y, label)).join("")}</g>`).join("")}
    <line x1="${left}" y1="${top}" x2="${right}" y2="${top}" stroke="${ink}" stroke-width="1.8"/>
    <line x1="${right}" y1="${top}" x2="${right}" y2="${bottom}" stroke="${ink}" stroke-width="1.8"/>
    <line x1="${right}" y1="${bottom}" x2="${left}" y2="${bottom}" stroke="${ink}" stroke-width="1.8"/>
    ${plan.frontOpeningWidthM ? `<line x1="${left}" y1="${top}" x2="${left}" y2="${openingTop}" stroke="${ink}" stroke-width="1.8"/><line x1="${left}" y1="${openingBottom}" x2="${left}" y2="${bottom}" stroke="${ink}" stroke-width="1.8"/><line x1="${left}" y1="${openingTop}" x2="${left}" y2="${openingBottom}" stroke="#0043f3" stroke-width="1.2" stroke-dasharray="5 4"/><text x="${left + 9}" y="${(openingTop + openingBottom) / 2 - 5}" fill="#0043f3" font-size="11" font-weight="600">${plan.frontOpeningWidthM}m clear opening</text>` : `<line x1="${left}" y1="${top}" x2="${left}" y2="${bottom}" stroke="${ink}" stroke-width="1.8"/>`}
    <line x1="${left}" y1="${top + width / 2}" x2="${right}" y2="${top + width / 2}" stroke="${grid}" stroke-width="0.8" stroke-dasharray="8 5"/>
    ${frames.flatMap(({ x }) => [top, bottom].map((y) => column(x, y, "main"))).join("")}
    ${gableColumns.map(({ x, y }) => column(x, y, "gable")).join("")}
    ${frames.slice(0, -1).map(({ x }) => `<g><line x1="${x}" y1="${top - 73}" x2="${x + plan.baySpacingM * scale}" y2="${top - 73}" stroke="${secondary}" stroke-width="0.8"/><line x1="${x}" y1="${top - 78}" x2="${x}" y2="${top - 68}" stroke="${secondary}" stroke-width="0.8"/><text x="${x + (plan.baySpacingM * scale) / 2}" y="${top - 79}" text-anchor="middle" fill="${secondary}" font-size="10">4 000</text></g>`).join("")}
    <line x1="${left}" y1="${top - 96}" x2="${right}" y2="${top - 96}" stroke="${ink}" stroke-width="1"/>
    <line x1="${left}" y1="${top - 101}" x2="${left}" y2="${top - 91}" stroke="${ink}" stroke-width="1"/>
    <line x1="${right}" y1="${top - 101}" x2="${right}" y2="${top - 91}" stroke="${ink}" stroke-width="1"/>
    <text x="${(left + right) / 2}" y="${top - 103}" text-anchor="middle" fill="${ink}" font-size="12" font-weight="600">${(plan.lengthM * 1000).toLocaleString("en-ZA")}</text>
    <line x1="${left - 75}" y1="${top}" x2="${left - 75}" y2="${bottom}" stroke="${ink}" stroke-width="1"/>
    <line x1="${left - 80}" y1="${top}" x2="${left - 70}" y2="${top}" stroke="${ink}" stroke-width="1"/>
    <line x1="${left - 80}" y1="${bottom}" x2="${left - 70}" y2="${bottom}" stroke="${ink}" stroke-width="1"/>
    <text x="${left - 83}" y="${(top + bottom) / 2}" text-anchor="middle" fill="${ink}" font-size="12" font-weight="600" transform="rotate(-90 ${left - 83} ${(top + bottom) / 2})">${(plan.widthM * 1000).toLocaleString("en-ZA")}</text>
    <line x1="28" y1="${viewHeight - 48}" x2="${viewWidth - 28}" y2="${viewHeight - 48}" stroke="#d9e2e9" stroke-width="1"/>
    <text x="28" y="${viewHeight - 28}" fill="${ink}" font-size="10" font-weight="700">ATLAS ${escapeXml(plan.familyCode)} · INDICATIVE COLUMN SETTING-OUT</text>
    <text x="${viewWidth - 28}" y="${viewHeight - 28}" text-anchor="end" fill="${secondary}" font-size="9">DIMENSIONS IN mm · NOT TO SCALE</text>`
  return { viewBox: `0 0 ${viewWidth} ${viewHeight}`, ariaLabel, markup }
}

export function renderAtlasWarehousePlanSvg(plan, options) {
  const { viewBox, ariaLabel, markup } = getAtlasWarehousePlanDrawing(plan, options)
  return `<svg viewBox="${viewBox}" role="img" aria-label="${escapeXml(ariaLabel)}" xmlns="http://www.w3.org/2000/svg">${markup}</svg>`
}
