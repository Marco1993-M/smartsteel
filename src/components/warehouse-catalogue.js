import React, { useState } from "react";
import Link from "next/link";
import { warehouses } from "./warehouse-catalogue-data";

export default function WarehouseCatalogue({
  title,
  subtitle,
  warehousesList = warehouses,
}) {
  const itemsPerPage = 9;
  const [page, setPage] = useState(0);
  const [activeModel, setActiveModel] = useState(null);

  const start = page * itemsPerPage;
  const paginatedItems = warehousesList.slice(start, start + itemsPerPage);

  const canPrev = page > 0;
  const canNext = start + itemsPerPage < warehousesList.length;

  return (
<section className="bg-white mt-16 py-16 px-6 md:px-12 lg:px-20">
  <div className="w-full text-center mb-12">
    <h2 className="text-4xl font-bold text-black mb-4">{title}</h2>
    {subtitle && (
      <p className="text-lg text-gray-700 max-w-2xl mx-auto">{subtitle}</p>
    )}
  </div>

  <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
    {paginatedItems.map((w) => (
      <div
        key={w.id}
        className="group rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden border border-gray-200 bg-white"
      >
        {/* Image Wrapper */}
        <div className="relative overflow-hidden">
          <img
            src={w.image}
            alt={w.name}
            className="w-full h-64 object-cover transition-transform duration-500 hover:scale-105"
          />

          {w.sketchfabEmbedUrl && (
            <button
              onClick={() => setActiveModel(w.sketchfabEmbedUrl)}
              className="absolute top-4 right-4
                         z-30
                         bg-black/85 backdrop-blur-sm
                         text-white text-sm font-semibold
                         px-4 py-2 rounded-full
                         shadow-lg
                         transition-all duration-300
                         hover:bg-white hover:text-black"
            >
              View 3D
            </button>
          )}
        </div>

        {/* Card Content */}
        <div className="p-7 space-y-4">
          <h3 className="text-2xl font-semibold text-black">{w.name}</h3>
          <p className="text-gray-700 text-base">Size: {w.size}</p>
          <p className="text-2xl font-bold text-black">{w.price}</p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center
                         h-12 px-6
                         text-sm font-semibold whitespace-nowrap
                         rounded-full
                         bg-[#da1a33] text-white
                         border border-black
                         transition-all duration-300
                         hover:bg-white hover:text-black"
            >
              Request&nbsp;Quote
            </Link>

            <Link
              href={`/warehouses/${w.slug}`}
              className="inline-flex items-center justify-center
                         h-12 px-4
                         text-sm font-semibold whitespace-nowrap
                         rounded-full
                         border border-[#da1a33] text-[#da1a33]
                         transition-all duration-300
                         hover:bg-[#da1a33] hover:text-white"
            >
              Learn&nbsp;More
            </Link>
          </div>
        </div>
      </div>
    ))}
  </div>

  {/* Pagination */}
  <div className="w-full flex justify-center mt-16 gap-4">
    <button
      onClick={() => canPrev && setPage(page - 1)}
      disabled={!canPrev}
      className={`px-6 py-3 rounded-lg border font-semibold transition ${
        canPrev
          ? "border-gray-400 text-black hover:bg-gray-100"
          : "border-gray-200 text-gray-400 cursor-not-allowed"
      }`}
    >
      Previous
    </button>

    <button
      onClick={() => canNext && setPage(page + 1)}
      disabled={!canNext}
      className={`px-6 py-3 rounded-lg font-semibold transition text-white ${
        canNext
          ? "bg-[#da1a33] hover:bg-red-700"
          : "bg-red-300 cursor-not-allowed"
      }`}
    >
      Next
    </button>
  </div>

  {/* 3D Modal */}
  {activeModel && (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={() => setActiveModel(null)}
    >
      <div
        className="relative w-[95%] max-w-6xl h-[80vh] bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => setActiveModel(null)}
          className="absolute top-4 right-4 z-10 bg-white text-black rounded-full w-10 h-10 flex items-center justify-center shadow-md hover:bg-gray-200"
        >
          ✕
        </button>

        {/* 3D Viewer */}
        <iframe
          title="3D Model"
          src={activeModel}
          className="w-full h-full"
          frameBorder="0"
          allow="autoplay; fullscreen; xr-spatial-tracking"
          allowFullScreen
        ></iframe>
      </div>
    </div>
  )}
</section>
  );
}
