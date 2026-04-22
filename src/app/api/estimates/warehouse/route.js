import { NextResponse } from "next/server"
import { calculateWarehouseEstimate } from "../../../../lib/estimates/warehouseEstimate"

export async function POST(request) {
  try {
    const payload = await request.json()
    const estimate = calculateWarehouseEstimate(payload)
    return NextResponse.json({ estimate })
  } catch (error) {
    return NextResponse.json(
      { error: error?.message || "Could not calculate warehouse estimate." },
      { status: 400 }
    )
  }
}
