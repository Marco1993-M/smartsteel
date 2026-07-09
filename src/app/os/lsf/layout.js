import WorkspaceSectionNav from "../../../components/os/WorkspaceSectionNav"
import { LSF_NAV_ITEMS } from "../../../lib/osProductData"

export default function LsfWorkspaceLayout({ children }) {
  return (
    <>
      <WorkspaceSectionNav items={LSF_NAV_ITEMS} />
      {children}
    </>
  )
}
