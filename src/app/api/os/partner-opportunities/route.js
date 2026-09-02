import { NextResponse } from "next/server"
import { requireOsAuth } from "lib/osRouteAuth"
import { supabaseServer } from "lib/supabase-server"
import { isSchemaMissingError } from "lib/osPhase1bData"
import { calculateAtlasWarehouseEstimate } from "lib/estimates/atlasWarehouseEstimate"
import { calculateAfgriPartnerPrice } from "lib/partnerCommercialTerms"

export const runtime = "nodejs"

const REVIEW_STATUSES = ["submitted", "in_review", "changes_requested", "quoted", "closed"]
const FULFILMENT_STATUSES = ["production_planning", "in_production", "ready_for_dispatch", "delivered", "complete", "cancelled"]
const PRODUCTION_ACTIONS = ["update_fulfilment", "update_production_plan", "release_production"]

function makeTemporaryOrderReference(reference) {
  return `TEMP-${String(reference || "AFGRI").toUpperCase()}`
}

async function nextAtlasProjectNumber() {
  const year = new Date().getFullYear()
  const prefix = `ATL-${year}-`
  const { data, error } = await supabaseServer.from("os_projects").select("project_number").like("project_number", `${prefix}%`)
  if (error) throw error
  const highest = (data || []).reduce((value, row) => {
    const sequence = Number(String(row.project_number || "").slice(prefix.length))
    return Number.isFinite(sequence) ? Math.max(value, sequence) : value
  }, 0)
  return `${prefix}${String(highest + 1).padStart(3, "0")}`
}

async function ensureInternalProject(opportunity) {
  if (opportunity.internal_project_id) return opportunity.internal_project_id
  const { data: existing, error: existingError } = await supabaseServer
    .from("os_projects")
    .select("id")
    .contains("record", { sourcePartnerOpportunityId: opportunity.id })
    .maybeSingle()
  if (existingError) throw existingError
  if (existing?.id) return existing.id

  const config = opportunity.configuration || {}
  const projectNumber = await nextAtlasProjectNumber()
  const id = `project-${crypto.randomUUID()}`
  const product = `Atlas W${String(config.width || "").padStart(2, "0")} Warehouse`
  const name = `${opportunity.customer_name} · ${product}`
  const scope = `${config.width}m × ${config.length}m × ${config.wallHeight}m · ${config.steelFinish || "Steel finish pending"} · ${config.gableMode === "structure_only" ? "Structure only" : config.gableMode === "roof_only" ? "Roof sheeted" : "Roof and walls sheeted"}`
  const record = {
    id, projectNumber, companyKey: "atlas", name,
    clientName: opportunity.customer_name,
    address: opportunity.site_location || "",
    system: product,
    siteContact: opportunity.customer_phone || opportunity.customer_email || "",
    contractor: "Smart Steel",
    projectManager: "",
    scope,
    references: [opportunity.reference, opportunity.afgri_order_reference].filter(Boolean).join(" · "),
    sourcePartnerOpportunityId: opportunity.id,
    partnerOpportunityReference: opportunity.reference,
    afgriOrderReference: opportunity.afgri_order_reference || "",
    source: "AFGRI partner order",
    fulfilmentStatus: "production_planning",
    estimatedDispatchDate: opportunity.estimated_dispatch_date || "",
    estimatedDeliveryDate: opportunity.estimated_delivery_date || "",
    fulfilmentNote: opportunity.fulfilment_note || "",
    archived: false,
    visits: [],
    createdAt: new Date().toISOString(),
  }
  const { error } = await supabaseServer.from("os_projects").insert([{ id, project_number: projectNumber, company_key: "atlas", name, archived: false, record }])
  if (error) throw error
  return id
}

function latestByDate(records = []) {
  return [...records].sort((left, right) => new Date(right.created_at || 0) - new Date(left.created_at || 0))[0] || null
}

