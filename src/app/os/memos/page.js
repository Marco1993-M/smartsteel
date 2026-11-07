import MemoWorkspace from "../../../components/os/MemoWorkspace"
export default async function MemosPage({ searchParams }) {
  const params = await searchParams
  const id = params.view === "library" ? "" : String(params.id || "new")
  return <MemoWorkspace key={id} initialId={id} />
}
