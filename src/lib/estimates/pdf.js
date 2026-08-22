import fs from "node:fs"
import chromium from "@sparticuz/chromium"
import puppeteer from "puppeteer-core"

const LOCAL_BROWSER_PATHS = [
  process.env.CHROME_EXECUTABLE_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium-browser",
  "/usr/bin/chromium",
].filter(Boolean)

const PDF_PAGE_VIEWPORT = {
  width: 1440,
  height: 2200,
  deviceScaleFactor: 1,
}

function getPdfBrowserStore() {
  if (!globalThis.__SMARTSTEEL_PDF_BROWSER_STORE__) {
    globalThis.__SMARTSTEEL_PDF_BROWSER_STORE__ = {
      browserPromise: null,
    }
  }

  return globalThis.__SMARTSTEEL_PDF_BROWSER_STORE__
}

function findLocalBrowserPath() {
  return LOCAL_BROWSER_PATHS.find((candidate) => {
    try {
      return fs.existsSync(candidate)
    } catch {
      return false
    }
  })
}

async function launchServerlessBrowser() {
  const executablePath = await chromium.executablePath()
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath,
    headless: true,
  })

  browser.on("disconnected", () => {
    const store = getPdfBrowserStore()
    store.browserPromise = null
  })

  return browser
}

export async function launchEstimatePdfBrowser() {
  const isServerless =
    Boolean(process.env.VERCEL) ||
    Boolean(process.env.AWS_REGION) ||
    Boolean(process.env.AWS_EXECUTION_ENV)

  if (isServerless) {
    const store = getPdfBrowserStore()

    if (!store.browserPromise) {
      store.browserPromise = launchServerlessBrowser().catch((error) => {
        store.browserPromise = null
        throw error
      })
    }

    const browser = await store.browserPromise

    if (!browser?.connected) {
      store.browserPromise = launchServerlessBrowser().catch((error) => {
        store.browserPromise = null
        throw error
      })
      return store.browserPromise
    }

    return browser
  }

  const executablePath = findLocalBrowserPath()

  if (!executablePath) {
    throw new Error(
      "No local Chrome/Chromium executable was found. Set CHROME_EXECUTABLE_PATH to continue."
    )
  }

  return puppeteer.launch({
    executablePath,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    defaultViewport: PDF_PAGE_VIEWPORT,
  })
}

export async function renderDocumentPdf({ browser, url, readySelector }) {
  const page = await browser.newPage()

  try {
    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    })

    await page.emulateMediaType("print")
    await page.waitForSelector(readySelector, { timeout: 15000 })
    await page.evaluate(async () => {
      if (document.fonts?.ready) {
        await document.fonts.ready
      }
    })

    return await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: "0",
        right: "0",
        bottom: "0",
        left: "0",
      },
    })
  } finally {
    await page.close().catch(() => {})
  }
}

export async function renderHtmlPdf({ browser, html, landscape = false }) {
  const page = await browser.newPage()

  try {
    await page.setContent(html, { waitUntil: "domcontentloaded", timeout: 30000 })
    await page.emulateMediaType("print")
    await page.evaluate(async () => {
      if (document.fonts?.ready) await document.fonts.ready
    })

    return await page.pdf({
      format: "A4",
      landscape,
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    })
  } finally {
    await page.close().catch(() => {})
  }
}