function normalizeOpportunity(row) {
  let proposedQuote = null
  try {
    const estimate = calculateAtlasWarehouseEstimate(row.configuration || {})
    const commercialFactor = estimate.pricing.markupMultiplier || 1
    const partnerTerms = calculateAfgriPartnerPrice(estimate.pricing.estimatedTotal)
    const partnerFactor = 1 - partnerTerms.partnerAdjustmentRate
    proposedQuote = {
      amountExVat: partnerTerms.partnerPriceExVat,
      vatAmount: partnerTerms.vatAmount,
      amountInclVat: partnerTerms.partnerPriceInclVat,
      recommendedCustomerPriceExVat: partnerTerms.recommendedCustomerPriceExVat,
      partnerAdjustmentRate: partnerTerms.partnerAdjustmentRate,
      partnerAdjustmentAmount: partnerTerms.partnerAdjustmentAmount,
      structureAmountExVat: Number((estimate.pricing.steelCost * commercialFactor * partnerFactor).toFixed(2)),
      connectionsAmountExVat: Number((estimate.pricing.connectionCost * commercialFactor * partnerFactor).toFixed(2)),
      sheetingAmountExVat: Number((estimate.pricing.claddingCost * commercialFactor * partnerFactor).toFixed(2)),
      totalSteelKg: estimate.materials.totalSteelKg,
      sheetingAreaSqm: estimate.sheeting.totalSheetingArea,
      pricingRelease: estimate.meta.pricingRelease,
      sku: estimate.meta.sku,
      provisionalItems: estimate.meta.provisionalItems || [],
      inclusions: ["Atlas structural system", "Released connection allowances", "Selected sheeting scope", "Supply-only configuration"],
      exclusions: ["VAT", "Delivery", "Installation", "Foundations and concrete works", "Project-specific engineering outside the released configuration"],
    }
  } catch {
    proposedQuote = null
  }

  const currentInformationRequest = latestByDate((row.partner_information_requests || []).filter((request) => request.status === "open"))
  const submissions = [...(row.partner_submissions || [])].sort((left, right) => right.version - left.version)

  return {
    id: row.id,
    reference: row.reference,
    status: row.status,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    customerEmail: row.customer_email,
    siteLocation: row.site_location,
    configuration: row.configuration || {},
    indicativeAmountExVat: Number(row.indicative_amount_ex_vat || 0),
    partnerNotes: row.notes || "",
    internalReviewNotes: row.internal_review_notes || "",
    finalQuoteAmountExVat: row.final_quote_amount_ex_vat === null ? null : Number(row.final_quote_amount_ex_vat),
    quoteUrl: row.quote_url || "",
    partnerQuoteMessage: row.partner_quote_message || "",
    proposedQuote,
    submittedAt: row.submitted_at || "",
    quotedAt: row.quoted_at || "",
    partnerOrderStatus: row.partner_order_status || "not_ready",
    priceValidUntil: row.price_valid_until || "",
    readyForOrderAt: row.ready_for_order_at || "",
    afgriOrderReference: row.afgri_order_reference || "",
    partnerOrderNotes: row.partner_order_notes || "",
    orderSubmittedAt: row.order_submitted_at || "",
    commercialResponseStatus: row.commercial_response_status || "pending",
    commercialResponseNote: row.commercial_response_note || "",
    commercialRespondedAt: row.commercial_responded_at || "",
    customerDecision: row.customer_decision || "pending",
    customerDecisionNote: row.customer_decision_note || "",
    customerDecisionAt: row.customer_decision_at || "",
    internalProjectId: row.internal_project_id || "",
    handoffAcknowledgedAt: row.handoff_acknowledged_at || "",
    fulfilmentStatus: row.fulfilment_status || "not_started",
    estimatedDispatchDate: row.estimated_dispatch_date || "",
    estimatedDeliveryDate: row.estimated_delivery_date || "",
    fulfilmentNote: row.fulfilment_note || "",
    fulfilmentUpdatedAt: row.fulfilment_updated_at || "",
    productionOwner: row.production_owner || "",
    plannedStartDate: row.planned_start_date || "",
    plannedCompletionDate: row.planned_completion_date || "",
    productionHoldReason: row.production_hold_reason || "",
    manufacturingChecklist: Array.isArray(row.manufacturing_checklist) ? row.manufacturing_checklist : [],
    productionPlanUpdatedAt: row.production_plan_updated_at || "",
    productionReleaseStatus: row.production_release_status || "draft",
    productionReleasedAt: row.production_released_at || "",
    productionReleasedBy: row.production_released_by || "",
    productionReleaseRevision: row.production_release_revision || "",
    productionReleaseNote: row.production_release_note || "",
    orderDocuments: (row.partner_order_documents || []).map((document) => ({ id: document.id, type: document.document_type, name: document.file_name, mimeType: document.mime_type, size: Number(document.file_size || 0), createdAt: document.created_at })),
    handoffEvents: [...(row.partner_handoff_events || [])].sort((left, right) => new Date(right.created_at) - new Date(left.created_at)).map((event) => ({ id: event.id, type: event.event_type, actorScope: event.actor_scope, summary: event.summary, detail: event.detail || {}, createdAt: event.created_at })),
    updatedAt: row.updated_at,
    currentInformationRequest: currentInformationRequest
      ? {
          id: currentInformationRequest.id,
          requestText: currentInformationRequest.request_text,
          requestedFields: currentInformationRequest.requested_fields || [],
          dueAt: currentInformationRequest.due_at || "",
          createdAt: currentInformationRequest.created_at,
        }
      : null,
    submissionVersion: submissions[0]?.version || 0,
    submissions: submissions.map((submission) => ({
      id: submission.id,
      version: submission.version,
      status: submission.review_status,
      amountExVat: Number(submission.indicative_amount_ex_vat || 0),
      submittedAt: submission.submitted_at,
    })),
    product: row.partner_product_releases
      ? {
          code: row.partner_product_releases.product_code,
          name: row.partner_product_releases.name,
          releaseVersion: row.partner_product_releases.release_version,
        }
      : null,
    partner: row.partner_organizations
      ? { key: row.partner_organizations.key, name: row.partner_organizations.name }
      : null,
  }
}

