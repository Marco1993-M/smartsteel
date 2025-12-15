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
    price: "From R 1850,000",
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
    slug: "tractor-shed",
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
    id: 4,
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
    id: 5,
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
];

export default function WarehouseCatalogue({
  title,
  subtitle,
  warehousesList = warehouses,
}) {
  const itemsPerPage = 6; // 3 per row
  const [page, setPage] = useState(0);

  const start = page * itemsPerPage;
  const paginatedItems = warehousesList.slice(start, start + itemsPerPage);

  const canPrev = page > 0;
  const canNext = start + itemsPerPage < warehousesList.length;

  return (
    <section
      className="bg-white mt-16 py-16 px-6 md:px-12 lg:px-20"
      aria-label="Warehouse Catalogue Section"
    >
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
            className="rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 overflow-hidden border border-gray-200 bg-white"
          >
            <img
              src={w.image}
              alt={w.name}
              className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
            />

            <div className="p-7 space-y-4">
              <h3 className="text-2xl font-semibold text-black">{w.name}</h3>
              <p className="text-gray-700 text-base">Size: {w.size}</p>
              <p className="text-2xl font-bold text-black">{w.price}</p>

{/* CTA Buttons */}
<div className="flex items-center gap-3 pt-2">
  {/* Request Quote – Primary */}
  <Link
    href="/contact"
    className="inline-flex items-center justify-center
               h-12 px-6
               text-sm font-semibold whitespace-nowrap
               rounded-full
               bg-[#da1a33] text-white
               border border-black
               transition-all duration-300
               hover:bg-white hover:text-black
               focus:outline-none focus:ring-2 focus:ring-[#da1a33]"
  >
    Request&nbsp;Quote
  </Link>

  {/* Learn More – Secondary */}
  <Link
    href={`/warehouses/${w.slug}`}
    className="inline-flex items-center justify-center
               h-12 px-4
               text-sm font-semibold whitespace-nowrap
               rounded-full
               border border-[#da1a33] text-[#da1a33]
               transition-all duration-300
               hover:bg-[#da1a33] hover:text-white
               focus:outline-none focus:ring-2 focus:ring-[#da1a33]"
  >
    Learn&nbsp;More
  </Link>

  {/* WhatsApp FAB */}
  <Link
    href={`https://wa.me/27828464555?text=Hi%20Smart%20Steel,%20I'm%20interested%20in%20the%20${encodeURIComponent(
      w.name
    )}`}
    className="flex items-center justify-center
               w-12 h-12 rounded-full
               bg-green-600 text-white
               border border-transparent
               transition-all duration-300
               hover:bg-white hover:text-green-600 hover:border-green-600"
    title="Chat on WhatsApp"
  >
    {/* WhatsApp Icon */}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      fill="currentColor"
      className="w-6 h-6"
    >
      <path d="M16.002 2.667c-7.363 0-13.333 5.97-13.333 13.333 0 2.347.611 4.642 1.773 6.667L2.667 29.333l6.844-1.775a13.26 13.26 0 0 0 6.49 1.686h.001c7.363 0 13.333-5.97 13.333-13.333S23.365 2.667 16.002 2.667zm0 24c-2.09 0-4.143-.548-5.945-1.59l-.424-.247-4.064 1.055 1.083-3.956-.276-.406a10.644 10.644 0 0 1-1.733-5.968c0-5.877 4.79-10.667 10.667-10.667S26.669 9.68 26.669 15.557 21.879 26.667 16.002 26.667z" />
      <path d="M21.443 17.848c-.297-.148-1.758-.867-2.03-.967-.272-.1-.47-.148-.667.148-.197.297-.768.967-.94 1.165-.173.197-.347.223-.644.074-.297-.148-1.254-.462-2.387-1.473-.882-.787-1.478-1.759-1.651-2.056-.173-.297-.018-.457.13-.605.133-.133.297-.347.445-.52.148-.173.197-.297.297-.495.1-.197.05-.371-.025-.52-.074-.148-.667-1.611-.914-2.208-.242-.582-.487-.503-.667-.512-.173-.009-.371-.011-.569-.011-.197 0-.52.074-.792.371-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.876 1.214 3.074.148.197 2.096 3.2 5.08 4.487.709.306 1.262.489 1.693.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.414.248-.695.248-1.29.173-1.414-.074-.123-.272-.197-.569-.346z" />
    </svg>
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
    </section>
  );
}
