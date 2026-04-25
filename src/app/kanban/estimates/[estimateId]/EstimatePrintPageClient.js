"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Link2, Printer } from "lucide-react"
import EstimateDocumentViewport from "../../../../components/EstimateDocumentViewport"
import { buildEstimateDisplayModel } from "../../../../lib/estimates/estimateDocument"
import { supabase } from "../../../../lib/supabase"

const CRM_ESTIMATES_STORAGE_KEY = "smartsteel.crm.estimates"

function readStoredEstimates() {
  if (typeof window === "undefined") return {}

  try {
    return JSON.parse(window.localStorage.getItem(CRM_ESTIMATES_STORAGE_KEY) || "{}")
  } catch {
    return {}
  }
}

function findLocalEstimate(estimateId) {
  const stored = readStoredEstimates()
  const allEstimates = Object.values(stored).flat()
  return allEstimates.find((estimate) => estimate.id === estimateId) || null
}

function buildShareUrl(shareToken) {
  if (!shareToken || typeof window === "undefined") return ""
  return `${window.location.origin}/quotes/${shareToken}`
}

function buildPdfUrl(estimateId) {
  if (!estimateId) return ""
  return `/api/estimates/${estimateId}/pdf`
}

export default function EstimatePrintPageClient({ estimateId }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [estimate, setEstimate] = useState(null)
  const [lead, setLead] = useState(null)
  const [shareCopied, setShareCopied] = useState(false)

  useEffect(() => {
    let isMounted = true

    const loadEstimate = async () => {
      setLoading(true)
      setError("")

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.user) {
        router.replace("/login")
        return
      }

      if (estimateId.startsWith("local-")) {
        const localEstimate = findLocalEstimate(estimateId)

        if (!localEstimate) {
          if (isMounted) {
            setError("We couldn't find that saved estimate in this browser.")
            setLoading(false)
          }
          return
        }

        const { data: leadData } = await supabase
          .from("leads")
          .select("*")
          .eq("id", localEstimate.lead_id)
          .single()

        if (isMounted) {
          setEstimate(localEstimate)
          setLead(leadData || null)
          setLoading(false)
        }
        return
      }

      const { data: estimateData, error: estimateError } = await supabase
        .from("estimates")
        .select("*")
        .eq("id", estimateId)
        .single()

      if (estimateError || !estimateData) {
        if (isMounted) {
          setError(estimateError?.message || "We couldn't load that estimate.")
          setLoading(false)
        }
        return
      }

      const { data: leadData, error: leadError } = await supabase
        .from("leads")
        .select("*")
        .eq("id", estimateData.lead_id)
        .single()

      if (isMounted) {
        setEstimate(estimateData)
        setLead(leadError ? null : leadData)
        setLoading(false)
      }
    }

    loadEstimate()

    return () => {
      isMounted = false
    }
  }, [estimateId, router])

  const documentModel = useMemo(() => {
    if (!estimate) return null
    return buildEstimateDisplayModel(estimate, lead)
  }, [estimate, lead])

  const shareUrl = useMemo(
    () => buildShareUrl(documentModel?.shareToken || estimate?.share_token),
    [documentModel?.shareToken, estimate?.share_token]
  )

  useEffect(() => {
    if (!estimate?.title) return

    const previousTitle = document.title
    document.title = `${estimate.title} | Smart Steel`

    return () => {
      document.title = previousTitle
    }
  }, [estimate?.title])

  const handleCopyShareLink = async () => {
    if (!shareUrl) return
    await navigator.clipboard.writeText(shareUrl)
    setShareCopied(true)
    window.setTimeout(() => setShareCopied(false), 1800)
  }

  const handleOpenPdf = () => {
    const pdfUrl = buildPdfUrl(estimate?.id)
    if (!pdfUrl) return
    window.location.href = pdfUrl
  }

  if (loading) {
    return (
      <main className="min-h-screen overflow-x-hidden bg-slate-100 px-6 py-12">
        <div className="mx-auto max-w-5xl rounded-3xl bg-white p-10 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Loading estimate document...</p>
        </div>
      </main>
    )
  }

  if (error || !estimate || !documentModel) {
    return (
      <main className="min-h-screen overflow-x-hidden bg-slate-100 px-6 py-12">
        <div className="mx-auto max-w-3xl rounded-3xl bg-white p-10 shadow-sm">
          <p className="text-sm font-medium text-red-600">{error || "We couldn't load that estimate."}</p>
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
            Open Generated PDF
          </button>
        </div>
      </div>

      <EstimateDocumentViewport documentModel={documentModel} estimate={estimate} />
    </main>
  )
}
