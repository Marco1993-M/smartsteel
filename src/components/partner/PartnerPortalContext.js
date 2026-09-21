'use client'
import { createContext, useContext } from 'react'
const PartnerPortalContext = createContext(null)
export function PartnerPortalProvider({ portal, children }) {
  return <PartnerPortalContext.Provider value={portal}>{children}</PartnerPortalContext.Provider>
}
export function usePartnerPortal() {
  const portal = useContext(PartnerPortalContext)
  if (!portal) throw new Error('Partner wrapper is missing.')
  return portal
}
