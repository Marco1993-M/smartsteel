"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Link2, Printer } from "lucide-react"
import InvoiceDocumentViewport from "../../../../components/InvoiceDocumentViewport"
import { buildInvoiceDisplayModel } from "../../../../lib/invoices/invoiceDocument"
import { supabase } from "../../../../lib/supabase"

const CRM_INVOICES_STORAGE_KEY = "smartsteel.crm.invoices"

function readStoredInvoices() {
  if (typeof window === "undefined") return {}

  try {
    return JSON.parse(window.localStorage.getItem(CRM_INVOICES_STORAGE_KEY) || "{}")
  } catch {
    return {}
  }
}

function findLocalInvoice(invoiceId) {
  const stored = readStoredInvoices()
  const allInvoices = Object.values(stored).flat()
  return allInvoices.find((invoice) => invoice.id === invoiceId) || null
}

function buildShareUrl(shareToken) {
  if (!shareToken || typeof window === "undefined") return ""
  return `${window.location.origin}/invoices/${shareToken}`
}

function buildPdfUrl(invoiceId) {
  if (!invoiceId) return ""
  return `/api/invoices/${invoiceId}/pdf`
}

function isLocalInvoiceId(invoiceId) {
  return String(invoiceId || "").startsWith("local-")
}

export default function InvoicePrintPageClient({ invoiceId }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [invoice, setInvoice] = useState(null)
  const [lead, setLead] = useState(null)
  const [shareCopied, setShareCopied] = useState(false)

  useEffect(() => {
    let isMounted = true

    const loadInvoice = async () => {
      setLoading(true)
      setError("")

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.user) {
        router.replace("/login")
        return
      }

      if (invoiceId.startsWith("local-")) {
        const localInvoice = findLocalInvoice(invoiceId)

        if (!localInvoice) {
          if (isMounted) {
            setError("We couldn't find that saved invoice in this browser.")
            setLoading(false)
          }
          return
        }

        const { data: leadData } = await supabase
          .from("leads")
          .select("*")
          .eq("id", localInvoice.lead_id)
          .single()

        if (isMounted) {
          setInvoice(localInvoice)
          setLead(leadData || null)
          setLoading(false)
        }
        return
      }

      const { data: invoiceData, error: invoiceError } = await supabase
        .from("invoices")
        .select("*")
        .eq("id", invoiceId)
        .single()

      if (invoiceError || !invoiceData) {
        if (isMounted) {
          setError(invoiceError?.message || "We couldn't load that invoice.")
          setLoading(false)
        }
        return
      }

      const { data: leadData, error: leadError } = await supabase
        .from("leads")
        .select("*")
        .eq("id", invoiceData.lead_id)
        .single()

      if (isMounted) {
        setInvoice(invoiceData)
        setLead(leadError ? null : leadData)
        setLoading(false)
      }
    }

    loadInvoice()

    return () => {
      isMounted = false
    }
  }, [invoiceId, router])

  const documentModel = useMemo(() => {
    if (!invoice) return null
    return buildInvoiceDisplayModel(invoice, lead)
  }, [invoice, lead])

  const shareUrl = useMemo(
    () => buildShareUrl(documentModel?.shareToken || invoice?.share_token),
    [documentModel?.shareToken, invoice?.share_token]
  )

  useEffect(() => {
    if (!invoice?.title) return

    const previousTitle = document.title
    document.title = `${invoice.title} | Smart Steel`

    return () => {
      document.title = previousTitle
    }
  }, [invoice?.title])

  const handleCopyShareLink = async () => {
    if (!shareUrl) return
    await navigator.clipboard.writeText(shareUrl)
    setShareCopied(true)
    window.setTimeout(() => setShareCopied(false), 1800)
  }

  const handleOpenPdf = () => {
    if (isLocalInvoiceId(invoice?.id)) {
      window.print()
      return
    }

    const pdfUrl = buildPdfUrl(invoice?.id)
    if (!pdfUrl) return
    window.location.href = pdfUrl
  }

  if (loading) {
    return (
      <main className="min-h-screen overflow-x-hidden bg-slate-100 px-6 py-12">
        <div className="mx-auto max-w-5xl rounded-3xl bg-white p-10 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Loading invoice document...</p>
        </div>
      </main>
    )
  }

  if (error || !invoice || !documentModel) {
    return (
      <main className="min-h-screen overflow-x-hidden bg-slate-100 px-6 py-12">
        <div className="mx-auto max-w-3xl rounded-3xl bg-white p-10 shadow-sm">
          <p className="text-sm font-medium text-red-600">{error || "We couldn't load that invoice."}</p>
          <Link
            href="/kanban"
            className="mt-6 inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowLeft size={16} />
            Back to CRM
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-100 px-4 py-8 print:bg-white print:px-0 print:py-0">
      <div className="mx-auto mb-6 flex max-w-[210mm] flex-wrap items-center justify-between gap-4 print:hidden">
        <Link
          href="/kanban"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          <ArrowLeft size={16} />
          Back to CRM
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          {shareUrl ? (
            <button
              type="button"
              onClick={handleCopyShareLink}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <Link2 size={16} />
              {shareCopied ? "Share Link Copied" : "Copy Share Link"}
            </button>
          ) : null}
          <button
            type="button"
            onClick={handleOpenPdf}
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            <Printer size={16} />
            {isLocalInvoiceId(invoice?.id) ? "Print / Save PDF" : "Open Generated PDF"}
          </button>
        </div>
      </div>

      <InvoiceDocumentViewport documentModel={documentModel} />
    </main>
  )
}
