'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FaFacebookF, FaInstagram, FaLinkedinIn } from 'react-icons/fa';

export default function ArticlePage() {
  return (
     <>
    {/* SEO & Canonical */}
      <Head>
        <title>Resilient outcomes with lightweight steel | Smart Steel</title>
        <meta
          name="description"
          content="Learn how lightweight steel framing provides resilient, sustainable, and precision-engineered solutions for buildings."
        />
        <link
          rel="canonical"
          href="https://www.smartsteel.co.za/news/resilient-outcomes-of-lightweight-steel"
        />
      </Head>
            
    <article className="max-w-5xl mx-auto px-6 py-16 space-y-12">
      {/* Meta + Title Row */}
      <div className="flex justify-between items-start flex-wrap gap-y-2">
        <div>
          <p className="text-sm text-gray-500">2 July 2025 | 2 min read</p>
          <h1 className="text-3xl md:text-4xl font-semibold mt-1">
            Resilient outcomes with lightweight steel
          </h1>
        </div>
        <Link
          href="/brochures/lightweight-steel-brochure.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#da1a33] hover:bg-[#bb182d] text-white px-5 py-2 text-sm rounded font-medium mt-2"
        >
          Download brochure
        </Link>
      </div>

      {/* Banner Image */}
      <Image
        src="/banner-resilient-steel.jpg"
        alt="Lightweight steel framing for resilient outcomes"
        width={1600}
        height={600}
        className="w-full rounded-xl object-cover border"
      />

      {/* Article Content */}
      <section className="space-y-10 text-gray-800 leading-relaxed text-[17px]">
        <p className="text-lg font-medium text-gray-700">
          When resilience matters most, lightweight steel framing stands out as the preferred solution. In an era of unpredictable climates, tighter budgets, and stricter timelines, construction needs to be stronger, faster, and smarter. That is where lightweight steel excels.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900">Built to last, designed to adapt</h2>
        <p>
          Lightweight steel structures are engineered for long-term performance. Whether you are building in a high-humidity region, near the coast, or in a fire-prone zone, steel framing provides unmatched resistance to moisture, warping, termites, and fire. This makes it an ideal material for resilient buildings—schools, clinics, warehouses, and homes—that need to perform for decades without degradation.
        </p>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Speed without compromise</h3>
            <p>
              Lightweight steel systems are precision-cut and pre-engineered, making on-site assembly significantly faster than traditional methods. In emergency response settings or post-disaster reconstruction, this speed can be life-saving. It also means reduced labor costs, fewer errors, and minimized waste.
            </p>
          </div>
          <Image
            src="/article-fast-install.jpg"
            alt="Efficient steel assembly"
            width={800}
            height={500}
            className="rounded-xl border object-cover"
          />
        </div>

        <h2 className="text-2xl font-semibold text-gray-900">Resilience meets sustainability</h2>
        <p>
          Not only is steel recyclable, it’s endlessly reusable. Every offcut can be melted down and repurposed without loss of performance. For builders and developers focused on green building certifications or reducing embodied carbon, lightweight steel framing provides a clear advantage over timber or brick alternatives.
        </p>

        <blockquote className="border-l-4 border-[#da1a33] pl-4 italic text-gray-600">
          “A resilient building isn’t just one that survives—it’s one that adapts. Lightweight steel gives you the flexibility to scale, extend, and retrofit structures without starting from scratch.”
        </blockquote>

        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h4 className="text-lg font-semibold text-gray-800">✔ Fire-resistant</h4>
            <p>Steel does not burn, making it a smart choice for wildfire-prone areas or buildings with strict fire codes.</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-gray-800">✔ Pest-proof</h4>
            <p>Unlike timber, steel framing is impervious to termites and insects—no treatment or toxic chemicals needed.</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-gray-800">✔ Precision-engineered</h4>
            <p>Factory-controlled production reduces tolerances and ensures every frame fits exactly as designed.</p>
          </div>
        </div>

        <h2 className="text-2xl font-semibold text-gray-900">Stronger futures, one frame at a time</h2>
        <p>
          Whether you are developing modular housing, medical outposts, rural classrooms, or warehouses, the need for resilient construction is universal. With lightweight steel, you are not just building structures, you are building solutions that endure.
        </p>

        <p>
          Ready to get started? <Link href="/contact" className="text-[#da1a33] font-medium hover:underline">Talk to our team</Link> to see how we can bring resilient steel framing to your next project.
        </p>
      </section>
    </article>
    
          {/* Explore More */}
      <section className="max-w-7xl mx-auto py-20">
        <h2 className="text-3xl font-bold mb-6 text-left">Explore more content</h2>

        <div className="grid md:grid-cols-2 gap-6">
          <Link href="/projects" className="border rounded-md p-6 hover:bg-gray-50 transition block">
            <h3 className="font-semibold text-lg text-[#da1a33]">Recent projects →</h3>
            <p className="text-sm mt-1 text-gray-700">Explore completed structures and case studies across South Africa.</p>
          </Link>

          <Link href="/resources" className="border rounded-md p-6 hover:bg-gray-50 transition block">
            <h3 className="font-semibold text-lg text-[#da1a33]">Technical resources and brochures →</h3>
            <p className="text-sm mt-1 text-gray-700">Browse our range of guides, datasheets, and design tools for your build.</p>
          </Link>
        </div>
      </section>

        {/* Follow Us Section */}
        <section className="bg-gray-100 py-20 px-6">
          <div className="max-w-5xl mx-auto text-left">
            <h2 className="text-3xl font-bold mb-4">Follow us on our socials!</h2>
            <p className="text-lg mb-8">
              Discover the latest projects featuring frames made from lightweight steel. Follow us for examples and inspiration on how lightweight steel is helping bring designs to life.
            </p>

            {/* Social Icons */}
            <div className="flex space-x-6 text-2xl">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#da1a33] transition"
              >
                <FaFacebookF />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#da1a33] transition"
              >
                <FaInstagram />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#da1a33] transition"
              >
                <FaLinkedinIn />
              </a>
            </div>
          </div>
        </section>
   </>
  );
}
