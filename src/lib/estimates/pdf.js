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

function findLocalBrowserPath() {
  return LOCAL_BROWSER_PATHS.find((candidate) => {
    try {
      return fs.existsSync(candidate)
    } catch {
      return false
    }
  })
}

export async function launchEstimatePdfBrowser() {
  const isServerless =
    Boolean(process.env.VERCEL) ||
    Boolean(process.env.AWS_REGION) ||
    Boolean(process.env.AWS_EXECUTION_ENV)

  if (isServerless) {
    const executablePath = await chromium.executablePath()

    return puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath,
      headless: true,
    })
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
    defaultViewport: {
      width: 1440,
      height: 2200,
      deviceScaleFactor: 1,
    },
  })
}
