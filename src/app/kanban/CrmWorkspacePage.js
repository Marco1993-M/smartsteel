"use client"

import CrmWorkspace from "../../components/crm/CrmWorkspace"

export default function CrmWorkspacePage({ mode = "legacy" }) {
  return <CrmWorkspace mode={mode} />
}
