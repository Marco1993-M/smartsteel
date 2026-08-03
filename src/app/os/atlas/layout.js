import WorkspaceSectionNav from "../../../components/os/WorkspaceSectionNav"
import AtlasProductContextBar from "../../../components/os/AtlasProductContextBar"
import { ATLAS_NAV_ITEMS } from "../../../lib/osProductData"

export default function AtlasWorkspaceLayout({ children }) {
  return (
    <div className="atlas-brand-os min-h-full">
      <WorkspaceSectionNav items={ATLAS_NAV_ITEMS} variant="atlas" />
      <AtlasProductContextBar />
      {children}
    </div>
  )
}
