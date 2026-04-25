"use client"

import EstimateDocumentLayout from "./EstimateDocumentLayout"

export default function EstimateDocumentViewport({ documentModel, estimate }) {
  return (
    <div className="estimate-preview-shell">
      <div className="estimate-preview-scroll">
        <div className="estimate-preview-stage">
          <EstimateDocumentLayout documentModel={documentModel} estimate={estimate} />
        </div>
      </div>
    </div>
  )
}
