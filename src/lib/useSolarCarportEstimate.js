import { useEffect, useState } from 'react'
import { getOsAuthHeaders } from './osClientAuth'

export function useSolarCarportEstimate(input, internal = false) {
  const key = JSON.stringify(input)
  const [state, setState] = useState({ key: '', estimate: null, error: '' })
  useEffect(() => {
    if (input.productType !== 'Solar carport') return
    let active = true
    let controller
    async function refresh() {
      controller?.abort()
      controller = new AbortController()
      try {
        const headers = internal ? await getOsAuthHeaders() : {}
        const response = await fetch('/api/estimates/solar-carport', { method: 'POST', cache: 'no-store', signal: controller.signal, headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ input: JSON.parse(key), internal }) })
        const payload = await response.json()
        if (!response.ok) throw new Error(payload.error || 'Pricing unavailable')
        if (active) setState({ key, estimate: payload.estimate, error: '' })
      } catch (error) {
        if (active && error.name !== 'AbortError') setState({ key, estimate: null, error: error.message })
      }
    }
    refresh()
    const timer = setInterval(refresh, 30000)
    window.addEventListener('focus', refresh)
    return () => { active = false; controller?.abort(); clearInterval(timer); window.removeEventListener('focus', refresh) }
  }, [key, internal])
  return state.key === key ? state : { estimate: null, error: '' }
}
