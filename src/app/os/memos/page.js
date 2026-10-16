import MemoWorkspace from "../../../components/os/MemoWorkspace"
export default async function MemosPage({ searchParams }) {
  const params = await searchParams
  return <MemoWorkspace key={String(params.id || "")} initialId={String(params.id || "")} />
}
