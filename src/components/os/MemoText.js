"use client"
import { useEffect, useMemo, useRef, useState } from "react"

// Deliberately limited formatting: text is always rendered through React, never HTML.
function Inline({ text }) {
  return text.split(/(\*\*[^*\n]+\*\*|==[^=\n]+==|\*[^*\n]+\*)/g).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={index}>{part.slice(2, -2)}</strong>
    if (part.startsWith("==") && part.endsWith("==")) return <mark key={index} className="rounded-sm bg-yellow-100 px-0.5 text-inherit">{part.slice(2, -2)}</mark>
    if (part.startsWith("*") && part.endsWith("*")) return <em key={index}>{part.slice(1, -1)}</em>
    return part
  })
}
function LegacyText({ value }) {
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
const PREFIX = "@memo-rich-v1:"
const TAGS = new Set(["div", "p", "br", "strong", "em", "mark", "ul", "ol", "li"])
function readRich(value) {
  if (!String(value || "").startsWith(PREFIX)) return null
  try {
    const nodes = JSON.parse(value.slice(PREFIX.length))
    const valid = (items, depth = 0) => depth < 40 && Array.isArray(items) && items.every(node => typeof node === "string" || (node && TAGS.has(node.tag) && valid(node.children, depth + 1)))
    return valid(nodes) ? nodes : null
  } catch { return null }
}
function RichNodes({ nodes }) {
  return nodes.map((node, index) => {
    if (typeof node === "string") return node
    const Tag = node.tag
    if (Tag === "br") return <br key={index} />
    return <Tag key={index}><RichNodes nodes={node.children} /></Tag>
  })
}
const textStyles = "break-words whitespace-pre-wrap [&_mark]:bg-yellow-100 [&_mark]:text-inherit [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1 [&_p]:min-h-[1em] [&_div]:min-h-[1em]"
export function MemoText({ value }) {
  const nodes = readRich(value)
  return nodes ? <div className={textStyles}><RichNodes nodes={nodes} /></div> : <LegacyText value={value} />
}
// Store an allowlisted document tree, never executable HTML or pasted attributes.
export function serializeMemoEditor(root) {
  function children(element) { return Array.from(element.childNodes).flatMap(visit) }
  function visit(node) {
    if (node.nodeType === 3) return [node.textContent]
    if (node.nodeType !== 1 || ["SCRIPT", "STYLE", "IFRAME", "OBJECT"].includes(node.tagName)) return []
    let tag = node.tagName.toLowerCase()
    if (tag === "b") tag = "strong"
    if (tag === "i") tag = "em"
    let result = children(node)
    if (tag === "span") {
      const style = node.style
      if (style.fontWeight === "bold" || Number(style.fontWeight) >= 600) result = [{ tag: "strong", children: result }]
      if (style.fontStyle === "italic") result = [{ tag: "em", children: result }]
    }
    if (TAGS.has(tag)) result = [{ tag, children: result }]
    if (node.style.backgroundColor && !["transparent", "rgba(0, 0, 0, 0)"].includes(node.style.backgroundColor)) result = [{ tag: "mark", children: result }]
    return result
  }
  return root.textContent.trim() ? PREFIX + JSON.stringify(children(root)) : ""
}
export function MemoTextEditor({ value, onChange, label, rows = 3, disabled = false }) {
  const ref = useRef(null)
  const selection = useRef(null)
  const lastEmitted = useRef(value)
  const [initialValue, setInitialValue] = useState(value)
  const [generation, setGeneration] = useState(0)
  const [error, setError] = useState("")
  const [active, setActive] = useState({})
  const initialContent = useMemo(() => initialValue ? <MemoText value={initialValue} /> : null, [initialValue])
  useEffect(() => {
    if (value !== lastEmitted.current) {
      lastEmitted.current = value; setInitialValue(value); setGeneration(n => n + 1)
    }
  }, [value])
  function capture() {
    const sel = window.getSelection()
    if (sel?.rangeCount && ref.current?.contains(sel.anchorNode) && ref.current?.contains(sel.focusNode)) {
      selection.current = sel.getRangeAt(0).cloneRange()
      setActive({ bold: document.queryCommandState("bold"), italic: document.queryCommandState("italic"), bullets: document.queryCommandState("insertUnorderedList"), numbers: document.queryCommandState("insertOrderedList") })
    }
  }
  function publish() {
    const next = serializeMemoEditor(ref.current)
    if (next.length > 12000) {
      document.execCommand("undo")
      setError("This section is too long. Shorten it before adding more text or formatting.")
      return
    }
    setError(""); lastEmitted.current = next; onChange(next); capture()
  }
  function format(kind) {
    ref.current.focus()
    const sel = window.getSelection()
    if (selection.current && ref.current.contains(selection.current.commonAncestorContainer)) { sel.removeAllRanges(); sel.addRange(selection.current) }
    const commands = { bold: "bold", italic: "italic", bullets: "insertUnorderedList", numbers: "insertOrderedList", clear: "removeFormat" }
    document.execCommand(kind === "highlight" ? "hiliteColor" : commands[kind], false, kind === "highlight" ? "#fef9c3" : null)
    publish()
  }
  return <div className="font-normal">
    <div role="toolbar" aria-label={`${label} formatting`} className="mb-3 flex flex-wrap gap-1">
      {[["bold", "Bold"], ["italic", "Italic"], ["highlight", "Highlight"], ["bullets", "Bullets"], ["numbers", "Numbered list"], ["clear", "Clear formatting"]].map(([key, title]) => <button key={key} type="button" aria-pressed={active[key] || false} disabled={disabled} onMouseDown={event => event.preventDefault()} onClick={() => format(key)} className={`rounded-md px-2 py-1 text-xs font-semibold focus-visible:outline-blue-600 disabled:opacity-50 ${active[key] ? "bg-blue-50 text-blue-700" : "text-slate-500 hover:bg-slate-50 hover:text-blue-700"}`}>{title}</button>)}
    </div>
    <div key={generation} ref={ref} role="textbox" aria-label={label} aria-multiline="true" aria-disabled={disabled} contentEditable={!disabled} suppressContentEditableWarning onInput={publish} onKeyUp={capture} onMouseUp={capture} onBlur={capture}
      onPaste={event => { event.preventDefault(); document.execCommand("insertText", false, event.clipboardData.getData("text/plain")); publish() }}
      onDrop={event => event.preventDefault()}
      style={{ minHeight: `${rows * 2}rem` }} className={`${textStyles} text-base leading-8 text-slate-600 outline-none focus-visible:outline-none`}>{initialContent}</div>
    {error ? <p role="alert" className="mt-2 text-xs text-red-700">{error}</p> : null}
  </div>
}
