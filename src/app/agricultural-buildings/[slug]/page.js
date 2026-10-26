import { notFound } from "next/navigation"
import AgriculturalStructurePage from "../../../components/agriculture/AgriculturalStructurePage"
import { buildAgriculturalMetadata, getAgriculturalStructure, getAgriculturalStructureSlugs } from "../agriculturalStructureData"

export function generateStaticParams() {
  return getAgriculturalStructureSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const content = getAgriculturalStructure(slug)
  return content ? buildAgriculturalMetadata(content) : {}
}

export default async function AgriculturalStructureRoute({ params }) {
  const { slug } = await params
  const content = getAgriculturalStructure(slug)
  if (!content) notFound()
  return <AgriculturalStructurePage content={content} />
}
