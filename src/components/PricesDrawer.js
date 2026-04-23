"use client"

import { useState, useEffect } from "react"

export default function PricesDrawer({ onClose }) {
  const [width, setWidth] = useState(8)
  const [length, setLength] = useState(2.5)
  const [result, setResult] = useState(null)

  const [openCalculator, setOpenCalculator] = useState(true)
  const [openShedPricing, setOpenShedPricing] = useState(false)
  const [openTemplates, setOpenTemplates] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState("Outreach email")

  const copyTemplateToClipboard = () => {
  navigator.clipboard.writeText(templateTexts[selectedTemplate])
    .then(() => alert("Template copied to clipboard!"))
    .catch((err) => alert("Failed to copy: " + err))
}

  const templateTexts = {
  "Outreach email": "Hi {Name},\nWe wanted to reach out to introduce our steel solutions...",
  "Estimate email": `Hi {Name},
The demand for lightweight steel warehouses is growing rapidly in South Africa. Companies like ATKV Resorts, one of our valued clients, are choosing steel for its speed, durability, and cost efficiency.
Attached is your estimate for a 15m × 8m warehouse structure. This includes all steelwork, brackets & fasteners and IBR Sheeting. If you would like to include delivery and installation too, please let me know!
Our lightweight steel system is designed to be quick and easy to construct, low-maintenance, and future-proof, giving you a space that works as hard as you do.
Please find the estimate attached for your review. If you have any questions or want to discuss adjustments, feel free to reach out, I’m happy to help.
Best regards,

Marco Gerritsen
Smart Steel 
Build Better

+27 82 846 4555
info@smartsteel.co.za
www.smartsteel.co.za
P.S. I’ve also attached a short PDF highlighting the advantages of choosing lightweight steel warehouses—it’s a quick read and shows why so many businesses are making the switch.`,
  "Follow Up Email 1": "Hi {Name},\nJust following up on our previous message...",
  "Follow Up Email 2": "Hi {Name},\nChecking in again regarding your warehouse estimate..."
}


  const calculateWarehousePrice = (width, length) => {
    if (![8, 10, 12].includes(width)) {
      return { error: "Width must be 8, 10, or 12 meters" }
    }
    if (length < 2.5 || (length * 10) % 25 !== 0) {
      return { error: "Length must be a multiple of 2.5m and at least 2.5" }
    }

    const bayLength = 2.5
    const totalBaysExact = length / bayLength
    const fullBays = Math.floor(totalBaysExact)
    const halfBay = (totalBaysExact - fullBays) >= 0.5

    let columns = fullBays * 2 + 2
    if (halfBay) columns += 2

    const trusses = columns
    const brackets = Math.floor(columns / 2)

    let xBracingCount = 1
    if (fullBays > 1) xBracingCount += Math.floor((fullBays - 1) / 6)

    let halfBaysTotal = fullBays * 2
    if (halfBay) halfBaysTotal += 1
    const screws = halfBaysTotal * 160

    const totalTopHatLength = length * 10
    const topHatSections = Math.ceil(totalTopHatLength / 5.2)
    const totalTopHatLengthToPurchase = topHatSections * 5.2

    const pricePerColumn = 1400
    let pricePerTruss = width === 8 ? 5901.92 / 4 : width === 10 ? 7203.36 / 4 : 9191.68 / 4
    const pricePerBracketSet = 914
    const pricePerXBracing = 1200
    const pricePerScrew = 0.8
    const pricePerTopHatMeter = 56

    const totalColumnsPrice = columns * pricePerColumn
    const totalTrussesPrice = trusses * pricePerTruss
    const totalBracketsPrice = brackets * pricePerBracketSet
    const totalXBracingPrice = xBracingCount * pricePerXBracing
    const totalScrewsPrice = screws * pricePerScrew
    const totalTopHatsPrice = totalTopHatLengthToPurchase * pricePerTopHatMeter

    const subtotal = totalColumnsPrice + totalTrussesPrice + totalBracketsPrice +
      totalXBracingPrice + totalScrewsPrice + totalTopHatsPrice

    const markup = 1.25
    const totalPrice = subtotal * markup

    return {
      columns,
      trusses,
      brackets,
      xBracingCount,
      screws,
      topHatSections,
      subtotal,
      totalPrice
    }
  }

  useEffect(() => {
    const res = calculateWarehousePrice(width, length)
    if (!res.error) setResult(res)
  }, [width, length])

  const handleLengthChange = (e) => {
    let value = parseFloat(e.target.value)
    if (isNaN(value)) value = 2.5
    value = Math.round(value / 2.5) * 2.5
    if (value < 2.5) value = 2.5
    setLength(value)
  }

  const sectionHeaderStyle =
    "flex justify-between items-center cursor-pointer bg-gray-100 px-2 py-1 rounded"

  return (
    <div className="fixed inset-0 flex justify-end z-50">
      {/* Background overlay */}
      <div className="fixed inset-0 bg-black/30" onClick={onClose}></div>

      {/* Drawer */}
      <div className="relative h-full w-screen max-w-full overflow-auto bg-white p-4 shadow-lg sm:w-[480px] sm:max-w-[480px] sm:p-6">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
          onClick={onClose}
        >
          ✕
        </button>

        <h2 className="mb-4 pr-8 text-xl font-bold">Prices & Templates</h2>

        <div className="space-y-6">
          {/* Warehouse Calculator Accordion */}
          <div>
            <div
              className={sectionHeaderStyle}
              onClick={() => setOpenCalculator(!openCalculator)}
            >
              <span className="font-semibold">Warehouse Price Calculator</span>
              <span>{openCalculator ? "▲" : "▼"}</span>
            </div>
            {openCalculator && (
              <div className="mt-2 space-y-2">
                <label className="block text-sm font-medium">Width (m)</label>
                <select
                  className="border p-2 rounded w-full"
                  value={width}
                  onChange={(e) => setWidth(parseInt(e.target.value))}
                >
                  <option value={8}>8</option>
                  <option value={10}>10</option>
                  <option value={12}>12</option>
                </select>

                <label className="block text-sm font-medium mt-2">Length (m)</label>
                <input
                  type="number"
                  step="2.5"
                  min="2.5"
                  className="border p-2 rounded w-full"
                  value={length}
                  onChange={handleLengthChange}
                />

                {result && (
                  <table className="mt-4 w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-1 px-2">Component</th>
                        <th className="text-right py-1 px-2">Quantity / Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-1 px-2">Total Price (with markup)</td>
                        <td className="py-1 px-2 text-right font-bold">
                          R{result.totalPrice.toFixed(2)}
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-1 px-2">Columns</td>
                        <td className="py-1 px-2 text-right">{result.columns}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-1 px-2">Trusses</td>
                        <td className="py-1 px-2 text-right">{result.trusses}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-1 px-2">Brackets</td>
                        <td className="py-1 px-2 text-right">{result.brackets}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-1 px-2">X-Bracing</td>
                        <td className="py-1 px-2 text-right">{result.xBracingCount}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-1 px-2">Screws</td>
                        <td className="py-1 px-2 text-right">{result.screws}</td>
                      </tr>
                      <tr>
                        <td className="py-1 px-2">Top Hat Sections</td>
                        <td className="py-1 px-2 text-right">{result.topHatSections}</td>
                      </tr>
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>

          {/* Shed Pricing Accordion */}
          <div>
            <div
              className={sectionHeaderStyle}
              onClick={() => setOpenShedPricing(!openShedPricing)}
            >
              <span className="font-semibold">Smart Steel Shed Pricing</span>
              <span>{openShedPricing ? "▲" : "▼"}</span>
            </div>
            {openShedPricing && (
              <div className="mt-2 text-sm overflow-x-auto">
                {[
                  {
                    width: 8,
                    components: [
                      { name: "Columns", qty: "4 x 3000mm", price: "R1400 each" },
                      { name: "Trusses", qty: "4 x 4141mm", price: "R344.88/m" },
                      { name: "Top Hats", qty: "5200mm", price: "R56/m" },
                      { name: "Post Brackets", qty: "4", price: "R155 each" },
                      { name: "Ridge Brackets", qty: "4", price: "R155 each" },
                      { name: "Screws", qty: "320 per half bay", price: "R0.60 each" },
                    ],
                  },
                  {
                    width: 10,
                    components: [
                      { name: "Columns", qty: "4 x 3000mm", price: "R1400 each" },
                      { name: "Trusses", qty: "4 x 5176mm", price: "R344.88/m" },
                      { name: "Top Hats", qty: "5200mm", price: "R56/m" },
                      { name: "Post Brackets", qty: "4", price: "R155 each" },
                      { name: "Ridge Brackets", qty: "4", price: "R155 each" },
                      { name: "Screws", qty: "320 per half bay", price: "R0.60 each" },
                    ],
                  },
                  {
                    width: 12,
                    components: [
                      { name: "Columns", qty: "4 x 3000mm", price: "R1400 each" },
                      { name: "Trusses", qty: "4 x 6212mm", price: "R344.88/m" },
                      { name: "Top Hats", qty: "5200mm", price: "R56/m" },
                      { name: "Post Brackets", qty: "4", price: "R155 each" },
                      { name: "Ridge Brackets", qty: "4", price: "R155 each" },
                      { name: "Screws", qty: "320 per half bay", price: "R0.60 each" },
                    ],
                  },
                ].map((bay) => (
                  <div key={bay.width} className="mb-4">
                    <p className="font-semibold mb-2">{bay.width}m Wide Bay</p>
                    <table className="w-full border border-gray-300 text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="border px-2 py-1 text-left">Component</th>
                          <th className="border px-2 py-1 text-left">Quantity</th>
                          <th className="border px-2 py-1 text-left">Unit Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bay.components.map((comp, idx) => (
                          <tr key={idx} className="border-t">
                            <td className="px-2 py-1">{comp.name}</td>
                            <td className="px-2 py-1">{comp.qty}</td>
                            <td className="px-2 py-1">{comp.price}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}

                {/* Sheeting */}
                <div>
                  <p className="font-semibold mb-1">Sheeting</p>
                  <table className="w-full border border-gray-300 text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border px-2 py-1 text-left">Type</th>
                        <th className="border px-2 py-1 text-left">Supply Price</th>
                        <th className="border px-2 py-1 text-left">Installed Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t">
                        <td className="px-2 py-1">IBR</td>
                        <td className="px-2 py-1">R225/sqm</td>
                        <td className="px-2 py-1">R450/sqm</td>
                      </tr>
                      <tr className="border-t">
                        <td className="px-2 py-1">Chromadek</td>
                        <td className="px-2 py-1">R350/sqm</td>
                        <td className="px-2 py-1">R450/sqm</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

{/* Templates Accordion */}
<div>
  <div
    className={sectionHeaderStyle}
    onClick={() => setOpenTemplates(!openTemplates)}
  >
    <span className="font-semibold">Templates</span>
    <span>{openTemplates ? "▲" : "▼"}</span>
  </div>

  {openTemplates && (
    <div className="mt-2 space-y-2">
      <label className="block text-sm font-medium">Select a Template</label>
      <select
        className="border p-2 rounded w-full"
        value={selectedTemplate}
        onChange={(e) => setSelectedTemplate(e.target.value)}
      >
        {Object.keys(templateTexts).map((key) => (
          <option key={key} value={key}>{key}</option>
        ))}
      </select>

      <div className="mt-2 text-gray-700 text-sm">
        <p className="font-medium mb-1">Preview:</p>
        <div className="border p-2 rounded max-h-60 overflow-auto whitespace-pre-wrap bg-gray-50">
          {templateTexts[selectedTemplate]}
        </div>

        <button
          className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          onClick={() => {
            navigator.clipboard.writeText(templateTexts[selectedTemplate])
              .then(() => alert("Template copied to clipboard!"))
              .catch((err) => alert("Failed to copy: " + err))
          }}
        >
          Copy Template
        </button>
      </div>
    </div>
  )}
</div>

        </div>
      </div>
    </div>
  )
}
