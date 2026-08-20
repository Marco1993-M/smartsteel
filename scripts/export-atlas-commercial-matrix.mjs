import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { calculateAtlasCommercialPrice } from "../src/lib/atlasCommercialPricing.js"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const output = path.join(root, "tmp", "atlas-commercial-matrix.json")
const widths = [6, 8, 10, 12]
const lengths = [8, 12, 16, 20]

const finishes = ["Mild", "ZAM", "Galv"]
const matrix = lengths.flatMap((length) => widths.map((width) => {
  const wallHeight = width >= 10 ? 4.5 : 3
  const prices = Object.fromEntries(finishes.map((finish) => {
    const result = calculateAtlasCommercialPrice({ width, length, wallHeight, finish })
    return [finish, {
      indicativePrice: result.priceExclVat,
      partnerReturn: result.partnerReturn,
      rawMaterialCost: result.rawMaterialCost,
    }]
  }))
  const basis = calculateAtlasCommercialPrice({ width, length, wallHeight, finish: "ZAM" })

  return {
    width,
    length,
    wallHeight,
    steelMassKg: basis.steelMassKg,
    connectionCost: basis.connectionCost,
    prices,
  }
}))

fs.mkdirSync(path.dirname(output), { recursive: true })
fs.writeFileSync(output, JSON.stringify({ generatedAt: new Date().toISOString(), matrix }, null, 2))
console.log(output)
