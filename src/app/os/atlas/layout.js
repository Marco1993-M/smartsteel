import AtlasWorkspaceNavigation from '../../../components/os/AtlasWorkspaceNavigation'
export default function AtlasWorkspaceLayout({children}) {
  return <div className="atlas-brand-os min-h-full"><AtlasWorkspaceNavigation />{children}</div>
}
