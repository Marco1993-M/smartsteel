import WorkspaceSectionNav from "../../../components/os/WorkspaceSectionNav"
import { ATLAS_NAV_ITEMS } from "../../../lib/osProductData"

export default function AtlasWorkspaceLayout({ children }) {
  return (
    <>
      <WorkspaceSectionNav items={ATLAS_NAV_ITEMS} />
      {children}
    </>
  )
}
