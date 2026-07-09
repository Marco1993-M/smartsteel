// lib/supabaseAuth.js
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "./supabase"

/**
 * Custom hook to get the authenticated Supabase user.
 * Redirects to /login if not logged in.
 */
export function useSupabaseAuth(redirectPath = "/login") {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.replace(redirectPath)
      } else {
        setUser(session.user)
      }
      setLoading(false)
    }

    fetchUser()

    // Listen for auth changes (optional, useful for logout/login)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!session) {
          setUser(null)
          router.replace(redirectPath)
        } else {
          setUser(session.user)
        }
      }
    )

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [redirectPath, router])

  return { user, loading }
}
