"use client"

import InvoiceDocumentLayout from "./InvoiceDocumentLayout"

export default function InvoiceDocumentViewport({ documentModel }) {
  return (
    <div className="estimate-preview-shell">
      <div className="estimate-preview-scroll">
        <div className="estimate-preview-stage">
          <InvoiceDocumentLayout documentModel={documentModel} />
        </div>
      </div>
    </div>
  )
}
