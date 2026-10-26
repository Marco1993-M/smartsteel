const SESSION_KEY = "smartsteel.builder-analytics.session-v1"
const JOURNEY_PREFIX = "smartsteel.builder-analytics.journey-v1"
const ENTRY_PREFIX = "smartsteel.builder-analytics.entry-v1"
const JOURNEY_TTL_MS = 4 * 60 * 60 * 1000

export const BUILDER_TYPES = {
  warehouse: "warehouse",
  solarCarport: "solar_carport",
  groundMount: "ground_mount",
}

export const BUILDER_FUNNEL_EVENTS = {
  entryClicked: "builder_entry_clicked",
  viewed: "builder_viewed",
  configurationStarted: "configuration_started",
  pricingDisplayed: "pricing_displayed",
  leadFormViewed: "lead_form_viewed",
  submitStarted: "lead_submit_started",
  submitSucceeded: "lead_submit_succeeded",
  submitFailed: "lead_submit_failed",
  whatsappOpened: "whatsapp_opened",
}

function createId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID()
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`
}

function readJson(storage, key) {
  try { return JSON.parse(storage.getItem(key) || "null") }
  catch { return null }
}

function getSessionId() {
  const existing = window.localStorage.getItem(SESSION_KEY)
  if (existing) return existing
  const id = createId()
  window.localStorage.setItem(SESSION_KEY, id)
  return id
}

function getJourney(builder) {
  const key = `${JOURNEY_PREFIX}.${builder}`
  const current = readJson(window.sessionStorage, key)
  if (current?.id && Date.now() - Number(current.startedAt || 0) < JOURNEY_TTL_MS) return current
  const journey = { id: createId(), startedAt: Date.now() }
  window.sessionStorage.setItem(key, JSON.stringify(journey))
  return journey
}

function getDeviceCategory() {
  if (window.matchMedia("(max-width: 767px)").matches) return "mobile"
  if (window.matchMedia("(max-width: 1023px)").matches) return "tablet"
  return "desktop"
}

function cleanProperties(properties) {
  return Object.fromEntries(Object.entries(properties || {}).filter(([, value]) =>
    value !== undefined && value !== null && ["string", "number", "boolean"].includes(typeof value)
  ))
}

export function trackBuilderFunnelEvent(builder, eventName, properties = {}, options = {}) {
  if (typeof window === "undefined" || !builder || !eventName) return

  const journey = getJourney(builder)
  const onceKey = `${JOURNEY_PREFIX}.sent.${journey.id}.${eventName}`
  if (options.once !== false && window.sessionStorage.getItem(onceKey)) return

  const entry = readJson(window.sessionStorage, `${ENTRY_PREFIX}.${builder}`)
  let referrerPath = ""
  try {
    const referrer = new URL(document.referrer)
    if (referrer.origin === window.location.origin) referrerPath = referrer.pathname
  } catch {}
  const sourcePage = window.location.pathname
  const payload = {
    eventId: createId(),
    sessionId: getSessionId(),
    journeyId: journey.id,
    builder,
    eventName,
    sourcePage,
    entryPage: entry?.sourcePage || referrerPath || sourcePage,
    configurationId: options.configurationId || null,
    deviceCategory: getDeviceCategory(),
    properties: cleanProperties(properties),
  }

  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, {
      builder_type: builder,
      builder_journey_id: journey.id,
      source_page: sourcePage,
      entry_page: payload.entryPage,
      ...payload.properties,
    })
  }

  window.sessionStorage.setItem(onceKey, "1")
  fetch("/api/analytics/builder-events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => {})
}

export function trackBuilderEntry(builder, linkText = "") {
  if (typeof window === "undefined" || !builder) return
  window.sessionStorage.removeItem(`${JOURNEY_PREFIX}.${builder}`)
  window.sessionStorage.setItem(`${ENTRY_PREFIX}.${builder}`, JSON.stringify({
    sourcePage: window.location.pathname,
    recordedAt: Date.now(),
  }))
  trackBuilderFunnelEvent(builder, BUILDER_FUNNEL_EVENTS.entryClicked, { link_text: linkText }, { once: false })
}
