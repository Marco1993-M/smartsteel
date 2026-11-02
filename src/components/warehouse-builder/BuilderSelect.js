"use client"

import { Children } from "react"
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react"
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/24/outline"

export default function BuilderSelect({ children, value, onChange, className = "", required, ...props }) {
  const options = Children.toArray(children).filter(Boolean).map((option) => ({
    value: String(option.props.value),
    label: option.props.children,
    disabled: option.props.disabled,
  }))
  const selected = options.find((option) => option.value === String(value))

  return (
    <Listbox value={String(value ?? "")} onChange={(next) => onChange({ target: { value: next } })}>
      <ListboxButton
        {...props}
        data-value={String(value ?? "")}
        aria-required={required || undefined}
        className={`${className} group flex items-center justify-between gap-2 text-left shadow-sm transition hover:border-[#8faabb] focus-visible:border-[#0043f3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0043f3]/15 data-open:border-[#0043f3] data-open:ring-2 data-open:ring-[#0043f3]/10`}
      >
        <span className={`min-w-0 truncate ${String(value ?? "") === "" ? "text-slate-400" : ""}`}>{selected?.label || "Select an option"}</span>
        <ChevronDownIcon aria-hidden="true" className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-data-open:rotate-180 group-data-open:text-[#0043f3]" />
      </ListboxButton>
      <ListboxOptions
        anchor={{ to: "bottom start", gap: 6, padding: 12 }}
        modal={false}
        className="z-[100] max-h-64 w-[var(--button-width)] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-1.5 text-sm shadow-[0_16px_40px_-12px_rgba(0,29,46,0.3)] outline-none [scrollbar-width:thin]"
      >
        {options.map((option) => (
          <ListboxOption key={option.value} value={option.value} data-value={option.value} disabled={option.disabled} className="group flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-slate-700 outline-none data-focus:bg-[#edf5fa] data-selected:bg-[#0043f3]/[0.07] data-selected:font-semibold data-selected:text-[#0043f3] data-disabled:cursor-default data-disabled:opacity-40">
            <span>{option.label}</span>
            <CheckIcon aria-hidden="true" className="invisible h-4 w-4 shrink-0 text-[#0043f3] group-data-selected:visible" />
          </ListboxOption>
        ))}
      </ListboxOptions>
    </Listbox>
  )
}
