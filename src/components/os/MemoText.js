"use client"
import { useRef } from "react"

// Deliberately limited formatting: text is always rendered through React, never HTML.
function Inline({ text }) {
  return text.split(/(\*\*[^*\n]+\*\*|==[^=\n]+==|\*[^*\n]+\*)/g).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={index}>{part.slice(2, -2)}</strong>
    if (part.startsWith("==") && part.endsWith("==")) return <mark key={index} className="rounded-sm bg-yellow-100 px-0.5 text-inherit">{part.slice(2, -2)}</mark>
    if (part.startsWith("*") && part.endsWith("*")) return <em key={index}>{part.slice(1, -1)}</em>
    return part
  })
}
export function MemoText({ value }) {
  const lines = String(value || "Not yet documented.").split("\n")
  const blocks = []
  for (let i = 0; i < lines.length;) {
    const match = lines[i].match(/^\s*(?:([-*])|\d+\.)\s+(.+)$/)
    if (match) {
      const ordered = !match[1], items = [], start = parseInt(lines[i], 10) || 1
      while (i < lines.length) {
        const item = lines[i].match(ordered ? /^\s*\d+\.\s+(.+)$/ : /^\s*[-*]\s+(.+)$/)
        if (!item) break
        items.push(<li key={i}><Inline text={item[1]} /></li>); i++
      }
      blocks.push(ordered ? <ol key={i} start={start} className="my-2 list-decimal space-y-1 pl-6">{items}</ol> : <ul key={i} className="my-2 list-disc space-y-1 pl-6">{items}</ul>)
    } else {
      blocks.push(<div key={i} className="min-h-[1em] whitespace-pre-wrap"><Inline text={lines[i]} /></div>); i++
    }
  }
  return <div className="break-words">{blocks}</div>
}
export function MemoTextEditor({ value, onChange, label, rows = 6, disabled = false }) {
  const ref = useRef(null)
  function format(kind) {
    const area = ref.current
    const start = area.selectionStart, end = area.selectionEnd
    let from = start, to = end, replacement
    if (kind === "bullets" || kind === "numbers") {
      from = value.lastIndexOf("\n", start - 1) + 1
      to = value.indexOf("\n", Math.max(start, end - 1)); if (to < 0) to = value.length
      replacement = value.slice(from, to).split("\n").map((line, i) => `${kind === "bullets" ? "-" : `${i + 1}.`} ${line.replace(/^\s*(?:[-*]|\d+\.)\s+/, "")}`).join("\n")
    } else {
      const marker = kind === "bold" ? "**" : kind === "italic" ? "*" : "=="
      const selected = value.slice(start, end)
      if (!selected) { area.focus(); return }
      replacement = selected.split("\n").map(line => line ? (line.startsWith(marker) && line.endsWith(marker) ? line.slice(marker.length, -marker.length) : `${marker}${line}${marker}`) : line).join("\n")
    }
    const next = value.slice(0, from) + replacement + value.slice(to)
    if (next.length > 12000) return
    onChange(next)
    requestAnimationFrame(() => { area.focus(); area.setSelectionRange(from, from + replacement.length) })
  }
  return <div className="mt-2 overflow-hidden rounded-xl border border-slate-300 bg-white font-normal">
    <div role="toolbar" aria-label={`${label} formatting`} className="flex flex-wrap gap-1 border-b border-slate-200 bg-slate-50 p-2">
      {[["bold", "Bold"], ["italic", "Italic"], ["highlight", "Highlight"], ["bullets", "Bullets"], ["numbers", "Numbered list"]].map(([key, title]) => <button key={key} type="button" disabled={disabled} onMouseDown={event => event.preventDefault()} onClick={() => format(key)} className="rounded-md px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-blue-100 focus-visible:outline-blue-600 disabled:opacity-50">{title}</button>)}
    </div>
    <textarea ref={ref} aria-label={label} disabled={disabled} rows={rows} maxLength={12000} value={value} onChange={event => onChange(event.target.value)} className="block w-full resize-y bg-white p-3 text-sm leading-6 text-slate-900 focus:outline-blue-500" />
    <details className="border-t border-slate-100 px-3 py-2 text-sm"><summary className="cursor-pointer text-xs text-slate-500">Formatting preview</summary><div className="py-3 leading-7 text-slate-700"><MemoText value={value} /></div></details>
    <p className="px-3 pb-2 text-xs text-slate-500">Select text to format. **Bold**, *italic* and ==highlight== are shown in the saved document.</p>
  </div>
}
