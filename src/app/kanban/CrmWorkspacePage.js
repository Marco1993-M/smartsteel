"use client"

import CrmWorkspace from "../../components/crm/CrmWorkspace.js"

export default function CrmWorkspacePage({ mode = "legacy" }) {
  return <CrmWorkspace mode={mode} />
}
