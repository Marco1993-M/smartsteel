import OsSectionPlaceholder from "../../../components/os/OsSectionPlaceholder"
import { OS_SECTIONS } from "../../../lib/osNavigation"

const partnersSection = OS_SECTIONS.find((section) => section.key === "partners")

export default function PartnersOsPage() {
  return (
    <OsSectionPlaceholder
      title="Partner channel workspace"
      description="This workspace is for strategic accounts, installers, dealers, suppliers, and partner-specific processes so channel relationships can be managed with the same clarity as direct sales."
      items={partnersSection?.items || []}
      nextStep="Once CRM and product system foundations are stable, bring installers, suppliers, and dealer workflows into this section to support partner-led growth."
    />
  )
}