export async function GET(request) {
  const authResponse = await requireOsAuth(request)
  if (authResponse) return authResponse

  const partnerKey = String(new URL(request.url).searchParams.get("partner") || "afgri").trim().toLowerCase()
  const { data, error } = await supabaseServer
    .from("partner_opportunities")
    .select("*, partner_product_releases(product_code, name, release_version), partner_organizations!inner(key, name), partner_submissions(id, version, review_status, indicative_amount_ex_vat, submitted_at), partner_information_requests(id, request_text, requested_fields, status, due_at, created_at), partner_order_documents(id, document_type, file_name, mime_type, file_size, created_at), partner_handoff_events(id, event_type, actor_scope, summary, detail, created_at)")
    .eq("partner_organizations.key", partnerKey)
    .in("status", REVIEW_STATUSES)
    .order("submitted_at", { ascending: false, nullsFirst: false })
    .order("updated_at", { ascending: false })

  if (error) {
    if (isSchemaMissingError(error)) return NextResponse.json({ schemaReady: false, records: [] })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ schemaReady: true, records: (data || []).map(normalizeOpportunity) })
}

export async function PATCH(request) {
  const authResponse = await requireOsAuth(request)
  if (authResponse) return authResponse

  const body = await request.json()
  const id = String(body.id || "").trim()
  const action = String(body.action || "").trim()
  const status = String(body.status || "").trim()
  if (!id || (!PRODUCTION_ACTIONS.includes(action) && !REVIEW_STATUSES.includes(status))) {
    return NextResponse.json({ error: "Choose a valid opportunity and review status." }, { status: 400 })
  }

  const { data: currentOpportunity, error: currentOpportunityError } = await supabaseServer
    .from("partner_opportunities")
    .select("id, partner_id, status, reference, customer_name, customer_phone, customer_email, site_location, configuration, afgri_order_reference, internal_project_id, estimated_dispatch_date, estimated_delivery_date, fulfilment_note, production_owner, planned_start_date, planned_completion_date, production_hold_reason, manufacturing_checklist, production_release_status, production_released_at, production_released_by, production_release_revision, production_release_note")
    .eq("id", id)
    .single()
  if (currentOpportunityError || !currentOpportunity) {
    return NextResponse.json({ error: "That partner opportunity could not be found." }, { status: 404 })
  }

  if (action === "update_fulfilment") {
    const fulfilmentStatus = String(body.fulfilmentStatus || "").trim()
    if (!currentOpportunity.internal_project_id || !FULFILMENT_STATUSES.includes(fulfilmentStatus)) {
      return NextResponse.json({ error: "Accept the AFGRI instruction before updating fulfilment." }, { status: 409 })
    }
    if (fulfilmentStatus === "in_production" && currentOpportunity.production_release_status !== "released") {
      return NextResponse.json({ error: "Release the manufacturing pack before moving this order into production." }, { status: 409 })
    }
    const now = new Date().toISOString()
    const fulfilmentUpdates = {
      fulfilment_status: fulfilmentStatus,
      estimated_dispatch_date: String(body.estimatedDispatchDate || "").trim() || null,
      estimated_delivery_date: String(body.estimatedDeliveryDate || "").trim() || null,
      fulfilment_note: String(body.fulfilmentNote || "").trim(),
      fulfilment_updated_at: now,
      updated_at: now,
    }
    const { data: project } = await supabaseServer.from("os_projects").select("record").eq("id", currentOpportunity.internal_project_id).maybeSingle()
    if (project?.record) {
      await supabaseServer.from("os_projects").update({ record: {
        ...project.record,
        fulfilmentStatus,
        estimatedDispatchDate: fulfilmentUpdates.estimated_dispatch_date || "",
        estimatedDeliveryDate: fulfilmentUpdates.estimated_delivery_date || "",
        fulfilmentNote: fulfilmentUpdates.fulfilment_note,
        updatedAt: now,
      } }).eq("id", currentOpportunity.internal_project_id)
    }
    const { data, error } = await supabaseServer.from("partner_opportunities").update(fulfilmentUpdates).eq("id", id)
      .select("*, partner_product_releases(product_code, name, release_version), partner_organizations(key, name), partner_submissions(id, version, review_status, indicative_amount_ex_vat, submitted_at), partner_information_requests(id, request_text, requested_fields, status, due_at, created_at), partner_order_documents(id, document_type, file_name, mime_type, file_size, created_at), partner_handoff_events(id, event_type, actor_scope, summary, detail, created_at)").single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    await supabaseServer.from("partner_handoff_events").insert([{
      partner_id: currentOpportunity.partner_id,
      opportunity_id: id,
      event_type: "fulfilment_updated",
      actor_scope: "smart_steel",
      summary: `Order moved to ${fulfilmentStatus.replaceAll("_", " ")}.`,
      detail: fulfilmentUpdates,
    }])
    return NextResponse.json({ record: normalizeOpportunity(data) })
  }

  if (action === "release_production") {
    if (!currentOpportunity.internal_project_id) {
      return NextResponse.json({ error: "Accept the AFGRI instruction before releasing production." }, { status: 409 })
    }
    const release = Boolean(body.release)
    const checklist = Array.isArray(currentOpportunity.manufacturing_checklist) ? currentOpportunity.manufacturing_checklist : []
    const releaseChecks = ["release", "materials"]
    const incompleteChecks = releaseChecks.filter((id) => !checklist.some((item) => item?.id === id && item?.complete))
    if (release && (!currentOpportunity.production_owner || !currentOpportunity.planned_start_date || !currentOpportunity.planned_completion_date || currentOpportunity.production_hold_reason || incompleteChecks.length)) {
      return NextResponse.json({ error: "Assign an owner, set both planned dates, clear the hold, and complete the scope and material checks before release." }, { status: 409 })
    }
    const now = new Date().toISOString()
    const releaseUpdates = {
      production_release_status: release ? "released" : "revoked",
      production_released_at: release ? now : null,
      production_released_by: release ? String(body.releasedBy || "Smart Steel team").trim().slice(0, 120) : "",
      production_release_revision: release ? String(body.revision || "R1").trim().slice(0, 40) : "",
      production_release_note: String(body.note || "").trim().slice(0, 500),
      updated_at: now,
    }
    const { data, error } = await supabaseServer.from("partner_opportunities").update(releaseUpdates).eq("id", id)
      .select("*, partner_product_releases(product_code, name, release_version), partner_organizations(key, name), partner_submissions(id, version, review_status, indicative_amount_ex_vat, submitted_at), partner_information_requests(id, request_text, requested_fields, status, due_at, created_at), partner_order_documents(id, document_type, file_name, mime_type, file_size, created_at), partner_handoff_events(id, event_type, actor_scope, summary, detail, created_at)").single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    await supabaseServer.from("partner_handoff_events").insert([{
      partner_id: currentOpportunity.partner_id,
      opportunity_id: id,
      event_type: release ? "production_released" : "production_release_revoked",
      actor_scope: "smart_steel",
      summary: release ? `Manufacturing pack ${releaseUpdates.production_release_revision} released for production.` : "Production release revoked.",
      detail: { revision: releaseUpdates.production_release_revision, releasedBy: releaseUpdates.production_released_by, note: releaseUpdates.production_release_note },
    }])
    return NextResponse.json({ record: normalizeOpportunity(data) })
  }

  if (action === "update_production_plan") {
    if (!currentOpportunity.internal_project_id) {
      return NextResponse.json({ error: "Accept the AFGRI instruction before creating a production plan." }, { status: 409 })
    }
    const checklist = Array.isArray(body.manufacturingChecklist)
      ? body.manufacturingChecklist.slice(0, 20).map((item, index) => ({
          id: String(item?.id || `check-${index + 1}`).slice(0, 80),
          label: String(item?.label || "").trim().slice(0, 160),
          complete: Boolean(item?.complete),
        })).filter((item) => item.label)
      : []
    const now = new Date().toISOString()
    const currentChecklist = Array.isArray(currentOpportunity.manufacturing_checklist) ? currentOpportunity.manufacturing_checklist : []
    const checkComplete = (items, id) => items.some((item) => item?.id === id && item?.complete)
    const releaseCriticalChange = currentOpportunity.production_release_status === "released" && (
      String(currentOpportunity.production_owner || "") !== String(body.productionOwner || "").trim().slice(0, 120)
      || String(currentOpportunity.planned_start_date || "") !== String(body.plannedStartDate || "").trim()
      || String(currentOpportunity.planned_completion_date || "") !== String(body.plannedCompletionDate || "").trim()
      || String(currentOpportunity.production_hold_reason || "") !== String(body.productionHoldReason || "").trim().slice(0, 500)
      || checkComplete(currentChecklist, "release") !== checkComplete(checklist, "release")
      || checkComplete(currentChecklist, "materials") !== checkComplete(checklist, "materials")
    )
    const productionUpdates = {
      production_owner: String(body.productionOwner || "").trim().slice(0, 120),
      planned_start_date: String(body.plannedStartDate || "").trim() || null,
      planned_completion_date: String(body.plannedCompletionDate || "").trim() || null,
      production_hold_reason: String(body.productionHoldReason || "").trim().slice(0, 500),
      manufacturing_checklist: checklist,
      production_plan_updated_at: now,
      updated_at: now,
    }
    if (releaseCriticalChange) {
      productionUpdates.production_release_status = "revoked"
      productionUpdates.production_released_at = null
      productionUpdates.production_released_by = ""
      productionUpdates.production_release_note = "Release automatically revoked after a production-critical plan change."
    }
    const { data: project } = await supabaseServer.from("os_projects").select("record").eq("id", currentOpportunity.internal_project_id).maybeSingle()
    if (project?.record) {
      await supabaseServer.from("os_projects").update({ record: {
        ...project.record,
        productionOwner: productionUpdates.production_owner,
        plannedStartDate: productionUpdates.planned_start_date || "",
        plannedCompletionDate: productionUpdates.planned_completion_date || "",
        productionHoldReason: productionUpdates.production_hold_reason,
        manufacturingChecklist: checklist,
        productionPlanUpdatedAt: now,
        updatedAt: now,
      } }).eq("id", currentOpportunity.internal_project_id)
    }
    const { data, error } = await supabaseServer.from("partner_opportunities").update(productionUpdates).eq("id", id)
      .select("*, partner_product_releases(product_code, name, release_version), partner_organizations(key, name), partner_submissions(id, version, review_status, indicative_amount_ex_vat, submitted_at), partner_information_requests(id, request_text, requested_fields, status, due_at, created_at), partner_order_documents(id, document_type, file_name, mime_type, file_size, created_at), partner_handoff_events(id, event_type, actor_scope, summary, detail, created_at)").single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    await supabaseServer.from("partner_handoff_events").insert([{
      partner_id: currentOpportunity.partner_id,
      opportunity_id: id,
      event_type: "production_plan_updated",
      actor_scope: "smart_steel",
      summary: releaseCriticalChange ? "Production plan changed and its release was revoked." : productionUpdates.production_hold_reason ? "Production plan updated with a hold." : "Production plan updated.",
      detail: { owner: productionUpdates.production_owner, plannedStartDate: productionUpdates.planned_start_date, plannedCompletionDate: productionUpdates.planned_completion_date, completedChecks: checklist.filter((item) => item.complete).length, totalChecks: checklist.length, releaseRevoked: releaseCriticalChange },
    }])
    return NextResponse.json({ record: normalizeOpportunity(data) })
  }

  if (status === "changes_requested") {
    const requestText = String(body.informationRequest || "").trim()
    const requestedFields = Array.isArray(body.requestedFields)
      ? body.requestedFields.map((field) => String(field).trim()).filter(Boolean)
      : []
    const dueAt = String(body.informationRequestDueAt || "").trim() || null
    if (!["submitted", "in_review"].includes(currentOpportunity.status)) {
      return NextResponse.json({ error: "Changes can only be requested while the opportunity is under review." }, { status: 409 })
    }
    if (!requestText) {
      return NextResponse.json({ error: "Explain exactly what AFGRI needs to change or provide." }, { status: 400 })
    }

    const { data: latestSubmission } = await supabaseServer
      .from("partner_submissions")
      .select("id")
      .eq("opportunity_id", id)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle()

    const { error: requestError } = await supabaseServer.from("partner_information_requests").insert([{
      partner_id: currentOpportunity.partner_id,
      opportunity_id: id,
      submission_id: latestSubmission?.id || null,
      request_text: requestText,
      requested_fields: requestedFields,
      due_at: dueAt,
    }])
    if (requestError) return NextResponse.json({ error: requestError.message }, { status: 500 })
  }

  const finalQuoteAmountExVat = body.finalQuoteAmountExVat === "" || body.finalQuoteAmountExVat === null
    ? null
    : Number(body.finalQuoteAmountExVat)
  const quoteUrl = String(body.quoteUrl || "").trim()
  if (status === "quoted" && (!Number.isFinite(finalQuoteAmountExVat) || finalQuoteAmountExVat <= 0)) {
    return NextResponse.json({ error: "Add the approved amount before returning this price to AFGRI." }, { status: 400 })
  }
  let currentOrderStatus = "not_ready"
  if (status === "closed") {
    const { data: current, error: currentError } = await supabaseServer
      .from("partner_opportunities")
      .select("partner_order_status")
      .eq("id", id)
      .single()
    if (currentError) return NextResponse.json({ error: currentError.message }, { status: 500 })
    currentOrderStatus = current?.partner_order_status || "not_ready"
    if (currentOrderStatus !== "order_submitted" && currentOrderStatus !== "acknowledged") {
      return NextResponse.json({ error: "Wait for AFGRI to submit its order reference before closing this opportunity." }, { status: 409 })
    }
  }

  const updates = {
    status,
    internal_review_notes: String(body.internalReviewNotes || "").trim(),
    final_quote_amount_ex_vat: finalQuoteAmountExVat,
    quote_url: quoteUrl,
    partner_quote_message: String(body.partnerQuoteMessage || "").trim(),
    updated_at: new Date().toISOString(),
  }
  if (status === "quoted") updates.quoted_at = new Date().toISOString()
  if (status === "quoted") {
    const validUntil = new Date()
    validUntil.setDate(validUntil.getDate() + 14)
    updates.partner_order_status = "ready_for_order"
    updates.ready_for_order_at = new Date().toISOString()
    updates.price_valid_until = validUntil.toISOString().slice(0, 10)
    updates.commercial_response_status = "pending"
    updates.commercial_response_note = ""
    updates.commercial_responded_at = null
    updates.customer_decision = "pending"
    updates.customer_decision_note = ""
    updates.customer_decision_at = null
    updates.afgri_order_reference = currentOpportunity.afgri_order_reference || makeTemporaryOrderReference(currentOpportunity.reference)
  }
  if (status === "closed" && currentOrderStatus === "order_submitted") {
    try {
      updates.internal_project_id = await ensureInternalProject(currentOpportunity)
    } catch (projectError) {
      return NextResponse.json({ error: `The AFGRI order is valid, but its internal project could not be created: ${projectError.message}` }, { status: 500 })
    }
    updates.partner_order_status = "acknowledged"
    updates.handoff_acknowledged_at = new Date().toISOString()
    updates.fulfilment_status = "production_planning"
    updates.fulfilment_updated_at = new Date().toISOString()
  }

  const { data, error } = await supabaseServer
    .from("partner_opportunities")
    .update(updates)
    .eq("id", id)
    .select("*, partner_product_releases(product_code, name, release_version), partner_organizations(key, name), partner_submissions(id, version, review_status, indicative_amount_ex_vat, submitted_at), partner_information_requests(id, request_text, requested_fields, status, due_at, created_at), partner_order_documents(id, document_type, file_name, mime_type, file_size, created_at), partner_handoff_events(id, event_type, actor_scope, summary, detail, created_at)")
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const submissionReviewStatus = status === "quoted" ? "approved" : status === "closed" ? "closed" : status
  await supabaseServer
    .from("partner_submissions")
    .update({ review_status: submissionReviewStatus, reviewed_at: new Date().toISOString() })
    .eq("opportunity_id", id)
    .eq("version", data.partner_submissions?.reduce((maximum, submission) => Math.max(maximum, submission.version), 0) || 0)

  if (["quoted", "closed"].includes(status)) {
    await supabaseServer.from("partner_handoff_events").insert([{
      partner_id: currentOpportunity.partner_id,
      opportunity_id: id,
      event_type: status === "quoted" ? "commercial_record_released" : "handoff_acknowledged",
      actor_scope: "smart_steel",
      summary: status === "quoted" ? "Smart Steel released the approved supplier price and scope to AFGRI." : `Smart Steel acknowledged the AFGRI instruction and opened project ${updates.internal_project_id}.`,
      detail: status === "quoted" ? { amountExVat: finalQuoteAmountExVat } : { projectId: updates.internal_project_id, orderReference: data.afgri_order_reference },
    }])
  }

  return NextResponse.json({ record: normalizeOpportunity(data) })
}
