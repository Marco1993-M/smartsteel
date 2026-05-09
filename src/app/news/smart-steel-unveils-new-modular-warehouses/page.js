import Image from 'next/image';
import Link from 'next/link';
import { FaFacebookF, FaInstagram, FaLinkedinIn } from 'react-icons/fa';

export const metadata = {
  title: 'Smart Steel Unveils New Modular Warehouses | Smart Steel',
  description:
    'Explore Smart Steel’s modular warehouse range and see how the new kit systems simplify supply, transport, and installation.',
  alternates: {
    canonical: '/news/smart-steel-unveils-new-modular-warehouses',
  },
  openGraph: {
    title: 'Smart Steel Unveils New Modular Warehouses | Smart Steel',
    description:
      'Explore Smart Steel’s modular warehouse range and see how the new kit systems simplify supply, transport, and installation.',
    url: 'https://www.smartsteel.co.za/news/smart-steel-unveils-new-modular-warehouses',
    siteName: 'Smart Steel',
    locale: 'en_ZA',
    type: 'article',
    images: [
      {
        url: '/modular-warehouses.jpg',
        alt: 'Smart Steel modular warehouses',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Smart Steel Unveils New Modular Warehouses | Smart Steel',
    description:
      'Explore Smart Steel’s modular warehouse range and see how the new kit systems simplify supply, transport, and installation.',
  },
};

export default function ArticlePage() {
  return (
    <>
      <article className="max-w-5xl mx-auto px-6 py-16 space-y-12">
        {/* Date and Read Time */}
        <p className="text-sm text-gray-500">15 June 2025 | 3 min read</p>

        {/* Title and Button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-4xl font-bold text-gray-800 leading-tight">
            Smart Steel unveils new modular warehouses
          </h1>
          <Link
            href="/brochures/resilient.pdf"
            className="bg-[#da1a33] text-white text-sm font-medium px-6 py-2 rounded-md hover:bg-[#b9182d] transition"
          >
            Download brochure
          </Link>
        </div>

        {/* Banner Image */}
        <div className="w-full h-96 relative rounded-xl overflow-hidden">
          <Image
            src="/modular-warehouses.jpg"
            alt="Smart Steel Modular Warehouses"
            layout="fill"
            objectFit="cover"
            className="rounded-xl"
          />
        </div>

        {/* Article Content */}
        <div className="prose lg:prose-lg max-w-none text-gray-700 space-y-8">
          <p>
            Smart Steel is proud to announce the launch of a streamlined range of modular warehouse structures — designed specifically to accelerate project timelines without compromising on strength or versatility.
          </p>

          <p>
            These pre-engineered systems are now available in standard widths of <strong>8m, 10m, and 12m</strong>, offering flexibility for a variety of industrial, agricultural, and storage applications. Whether you&apos;re building a logistics hub or a DIY distribution point, these structures are engineered to be simple to assemble and strong enough to endure.
          </p>

          <h2 className="text-2xl font-semibold">Why modular?</h2>
          <p>
            Our modular approach allows clients to scale up with ease. Each warehouse is built using a bay system, starting at 2.5m increments and expanding as needed. With clear spans and no internal supports, the interior space remains fully open and customizable.
          </p>

          <p>
            All components are manufactured at our dedicated steel facility and delivered flat-packed for on-site assembly. No welding required, and no specialist tools — just smart design that clicks into place.
          </p>

          <h2 className="text-2xl font-semibold">Available Sizes & Configurations</h2>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
  {/* 8m */}
  <div className="border rounded-lg p-4 shadow-sm bg-white">
    <h3 className="text-xl font-bold mb-4 text-center">8m Wide</h3>
    <img 
      src="/images/warehouse-12m.jpg" 
      alt="8m Wide Warehouse Specs" 
      className="rounded-md object-cover w-full h-48"
    />
  </div>

  {/* 10m */}
  <div className="border rounded-lg p-4 shadow-sm bg-white">
    <h3 className="text-xl font-bold mb-4 text-center">10m Wide</h3>
    <img 
      src="/images/warehouse-12m.jpg" 
      alt="10m Wide Warehouse Specs" 
      className="rounded-md object-cover w-full h-48"
    />
  </div>

  {/* 12m */}
  <div className="border rounded-lg p-4 shadow-sm bg-white">
    <h3 className="text-xl font-bold mb-4 text-center">12m Wide</h3>
    <img 
      src="/images/warehouse-12m.jpg" 
      alt="12m Wide Warehouse Specs" 
      className="rounded-md object-cover w-full h-48"
    />
  </div>
</div>


          <p className="mt-6">
            All structures come with an optional upgrade for Chromadek sheeting and IBR cladding . Shipping is calculated separately.
          </p>

          <h2 className="text-2xl font-semibold">Easy to transport. Easy to assemble.</h2>
          <p>
            Every warehouse is delivered as a flat-pack kit. Whether you&apos;re a seasoned builder or a DIY enthusiast, our assembly manuals and video guides ensure that anyone can put the structure together, no cranes or welding required.
          </p>

          <p>
            For businesses looking to scale operations quickly, this offering ensures cost control, minimal delays, and a clean modern look powered by precision steel engineering.
          </p>
            <h2 className="text-2xl font-semibold">No warehouse too big.</h2>
          <p>
            We offer complete flexibility with our modular system — including custom sizes tailored to your specific needs. Whether you require minor adjustments or long clear spans up to 40 meters wide, our team is equipped to deliver efficient, engineered solutions without compromising speed or strength.
          </p>
        </div>
      </article>

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
