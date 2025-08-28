import Link from 'next/link';

export default function LightweightSteelTrusses() {
  return (
    <section
      id="lightweight-steel-trusses"
      className="bg-white mt-16 py-16 px-6 md:px-12 lg:px-24"
      aria-label="Lightweight Steel Trusses Section"
    >
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-10">
        <article className="flex-1">
          <h1 className="text-4xl font-bold text-black-900 mb-4">
            Lightweight Steel Trusses for Strong, Durable Roof Structures
          </h1>
          <p className="text-lg text-gray-700 mb-6 leading-relaxed">
            Smart Steel designs and builds lightweight steel warehouses that are fast to assemble, durable in any climate, and cost-effective for businesses across South Africa. We also specialise in prefabricated lightweight steel roof trusses engineered for fast, cost-effective installation — ideal for residential, commercial, and industrial buildings across South Africa.
          </p>

          {/* Correct usage of Link in Next.js 13+ */}
          <Link
            href="/products/lightweight-steel-trusses"
            className="inline-block bg-[#da1a33] hover:bg-red-700 text-white font-semibold px-8 py-4 rounded-lg transition"
            aria-label="Explore Lightweight Steel Trusses Products"
          >
            Learn More About Our Trusses
          </Link>
        </article>

        <figure className="flex-1">
          <img
            src="/images/steel-trusses.jpg"
            alt="Prefabricated lightweight steel trusses for residential and commercial buildings"
            className="rounded-lg shadow-lg object-cover w-full max-h-96"
            loading="lazy"
            width={600}
            height={400}
          />
          <figcaption className="sr-only">
            Prefabricated lightweight steel trusses engineered for strength and durability
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
