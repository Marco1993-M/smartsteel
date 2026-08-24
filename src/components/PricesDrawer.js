"use client"

import { useMemo, useState } from "react"
import { ATLAS_LENGTH_OPTIONS } from "../lib/atlasConfiguration"
import {
  ATLAS_WAREHOUSE_STEEL_FINISH_OPTIONS,
  ATLAS_WAREHOUSE_WIDTH_OPTIONS,
  calculateAtlasWarehouseEstimate,
} from "../lib/estimates/atlasWarehouseEstimate"

function formatCurrency(value) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0)
}

export default function PricesDrawer({ onClose }) {
  const [width, setWidth] = useState(8)
  const [length, setLength] = useState(20)
  const [wallHeight, setWallHeight] = useState(3)
  const [steelFinish, setSteelFinish] = useState("ZAM")

  const [openCalculator, setOpenCalculator] = useState(true)
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


  const result = useMemo(() => calculateAtlasWarehouseEstimate({
    width,
    length,
    wallHeight,
    steelFinish,
    gableMode: "structure_only",
    quantity: 1,
  }), [length, steelFinish, wallHeight, width])

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
              <span className="font-semibold">Atlas Warehouse Price Guide</span>
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
                  {ATLAS_WAREHOUSE_WIDTH_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>

                <label className="block text-sm font-medium mt-2">Length (m)</label>
                <select
                  className="border p-2 rounded w-full"
                  value={length}
                  onChange={(event) => setLength(Number(event.target.value))}
                >
                  {ATLAS_LENGTH_OPTIONS.map((option) => <option key={option} value={option}>{option}m · {option / 4} bays</option>)}
                </select>

                <div className="grid grid-cols-2 gap-2">
                  <label className="block text-sm font-medium">Eave height
                    <select className="mt-1 w-full rounded border p-2" value={wallHeight} onChange={(event) => setWallHeight(Number(event.target.value))}>
                      {[3, 4, 4.5, 5].map((option) => <option key={option} value={option}>{option}m</option>)}
                    </select>
                  </label>
                  <label className="block text-sm font-medium">Steel finish
                    <select className="mt-1 w-full rounded border p-2" value={steelFinish} onChange={(event) => setSteelFinish(event.target.value)}>
                      {ATLAS_WAREHOUSE_STEEL_FINISH_OPTIONS.map((option) => <option key={option}>{option}</option>)}
                    </select>
                  </label>
                </div>

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
                        <td className="py-1 px-2">Structure guide excl. VAT</td>
                        <td className="py-1 px-2 text-right font-bold">
                          {formatCurrency(result.pricing.estimatedTotal)}
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-1 px-2">Atlas SKU</td>
                        <td className="py-1 px-2 text-right font-semibold">{result.meta.sku}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-1 px-2">Atlas family</td>
                        <td className="py-1 px-2 text-right">{result.meta.productCode}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-1 px-2">Portal frames</td>
                        <td className="py-1 px-2 text-right">{result.dimensions.portals}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-1 px-2">4m bays</td>
                        <td className="py-1 px-2 text-right">{result.dimensions.bays}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-1 px-2">Structure steel</td>
                        <td className="py-1 px-2 text-right">{Math.round(result.materials.totalSteelKg).toLocaleString()}kg</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-1 px-2">Pricing release</td>
                        <td className="py-1 px-2 text-right text-xs">{result.meta.pricingRelease}</td>
                      </tr>
                    </tbody>
                  </table>
                )}
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
