export function openProtectedPdfWindow(title = "Preparing document") {
  const previewWindow = window.open("", "_blank")
  if (!previewWindow) return null

  previewWindow.document.title = title
  previewWindow.document.body.innerHTML = `
    <main style="min-height:100vh;display:grid;place-items:center;margin:0;background:#eef4f8;font-family:Arial,sans-serif;color:#001d2e">
      <div style="text-align:center;padding:24px">
        <div style="width:32px;height:32px;margin:0 auto 16px;border:3px solid #c1d9e5;border-top-color:#0043f3;border-radius:999px;animation:spin .8s linear infinite"></div>
        <strong>${title}</strong>
        <p style="margin:8px 0 0;color:#64748b;font-size:14px">Please keep this window open.</p>
      </div>
      <style>@keyframes spin{to{transform:rotate(360deg)}}</style>
    </main>`
  return previewWindow
}

export function showProtectedPdf(previewWindow, blob) {
  const url = URL.createObjectURL(blob)
  if (previewWindow && !previewWindow.closed) {
    previewWindow.location.replace(url)
  } else {
    window.location.assign(url)
  }
  window.setTimeout(() => URL.revokeObjectURL(url), 120000)
}

export function closeProtectedPdfWindow(previewWindow) {
  if (previewWindow && !previewWindow.closed) previewWindow.close()
}
