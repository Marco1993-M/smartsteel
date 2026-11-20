"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { partnerSupabase } from "../../../lib/partnerSupabase"
import { getPartnerAuthHeaders } from "../../../lib/partnerClientAuth"
import { usePartnerPortal } from "../../../components/partner/PartnerPortalContext"

export default function PartnerSetupPage() {
  const portal = usePartnerPortal()
  const router = useRouter()
  const [verifiedUser, setVerifiedUser] = useState(null)
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)

  async function submit(event) {
    event.preventDefault()
    const fields = new FormData(event.currentTarget)
    const password = String(fields.get("password"))
    if (password !== fields.get("confirmation")) {
      setError("The passwords don’t match.")
      return
    }

    setBusy(true)
    setError("")
    try {
      let userId = verifiedUser
      if (!userId) {
        const link = new URLSearchParams(window.location.hash.slice(1))
        const tokenHash = link.get("token_hash")
        const type = link.get("type")
        if (!tokenHash || !["invite", "recovery"].includes(type)) throw new Error("Open your setup link to continue.")
        const { data, error: verificationError } = await partnerSupabase.auth.verifyOtp({ token_hash: tokenHash, type })
        if (verificationError || !data.session || !data.user) throw new Error("This link is invalid or has expired. Ask your portal administrator for a new one.")
        window.history.replaceState(null, "", window.location.pathname)
        userId = data.user.id
      }

      const response = await fetch("/api/partner/session", { headers: await getPartnerAuthHeaders(), cache: "no-store" })
      const access = await response.json()
      if (!response.ok || access.user?.id !== userId) {
        await partnerSupabase.auth.signOut({ scope: "local" })
        setVerifiedUser(null)
        throw new Error("This account does not have active access to this portal. Contact your portal administrator.")
      }
      setVerifiedUser(userId)
      const { error: passwordError } = await partnerSupabase.auth.updateUser({ password })
      if (passwordError) throw new Error(passwordError.message)
      router.replace("/partner")
    } catch (failure) {
      setError(failure.message || "Password setup failed. Try again.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#eef4f8] px-4 py-8">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <p className="text-sm font-semibold text-[#0043f3]">{portal.name} Sales Portal</p>
        <h1 className="mt-2 text-3xl font-bold text-[#001d2e]">Set your password</h1>
        <p className="mt-2 text-sm text-slate-600">Use at least 12 characters.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          {[["password", "New password"], ["confirmation", "Confirm password"]].map(([name, label]) => (
            <label key={name} className="block text-sm font-semibold text-slate-800">
              {label}
              <input name={name} type="password" autoComplete="new-password" minLength={12} required
                className="mt-1 block min-h-11 w-full rounded-lg border border-slate-300 px-3" />
            </label>
          ))}
          {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
          <button disabled={busy} className="min-h-11 w-full rounded-lg bg-[#0043f3] px-4 font-semibold text-white disabled:opacity-60">
            {busy ? "Saving…" : "Save password and continue"}
          </button>
        </form>
        <Link href="/partner/login" className="mt-5 inline-block text-sm font-semibold text-[#0043f3]">Back to sign in</Link>
      </section>
    </main>
  )
}
