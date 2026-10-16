"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { LogOut, UserRound } from "lucide-react"
import { getOsAuthHeaders } from "../../lib/osClientAuth"
import { supabase } from "../../lib/supabase"
export default function OsAccountSettings() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    async function load() {
      const response = await fetch("/api/os/session", { headers: await getOsAuthHeaders(), cache: "no-store" })
      const body = await response.json()
      if (!response.ok) throw new Error(body.error || "Your account could not be loaded.")
      setEmail(body.user.email)
    }
    load().catch((err) => setError(err.message))
  }, [])
  async function signOut() {
    setBusy(true); setError("")
    const { error: signOutError } = await supabase.auth.signOut({ scope: "local" })
    if (signOutError) { setError(signOutError.message); setBusy(false); return }
    router.replace("/login")
  }
  return <div className="mx-auto max-w-3xl p-4 sm:p-8"><section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><UserRound className="text-blue-600" /><h1 className="mt-4 text-2xl font-bold">Your account</h1><p className="mt-2 text-sm leading-6 text-slate-500">Use your own account so memo contributions and decisions are attributed correctly.</p>{email ? <div className="mt-6 rounded-xl bg-slate-50 p-4"><p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Signed in as</p><p className="mt-2 break-all font-semibold">{email}</p></div> : null}{error ? <p role="alert" className="mt-4 text-sm text-rose-700">{error}</p> : null}<button onClick={signOut} disabled={busy || !email} className="mt-6 inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold disabled:opacity-50"><LogOut size={16} />{busy ? "Signing out…" : "Sign out on this device"}</button></section><section className="mt-5 rounded-2xl border border-slate-200 bg-white p-6"><h2 className="font-bold">Access and privacy</h2><p className="mt-2 text-sm leading-7 text-slate-600">Memo membership is managed separately from sign-in. Each team member needs their own invited account. Access to the annual financial plan remains separately controlled.</p></section></div>
}
