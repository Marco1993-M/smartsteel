import React, { useState } from "react";
import Link from "next/link";

// Mock warehouse data
export const warehouses = [
  {
    id: 1,
    slug: "7.5x8m-Warehouse",
    name: "Fully Enclosed 7.5x8m Warehouse",
    size: "7.5m x 8m",
    price: "Starting from R109,995",
    image: "/images/7.5x8m.jpg",
    images: [
      "/images/7.5x8mB.jpg",
      "/images/7.5x8mC.jpg",
      "/images/7.5x8mD.jpg",
    ],
    description:
      "Our Standard 7.5x8 warehouse offers exceptional durability, modular expandability, and fast installation — perfect for farms, workshops, storage, and small-scale commercial use. Roof pitched at 15°, it ensures efficient water runoff. Built with high-quality concealed fix roofing and G550 light steel frames, this warehouse is designed to withstand harsh weather conditions while providing a secure and spacious environment for your needs.",
    specs: {
      Width: "7.5m",
      Length: "8m",
      Height: "3m eave height",
      Cladding: "Concealed Fix Sheeting",
      Structure: "G550 Light Steel Frame",
      Bracing: "Wall Panel System",
    },
    addons: [
      "Roller Shutter Doors",
      "PA Doors",
      "Insulation (Lambda Board)",
      "Concrete Slab",
      "Gutters & Downpipes",
    ],
  },
  {
    id: 2,
    slug: "large-warehouse-",
    name: "Large Production Warehouse",
    size: "30m x 15m",
    price: "From R 1,850,000",
    image: "/images/30x15m.jpg",
      images: [
      "/images/30x15mB.jpg",
      "/images/7.5x8mC.jpg",
      "/images/7.5x8mD.jpg",
    ],
    description:
      "Our Standard 7.5x8 warehouse offers exceptional durability, modular expandability, and fast installation — perfect for farms, workshops, storage, and small-scale commercial use. Roof pitched at 15°, it ensures efficient water runoff. Built with high-quality concealed fix roofing and G550 light steel frames, this warehouse is designed to withstand harsh weather conditions while providing a secure and spacious environment for your needs.",
    specs: {
      Width: "15m",
      Length: "30m",
      Height: "6m eave height",
      Cladding: "Concealed Fix Sheeting",
      Structure: "G550 Light Steel Frame",
      Bracing: "Every 5 bays",
    },
    addons: [
      "Insulation (Lambda Board)",
      "Concrete Slab",
      "Gutters & Downpipes",
    ],
  },
  {
    id: 3,
    slug: "agri-shed",
    name: "Agri Shed",
    size: "15m x 8m",
    price: "Starting from R156,995",
    image: "/images/12.5x8m.jpg",
    images: [
      "/images/12.5x8mB.jpg",
     
    ],
    description:
      "Our 15x8 Agri Shed warehouse offers exceptional durability, modular expandability, and fast installation — perfect for farms, workshops, storage, and small-scale commercial use. Roof pitched at 15°, it ensures efficient water runoff. Built with high-quality concealed fix roofing and G550 light steel frames, this warehouse is designed to withstand harsh weather conditions while providing a secure and spacious environment for your needs.",
    specs: {
      Width: "8m",
      Length: "15m",
      Height: "4m eave height",
      Cladding: "Metal Sheeting",
      Structure: "G550 Light Steel Frame",
      Bracing: "Wall Frame System",
    },
    addons: [
      "Insulation (Lambda Board)",
      "Concrete Slab",
      "Gutters & Downpipes",
    ],
  },

    {
    id: 4,
    slug: "agri-shed-slim",
    name: "Agri Shed Slim",
    size: "12m x 3m",
    price: "Starting from R139,995",
    image: "/images/12x3m.jpg",
       sketchfabEmbedUrl:
  "https://sketchfab.com/models/0b6a01aac0914230b91bc470dbde0d11/embed",
    images: [
      "/images/12x3mB.jpg",
     
    ],
    description:
      "Our 12x3 Agri Shed warehouse offers exceptional durability, modular expandability, and fast installation — perfect for farms, workshops, storage, and small-scale commercial use. Roof pitched at 15°, it ensures efficient water runoff. Built with high-quality concealed fix roofing and G550 light steel frames, this warehouse is designed to withstand harsh weather conditions while providing a secure and spacious environment for your needs.",
    specs: {
      Width: "3m",
      Length: "12m",
      Height: "3m eave height",
      Cladding: "Metal Sheeting",
      Structure: "G550 Light Steel Frame",
      Bracing: "Wall Frame System",
    },
    addons: [
      "Insulation (Lambda Board)",
      "Concrete Slab",
      "Gutters & Downpipes",
    ],
  },
  {
    id: 5,
    slug: "double-garage",
    name: "Double Garage - Extra Depth",
    size: "12m x 6m",
    price: "Starting from R129,995",
    image: "/images/double_garage.jpg",
        images: [
      "/images/double_garageB.jpg",
     
    ],
    description:
      "Our 12x6m Double Garage offers an exeptional modern solution for secure vehicle storage and versatile space utilization. With its extra depth design, this garage provides ample room for two vehicles along with additional storage or workspace. Constructed with high-quality concealed fix sheeting and a robust G550 light steel frame, it ensures durability and protection against the elements. The 3m eave height allows for easy access and maneuverability, making it an ideal choice for homeowners seeking both functionality and style.",
    specs: {
      Width: "6m",
      Length: "12m",
      Height: "3m eave height",
      Cladding: "Concealed Fix Sheeting",
      Structure: "G550 Light Steel Frame",
      Bracing: "Wall Frame System",
    },
    addons: [
      "Insulation (Lambda Board)",
      "Concrete Slab",
      "Gutters & Downpipes",
    ],
  },
    {
    id: 6,
    slug: "5x8m-Covered-Area",
    name: "5x8m Sheltered Covered Area",
    size: "5m x 8m",
    price: "Starting from R82,995",
    image: "/images/5x8mE.jpg",
    images: [
      "/images/5x8mB.jpg",
      "/images/5x8mC.jpg",
      "/images/5x8mD.jpg",
      "/images/5x8m.jpg",
      "/images/5x8mF.jpg",
      "/images/5x8mG.jpg",
    ],
    description:
      "Our Standard 7.5x8 warehouse offers exceptional durability, modular expandability, and fast installation — perfect for farms, workshops, storage, and small-scale commercial use. Roof pitched at 15°, it ensures efficient water runoff. Built with high-quality concealed fix roofing and G550 light steel frames, this warehouse is designed to withstand harsh weather conditions while providing a secure and spacious environment for your needs.",
    specs: {
      Width: "7.5m",
      Length: "8m",
      Height: "3m eave height",
      Cladding: "Concealed Fix Sheeting",
      Structure: "G550 Light Steel Frame",
      Bracing: "Every 5 bays",
    },
    addons: [
      "Concrete Slab",
      "Gutters & Downpipes",
    ],
  },
     {
    id: 7,
    slug: "20x12m-warehouse",
    name: "Smart Steel 240",
    size: "20m x 12m",
    price: "Starting from R224,995",
    image: "/images/smartsteel240tn.jpg",
         sketchfabEmbedUrl:
  "https://sketchfab.com/models/82a83808651d404c801f064e55e67176/embed",
    images: [
      "/images/smartsteel240b.jpg",
    ],
    description:
      "Our Smart Steel 240 20x12m warehouse offers exceptional durability, modular expandability, and fast installation — perfect for farms, workshops, storage, and small-scale commercial use. Roof pitched at 15°, it ensures efficient water runoff. Built with high-quality concealed fix roofing and G550 light steel frames, this warehouse is designed to withstand harsh weather conditions while providing a secure and spacious environment for your needs.",
    specs: {
      Width: "20m",
      Length: "12m",
      Height: "3m eave height",
      Cladding: "Metal Sheeting",
      Structure: "G550 Light Steel Frame",
      Bracing: "Every 5 bays",
    },
    addons: [
      "Concrete Slab",
      "Gutters & Downpipes",
      "Door Options",
      "Window Options",
      "Chromadek Sheeting",
    ],
  },

       {
    id: 8,
    slug: "20x12m-warehouse-tall",
    name: "Smart Steel 240 Tall",
    size: "20m x 12m x 9m",
    price: "Starting from R449,995",
    image: "/images/9mhightn.jpg",
    images: [
    "/images/9mhightn.jpg",
    ],
    description:
      "Our Smart Steel 240 Tall 20x12m warehouse offers exceptional durability, modular expandability, and fast installation — perfect for farms, workshops, storage, and small-scale commercial use. Roof pitched at 15°, it ensures efficient water runoff. Built with high-quality concealed fix roofing and G550 light steel frames, this warehouse is designed to withstand harsh weather conditions while providing a secure and spacious environment for your needs.",
    specs: {
      Width: "20m",
      Length: "12m",
      Height: "9m eave height",
      Cladding: "Metal Sheeting",
      Structure: "G550 Light Steel Frame",
      Bracing: "Every 5 bays",
    },
    addons: [
      "Concrete Slab",
      "Gutters & Downpipes",
      "Door Options",
      "Window Options",
      "Chromadek Sheeting",
    ],
  },

         {
    id: 9,
    slug: "20-20-hangar",
    name: "20m x 20m Smart Steel Hangar",
    size: "20m x 20m x 3m",
    price: "Starting from R289,995",
    image: "/images/20x20 Hangar.jpg",
                sketchfabEmbedUrl:
  "https://sketchfab.com/models/cdfda506de1140aca67c8232b31e6530/embed",
    images: [
    "/images/20x20 Hangar.jpg",
    "/images/20x20 Hangar_b.jpg",
    "/images/20x20 Hangar.jpg",
    ],
    description:
      "The Smart Steel 20m x 20m Hangar is a high-performance, lightweight steel structure designed for aircraft storage, industrial use, agricultural equipment, and large-scale storage applications. With a total footprint of 400m², this structure provides a clear-span interior, allowing maximum usable space without internal columns — ideal for aircraft maneuverability, large machinery access, or bulk storage.",
    specs: {
      Width: "20m",
      Length: "20m",
      Height: "3m eave height",
      Cladding: "Chromadek Sheeting",
      Structure: "G550 Light Steel Frame",
      Bracing: "Wall Panel System",
    },
    addons: [
      "Concrete Slab",
      "Gutters & Downpipes",
      "Door Options",
      "Window Options",
    ],
  },
];

export default function WarehouseCatalogue({
  title,
  subtitle,
  warehousesList = warehouses,
}) {
  const itemsPerPage = 6;
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
