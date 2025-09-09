import { supabase } from "../../../lib/supabase"

export async function POST(req) {
  try {
    const body = await req.json()
    const { data, error } = await supabase.from("leads").insert([body]).select()

    if (error) {
      console.error("Supabase insert error:", error)
      return new Response(JSON.stringify({ error: error.message }), { status: 400 })
    }

    return new Response(JSON.stringify({ lead: data[0] }), { status: 200 })
  } catch (err) {
    console.error("API route error:", err)
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
}
