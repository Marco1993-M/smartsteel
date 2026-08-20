"use client"

import Image from "next/image"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { partnerSupabase } from "../../../lib/partnerSupabase"
import { getPartnerAuthHeaders } from "../../../lib/partnerClientAuth"

export default function PartnerLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError("")
    setSubmitting(true)
    const { error: signInError } = await partnerSupabase.auth.signInWithPassword({ email, password })
    if (signInError) {
      setError("We could not sign you in. Check your email and password.")
      setSubmitting(false)
      return
    }

    const response = await fetch("/api/partner/session", { headers: await getPartnerAuthHeaders() })
    if (!response.ok) {
      await partnerSupabase.auth.signOut()
      const payload = await response.json().catch(() => ({}))
      setError(payload.error || "This account does not have partner portal access.")
      setSubmitting(false)
      return
    }
    router.replace("/partner")
  }

  return (
    <main className="min-h-screen bg-[#eef4f8] px-4 py-8 sm:px-6 lg:grid lg:grid-cols-[1.1fr_0.9fr] lg:p-0">
      <section className="hidden min-h-screen overflow-hidden bg-gradient-to-br from-[#001d2e] via-[#063783] to-[#0043f3] p-14 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-5">
          <Image src="/atlas/atlas-logo-horizontal-light.png" alt="Atlas by Smart Steel" width={230} height={70} className="h-14 w-auto object-contain" priority />
          <span className="h-10 w-px bg-white/20" />
          <Image src="/afgri-logo-white-cropped.png" alt="AFGRI" width={150} height={58} className="h-11 w-auto object-contain" priority />
        </div>
        <div className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#c1d9e5]">AFGRI Sales Portal</p>
          <h1 className="mt-5 text-6xl font-black leading-[0.98] tracking-[-0.055em]">From customer question to reviewed quote.</h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-white/75">Approved Atlas products, clear indicative pricing and a direct handoff to Smart Steel in one place.</p>
        </div>
        <p className="text-sm text-white/55">Atlas System, developed by Smart Steel.</p>
      </section>

      <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-lg items-center lg:min-h-screen lg:px-12">
        <div className="w-full rounded-[2rem] border border-slate-200 bg-white p-7 shadow-xl shadow-slate-900/5 sm:p-10">
          <div className="flex w-full items-center justify-between gap-4 overflow-hidden lg:hidden">
            <Image src="/atlas/atlas-logo-horizontal-dark.png" alt="Atlas by Smart Steel" width={180} height={55} className="h-auto min-w-0 max-w-[68%] object-contain object-left" priority />
            <Image src="/afgri-logo-colour-cropped.png" alt="AFGRI" width={105} height={40} className="h-auto w-[24%] max-w-[5.5rem] shrink-0 object-contain object-right" priority />
          </div>
          <p className="mt-10 text-xs font-bold uppercase tracking-[0.22em] text-[#0043f3] lg:mt-0">Partner access</p>
          <h2 className="mt-3 text-4xl font-black tracking-[-0.045em] text-[#001d2e]">Welcome back</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">Sign in with your approved AFGRI portal account.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <label className="block text-sm font-bold text-slate-800">Email
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-4 text-base outline-none transition focus:border-[#0043f3] focus:ring-4 focus:ring-blue-100" />
            </label>
            <label className="block text-sm font-bold text-slate-800">Password
              <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password" className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-4 text-base outline-none transition focus:border-[#0043f3] focus:ring-4 focus:ring-blue-100" />
            </label>
            {error ? <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}
            <button type="submit" disabled={submitting} className="min-h-13 w-full rounded-xl bg-[#0043f3] px-5 text-sm font-black text-white transition hover:bg-[#0036c4] disabled:cursor-wait disabled:opacity-60">
              {submitting ? "Checking access..." : "Sign in"}
            </button>
          </form>
          <p className="mt-6 text-center text-xs leading-5 text-slate-400">Need access? Ask your AFGRI portal administrator.</p>
        </div>
      </section>
    </main>
  )
}
