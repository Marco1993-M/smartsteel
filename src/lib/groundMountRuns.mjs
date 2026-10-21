export const GROUND_MOUNT_PANEL_OPTIONS = Array.from({ length: 10 }, (_, i) => (i + 1) * 6)
export const GROUND_MOUNT_MAX_RUNS = 10
export function validateGroundMountRuns(runs) {
  if (!Array.isArray(runs) || !runs.length || runs.length > GROUND_MOUNT_MAX_RUNS) throw new Error("Choose between 1 and 10 ground-mount runs.")
  return runs.map((run, i) => {
    const panelCount = Number(run.panelCount)
    if (!GROUND_MOUNT_PANEL_OPTIONS.includes(panelCount)) throw new Error("Each run must have 6–60 panels, in multiples of 6.")
    return { id: `run-${i + 1}`, panelCount }
  })
}
export function groundMountRunsFromNotes(notes) {
  return [...String(notes || "").matchAll(/^Ground-mount run [A-J]: (\d+) panels\s*$/gm)]
    .map((match, i) => ({ id: `run-${i + 1}`, panelCount: Number(match[1]) }))
    .filter((run) => GROUND_MOUNT_PANEL_OPTIONS.includes(run.panelCount)).slice(0, 10)
}
export function withGroundMountRunNotes(notes, runs) {
  const other = String(notes || "").split("\n").filter((line) => !/^Ground-mount run [A-J]: \d+ panels\s*$/.test(line)).join("\n").trim()
  const lines = runs.length ? validateGroundMountRuns(runs).map((run, i) => `Ground-mount run ${String.fromCharCode(65 + i)}: ${run.panelCount} panels`) : []
  return [other, ...lines].filter(Boolean).join("\n")
}
