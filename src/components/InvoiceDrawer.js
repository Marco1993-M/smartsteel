"use client"

import { Fragment, useEffect, useMemo, useState } from "react"
import { Dialog, Transition } from "@headlessui/react"
import { ArrowLeft, Plus, Printer, Save, Trash2 } from "lucide-react"
import { formatCurrency } from "../lib/estimates/warehouseEstimate"

function roundMoney(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100
}

function getTodayInputValue() {
  return new Date().toISOString().split("T")[0]
}

function addDays(dateString, days) {
  const base = dateString ? new Date(dateString) : new Date()
  base.setDate(base.getDate() + days)
  return base.toISOString().split("T")[0]
}

function stripSequenceSuffix(title) {
  return String(title || "").replace(/\s+#?\d+$/i, "").trim()
}

function getLatestInvoice(invoices) {
  return [...(invoices || [])]
    .sort((a, b) => {
      const seqDiff = Number(b?.sequence_no || 0) - Number(a?.sequence_no || 0)
      if (seqDiff !== 0) return seqDiff

      const dateA = new Date(a?.created_at || 0).getTime()
      const dateB = new Date(b?.created_at || 0).getTime()
      return dateB - dateA
    })[0]
}

function getNextInvoiceSequence(invoices = []) {
  const maxSequence = invoices.reduce((highest, invoice) => {
    const sequence = Number(invoice?.sequence_no || 0)
    return Number.isFinite(sequence) ? Math.max(highest, sequence) : highest
  }, 0)

  return maxSequence + 1
}

function buildInvoiceNumber(sequenceNo) {
  return `INV-${String(sequenceNo || 1).padStart(3, "0")}`
}

function isLocalInvoiceId(invoiceId) {
  return String(invoiceId || "").startsWith("local-")
}

function buildInvoicePreviewUrl(invoiceId) {
  if (!invoiceId) return ""
  return `/kanban/invoices/${invoiceId}`
}

function buildInvoicePdfUrl(invoiceId) {
  if (!invoiceId) return ""
  return `/api/invoices/${invoiceId}/pdf`
}

function openInvoiceDocument(url) {
  if (!url || typeof window === "undefined") return
  const prefersSameTab =
    window.matchMedia?.("(max-width: 768px)").matches ||
    window.matchMedia?.("(pointer: coarse)").matches

  if (prefersSameTab) {
    window.location.href = url
    return
  }

  window.open(url, "_blank", "noopener,noreferrer")
}

function buildLineItem(item, overrides = {}) {
  const quantity = Number(overrides.quantity ?? item.quantity ?? 0)
  const unitRate = Number(overrides.unitRate ?? item.unitRate ?? 0)

  return {
    id: overrides.id || item.id || item.code || `line-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    code: overrides.code || item.code || "",
    label: overrides.label ?? item.label ?? "Manual line item",
    quantity,
    unit: overrides.unit ?? item.unit ?? "item",
    unitRate,
    total: roundMoney(quantity * unitRate),
    overrideReason: overrides.overrideReason || item.overrideReason || "",
  }
}

function buildLineItemsFromSources(latestInvoice, latestEstimate) {
  if (Array.isArray(latestInvoice?.line_items) && latestInvoice.line_items.length > 0) {
    return latestInvoice.line_items.map((item) => buildLineItem(item, item))
  }

  if (Array.isArray(latestEstimate?.line_items) && latestEstimate.line_items.length > 0) {
    return latestEstimate.line_items.map((item) => buildLineItem(item, item))
  }

  return [
    buildLineItem({
      label: "Manual line item",
      quantity: 1,
      unit: "item",
      unitRate: 0,
    }),
  ]
}

function buildInitialState(lead, invoice, latestEstimate) {
  const issueDate = invoice?.issue_date || getTodayInputValue()
  const invoiceFor =
    invoice?.invoice_for ||
    latestEstimate?.product_type_display ||
    latestEstimate?.product_type ||
    lead?.product_type ||
    "Smart Steel project"

  return {
    title: stripSequenceSuffix(invoice?.title) || `${invoiceFor} Invoice`,
    invoiceFor,
    referenceNo: invoice?.reference_no || "",
    issueDate,
    dueDate: invoice?.due_date || addDays(issueDate, 7),
    paymentTerms: invoice?.payment_terms || "Payment due within 7 days",
    notes: invoice?.notes || "",
    productType: invoice?.product_type || latestEstimate?.product_type || lead?.product_type || "",
    productTypeLabel:
      invoice?.product_type_display ||
      latestEstimate?.product_type_display ||
      latestEstimate?.product_type ||
      lead?.product_type ||
      "",
    width: invoice?.input_data?.width || latestEstimate?.input_data?.width || "",
    length: invoice?.input_data?.length || latestEstimate?.input_data?.length || "",
    quantity: invoice?.input_data?.quantity || latestEstimate?.input_data?.quantity || 1,
  }
}

function buildInvoiceDraft({
  lead,
  formState,
  lineItems,
  subtotal,
  sequenceNo,
  existingInvoice,
  saveMode = "new",
}) {
  return {
    id: existingInvoice?.id,
    lead,
    sequence_no: sequenceNo,
    invoice_number: existingInvoice?.invoice_number || buildInvoiceNumber(sequenceNo),
    title: formState.title.trim() || `${formState.invoiceFor.trim() || "Smart Steel project"} Invoice`,
    invoice_for: formState.invoiceFor.trim() || formState.productTypeLabel || formState.productType || "Smart Steel project",
    product_type: formState.productType || "",
    product_type_display: formState.productTypeLabel || formState.productType || "",
    reference_no: formState.referenceNo.trim(),
    issue_date: formState.issueDate,
    due_date: formState.dueDate,
    payment_terms: formState.paymentTerms.trim(),
    notes: formState.notes,
    line_items: lineItems,
    subtotal,
    vat_rate: 0.15,
    total: roundMoney(subtotal * 1.15),
    input_data: {
      width: formState.width || "",
      length: formState.length || "",
      quantity: Number(formState.quantity || 1),
      invoiceFor: formState.invoiceFor.trim(),
    },
    save_mode: saveMode,
    share_token: existingInvoice?.share_token,
  }
}

export default function InvoiceDrawer({
  lead,
  invoices,
  estimates,
  onClose,
  onSaveInvoice,
}) {
  const latestEstimate = useMemo(() => {
    return [...(estimates || [])].sort((a, b) => Number(b?.version_no || 0) - Number(a?.version_no || 0))[0]
  }, [estimates])
  const latestInvoice = useMemo(() => getLatestInvoice(invoices), [invoices])
  const [loadedInvoiceId, setLoadedInvoiceId] = useState(() => latestInvoice?.id || null)
  const loadedInvoice = useMemo(() => {
    if (!loadedInvoiceId) return latestInvoice || null
    return invoices.find((invoice) => invoice.id === loadedInvoiceId) || latestInvoice || null
  }, [invoices, latestInvoice, loadedInvoiceId])
  const [formState, setFormState] = useState(() => buildInitialState(lead, latestInvoice, latestEstimate))
  const [lineItems, setLineItems] = useState(() => buildLineItemsFromSources(latestInvoice, latestEstimate))
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setLoadedInvoiceId(latestInvoice?.id || null)
  }, [lead?.id, latestInvoice?.id])

  useEffect(() => {
    setFormState(buildInitialState(lead, loadedInvoice, latestEstimate))
    setLineItems(buildLineItemsFromSources(loadedInvoice, latestEstimate))
  }, [lead, loadedInvoice, latestEstimate])

  const nextSequence = getNextInvoiceSequence(invoices)
  const canUpdateLoadedInvoice = Boolean(loadedInvoice?.id)
  const sortedInvoices = useMemo(
    () =>
      [...(invoices || [])].sort((a, b) => {
        const seqDiff = Number(b?.sequence_no || 0) - Number(a?.sequence_no || 0)
        if (seqDiff !== 0) return seqDiff
        return new Date(b?.created_at || 0).getTime() - new Date(a?.created_at || 0).getTime()
      }),
    [invoices]
  )
  const subtotal = useMemo(
    () => roundMoney(lineItems.reduce((sum, item) => sum + Number(item.total || 0), 0)),
    [lineItems]
  )
  const vatAmount = roundMoney(subtotal * 0.15)
  const totalInclVat = roundMoney(subtotal + vatAmount)

  const updateLineItem = (id, updates) => {
    setLineItems((current) =>
      current.map((item) => {
        if (item.id !== id) return item
        const nextItem = { ...item, ...updates }
        return {
          ...nextItem,
          quantity: Number(nextItem.quantity) || 0,
          unitRate: Number(nextItem.unitRate) || 0,
          total: roundMoney((Number(nextItem.quantity) || 0) * (Number(nextItem.unitRate) || 0)),
        }
      })
    )
  }

  const addManualItem = () => {
    const id = `manual-${Date.now()}`
    setLineItems((current) => [
      ...current,
      buildLineItem(
        {
          label: "Manual line item",
          quantity: 1,
          unit: "item",
          unitRate: 0,
        },
        { id }
      ),
    ])
  }

  const removeLineItem = (id) => {
    setLineItems((current) => current.filter((item) => item.id !== id))
  }

  const handleChange = (field, value) => {
    setFormState((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    const savedInvoice = await onSaveInvoice(
      buildInvoiceDraft({
        lead,
        formState,
        lineItems,
        subtotal,
        sequenceNo: nextSequence,
      })
    )
    setIsSaving(false)

    if (savedInvoice) onClose()
  }

  const handleSaveAndOpen = async () => {
    setIsSaving(true)
    const savedInvoice = await onSaveInvoice(
      buildInvoiceDraft({
        lead,
        formState,
        lineItems,
        subtotal,
        sequenceNo: nextSequence,
      })
    )
    setIsSaving(false)

    if (savedInvoice?.id) {
      openInvoiceDocument(
        isLocalInvoiceId(savedInvoice.id)
          ? buildInvoicePreviewUrl(savedInvoice.id)
          : buildInvoicePdfUrl(savedInvoice.id)
      )
      onClose()
    }
  }

  const handleUpdateLoadedInvoice = async (openAfterSave = false) => {
    if (!loadedInvoice?.id) return

    setIsSaving(true)
    const savedInvoice = await onSaveInvoice(
      buildInvoiceDraft({
        lead,
        formState,
        lineItems,
        subtotal,
        sequenceNo: Number(loadedInvoice.sequence_no) || nextSequence,
        existingInvoice: loadedInvoice,
        saveMode: "update",
      })
    )
    setIsSaving(false)

    if (!savedInvoice?.id) return

    if (openAfterSave) {
      openInvoiceDocument(
        isLocalInvoiceId(savedInvoice.id)
          ? buildInvoicePreviewUrl(savedInvoice.id)
          : buildInvoicePdfUrl(savedInvoice.id)
      )
    }

    onClose()
  }

  return (
    <Transition.Root show={!!lead} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex justify-end">
          <Transition.Child
            as="div"
            enter="transform transition ease-in-out duration-300"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="transform transition ease-in-out duration-200"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <Dialog.Panel className="flex h-full w-screen max-w-full flex-col overflow-hidden bg-white shadow-xl sm:w-[520px] sm:max-w-[520px]">
              <div className="sticky top-0 z-10 border-b bg-white px-4 py-3 sm:px-6 sm:py-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <button onClick={onClose} className="shrink-0 rounded-full p-2 transition hover:bg-gray-100">
                      <ArrowLeft size={20} />
                    </button>
                    <div className="min-w-0">
                      <Dialog.Title className="text-lg font-semibold text-slate-900 sm:text-xl">
                        {canUpdateLoadedInvoice ? "Edit Invoice" : "Create Invoice"}
                      </Dialog.Title>
                      <p className="truncate text-sm text-slate-500">
                        {lead?.name} {lead?.last_name} · {canUpdateLoadedInvoice ? loadedInvoice?.invoice_number : buildInvoiceNumber(nextSequence)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
                <div className="space-y-6">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-medium text-slate-900">Invoice setup</p>
                    <p className="mt-1 text-sm text-slate-600">
                      Match the estimate style, keep the line items editable, and clearly state what is being invoiced.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700">Invoice title</label>
                    <input
                      type="text"
                      value={formState.title}
                      onChange={(event) => handleChange("title", event.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700">What are we invoicing for?</label>
                    <input
                      type="text"
                      value={formState.invoiceFor}
                      onChange={(event) => handleChange("invoiceFor", event.target.value)}
                      placeholder="Example: Deposit for custom loading bay structure"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    />
                    <p className="mt-1 text-xs text-slate-500">
                      Use this for custom requests so the invoice reads clearly to the client.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-slate-700">Issue date</label>
                      <input
                        type="date"
                        value={formState.issueDate}
                        onChange={(event) => handleChange("issueDate", event.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700">Due date</label>
                      <input
                        type="date"
                        value={formState.dueDate}
                        onChange={(event) => handleChange("dueDate", event.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-slate-700">Reference / PO</label>
                      <input
                        type="text"
                        value={formState.referenceNo}
                        onChange={(event) => handleChange("referenceNo", event.target.value)}
                        placeholder="Optional"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700">Payment terms</label>
                      <input
                        type="text"
                        value={formState.paymentTerms}
                        onChange={(event) => handleChange("paymentTerms", event.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">Line items</h3>
                        <p className="mt-1 text-xs text-slate-500">
                          Prices stay fully editable here, including custom billed items.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={addManualItem}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                      >
                        <Plus size={16} />
                        Add item
                      </button>
                    </div>

                    <div className="mt-4 space-y-3">
                      {lineItems.map((item) => (
                        <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                          <div className="grid gap-3 sm:grid-cols-[1.6fr_0.55fr_0.55fr_0.75fr_auto]">
                            <input
                              type="text"
                              value={item.label}
                              onChange={(event) => updateLineItem(item.id, { label: event.target.value })}
                              className="rounded-md border-gray-300 shadow-sm"
                              placeholder="Description"
                            />
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.quantity}
                              onChange={(event) => updateLineItem(item.id, { quantity: event.target.value })}
                              className="rounded-md border-gray-300 shadow-sm"
                              placeholder="Qty"
                            />
                            <input
                              type="text"
                              value={item.unit}
                              onChange={(event) => updateLineItem(item.id, { unit: event.target.value })}
                              className="rounded-md border-gray-300 shadow-sm"
                              placeholder="Unit"
                            />
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.unitRate}
                              onChange={(event) => updateLineItem(item.id, { unitRate: event.target.value })}
                              className="rounded-md border-gray-300 shadow-sm"
                              placeholder="Rate"
                            />
                            <button
                              type="button"
                              onClick={() => removeLineItem(item.id)}
                              className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-white px-3 py-2 text-red-600 transition hover:bg-red-50"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                            <span>Line total</span>
                            <span className="font-semibold text-slate-900">{formatCurrency(item.total || 0)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700">Invoice notes</label>
                    <textarea
                      value={formState.notes}
                      onChange={(event) => handleChange("notes", event.target.value)}
                      rows={4}
                      placeholder="Optional billing or scope notes"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    />
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Excl. VAT</p>
                        <p className="mt-1 text-xl font-bold text-slate-900">{formatCurrency(subtotal)}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">VAT (15%)</p>
                        <p className="mt-1 text-xl font-bold text-slate-900">{formatCurrency(vatAmount)}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Incl. VAT</p>
                        <p className="mt-1 text-xl font-bold text-slate-900">{formatCurrency(totalInclVat)}</p>
                      </div>
                    </div>
                  </div>

                  {sortedInvoices.length > 0 ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <h3 className="text-sm font-semibold text-slate-900">Saved invoices</h3>
                      <div className="mt-3 space-y-2">
                        {sortedInvoices.map((invoice) => (
                          <button
                            key={invoice.id}
                            type="button"
                            onClick={() => setLoadedInvoiceId(invoice.id)}
                            className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                              loadedInvoiceId === invoice.id
                                ? "border-slate-900 bg-slate-900 text-white"
                                : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                            }`}
                          >
                            <p className="text-sm font-semibold">{invoice.invoice_number || buildInvoiceNumber(invoice.sequence_no)}</p>
                            <p className={`mt-1 text-xs ${loadedInvoiceId === invoice.id ? "text-slate-300" : "text-slate-500"}`}>
                              {invoice.title} · {formatCurrency(invoice.total || 0)}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="border-t bg-white px-4 py-3 sm:px-6 sm:py-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-xs text-slate-500">
                    Client-facing invoice number: {canUpdateLoadedInvoice ? loadedInvoice?.invoice_number : buildInvoiceNumber(nextSequence)}
                  </div>
                  <div className="flex flex-wrap justify-end gap-2">
                    {canUpdateLoadedInvoice ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleUpdateLoadedInvoice(false)}
                          disabled={isSaving}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-60"
                        >
                          <Save size={16} />
                          {isSaving ? "Saving..." : "Update invoice"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateLoadedInvoice(true)}
                          disabled={isSaving}
                          className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
                        >
                          <Printer size={16} />
                          Update & open
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={handleSave}
                          disabled={isSaving}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-60"
                        >
                          <Save size={16} />
                          {isSaving ? "Saving..." : "Save invoice"}
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveAndOpen}
                          disabled={isSaving}
                          className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
                        >
                          <Printer size={16} />
                          Save & open
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
