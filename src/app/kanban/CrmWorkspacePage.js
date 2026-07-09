"use client"

import CrmWorkspace from "./CrmWorkspaceClient"

export default function CrmWorkspacePage({ mode = "legacy" }) {
  return <CrmWorkspace mode={mode} />
}
