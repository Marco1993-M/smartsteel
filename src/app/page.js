'use client';
import { useState } from 'react';
import Link from 'next/link';

const brochures = {
  'Home Owner': [
    {
      title: 'Smart Steel Solutions Guide',
      desc: 'An overview of our lightweight steel kits, ideal for residential and commercial builds.',
      image: '/Brochure A.jpg',
      link: '/brochure.pdf',
    },
    {
      title: 'Smart Steel Sustainability Report',
      desc: 'A detailed look at our eco-friendly processes and recyclable materials.',
      image: '/Brochure B.jpg',
      link: '/sustainability.pdf',
    },
  ],
  'Architect / Specifier': [
    {
      title: 'Technical Specs & Compliance',
      desc: 'Detailed engineering specs, load calculations, and local compliance data.',
      image: '/Brochure A.jpg',
      link: '/Brochure B.pdf',
    },
    {
      title: 'Smart Steel Solutions Guide',
      desc: 'An overview of our lightweight steel kits, ideal for residential and commercial builds.',
      image: '/brochure-cover1.jpg',
      link: '/brochure.pdf',
    },
  ],
  'Builder / Installer': [
    {
      title: 'Installation Guide',
      desc: 'Step-by-step instructions to install Smart Steel frame kits on-site.',
      image: '/brochure-cover3.jpg',
      link: '/install-guide.pdf',
    },
    {
      title: 'Warranty Document',
      desc: '10-year structural warranty on all steel frames.',
      image: '/brochure-cover2.jpg',
      link: '/warranty.pdf',
    },
  ],
  'Fabricator': [
    {
      title: 'Fabrication Standards Guide',
      desc: 'Guidelines and tolerances for fabrication.',
      image: '/brochure-cover1.jpg',
      link: '/fabrication.pdf',
    },
    {
      title: 'Smart Steel Solutions Guide',
      desc: 'An overview of our lightweight steel kits, ideal for residential and commercial builds.',
      image: '/brochure-cover4.jpg',
      link: '/brochure.pdf',
    },
  ],
};

export default function Home() {
  const [selectedRole, setSelectedRole] = useState('Home Owner');
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const features = [
    {
      title: '100% termite proof',
      description: 'Smart Steel structures resist termite damage — eliminating the need for treatments and ongoing inspections.',
      image: '/A.jpg',
    },
    {
      title: 'Straight and true',
      description: 'Steel is precision manufactured to remain straight, helping walls, floors and roofs stay level and square.',
      image: '/B.jpg',
    },
    {
      title: 'Dimensionally accurate',
      description: 'Factory-cut to exact specifications, ensuring consistency and reducing on-site errors and waste.',
      image: '/C.jpg',
    },
    {
      title: 'Renowned durability',
      description: 'TRUECORE® steel is made to last, with corrosion-resistant coatings for long-term performance.',
      image: '/durability.jpg',
    },
    {
      title: 'Won’t catch fire',
      description: 'Steel is non-combustible, adding fire resistance to your home’s framework.',
      image: '/fireproof.jpg',
    },
  ];

  const faqs = [
    {
      q: 'How long does it take to build?',
      a: 'Smart Steel empowers you to build world-class warehouse facilities faster and more cost-effectively than traditional construction methods. Our lightweight steel warehouse solutions can be shipped anywhere across South Africa and beyond, designed for easy self-assembly or professional erection by the Smart Steel team.',
    },
    {
      q: 'Can I customize or expand later?',
      a: 'Yes! The modular design allows for easy expansion, relocation, or layout changes over time.',
    },
    {
      q: 'How durable are these structures?',
      a: 'Our steel is galvanized, fire-rated, and built to last over 50 years in South African conditions.',
    },
  ];

  return (
    
      <main className="font-sans text-gray-800">

        {/* Hero Section */}
        <section className="bg-white text-black py-40 px-6 text-center">
          <h5 className="text-lg md:text-xl font-thin mb-2"><p>South Africa&apos;s Pick for Lightweight Steel Warehousing Solutions</p></h5>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Fast, Affordable & Durable Steel Warehouses
          </h1>
          <p className="text-lg md:text-xl mb-6 max-w-2xl mx-auto">
            Lightweight steel framing and metal roofing systems that are engineered for rapid construction, long-term durability, and low maintenance. 100% recyclable, fire-resistant, and termite-proof.
          </p>
          <a
            href="#warehouse"
            className="bg-[#da1a33] text-white px-6 py-3 rounded-full font-semibold 
              hover:bg-gray-200 transition transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#da1a33]"
          >
            Request a Warehouse Quote
          </a>
        </section>

        {/* About Section */}
        <section className="py-16 px-6 bg-white text-center">
          <h2 className="text-3xl font-semibold mb-6">Steel structures designed to last</h2>
          <p className="max-w-3xl mx-auto text-lg">
            Durable metal roofing, trusses, spec houses made from galvanised light weight steel that won’t twist, warp,
            or shrink — ever. Our steel is fire-resistant, termite and borer proof, 100% recyclable, and engineered for
            strength and longevity in any climate.
            Smart Steel is one of the leading designers and suppliers of lightweight steel construction solutions across
            South Africa. Our solutions are ideal for a wide range of applications, including custom steel workshops,
            affordable steel storage units, and lightweight steel warehouses.
          </p>
        </section>

        {/* Why Smart Steel */}
        <section className="bg-gray-100 py-16 px-6">
          <h2 className="text-3xl text-center font-semibold mb-12">Why Choose Smart Steel?</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white p-6 rounded shadow text-center">
              <h3 className="text-xl font-bold mb-2">Fast Assembly</h3>
              <p>Faster build times and lower labor costs.</p>
            </div>
            <div className="bg-white p-6 rounded shadow text-center">
              <h3 className="text-xl font-bold mb-2">Eco-Friendly</h3>
              <p>Steel is recyclable and ideal for sustainable construction.</p>
            </div>
            <div className="bg-white p-6 rounded shadow text-center">
              <h3 className="text-xl font-bold mb-2">Precision Engineering</h3>
              <p>We design with CAD and die-cut for accuracy and strength.</p>
            </div>
          </div>
        </section>

        {/* Our Solutions */}
<section
  className="relative py-42 px-6 text-center bg-cover bg-center"
  style={{ backgroundImage: "url('/warehouse.jpg')" }}
>
  <div className="absolute inset-0 bg-black opacity-50"></div>
  <div className="relative z-10 max-w-2xl mx-auto text-white">
    <h2 className="text-3xl font-semibold mb-6">Smart Warehouses</h2>
    <p className="mb-8">Explore our Smart Warehouses options & more.</p>
    <a
      href="/warehouse"
      className="inline-block bg-white bg-opacity-70 text-black px-6 py-3 rounded-full hover:bg-gray-700 transition"
    >
      View options
    </a>
  </div>
</section>

 {/* Lightweight Steel Warehousing Section */}
      <section id="warehousing" className="bg-white py-20 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-left">
              Lightweight Steel Warehousing in South Africa
            </h2>
            <p className="text-lg text-gray-700 mb-6 text-left">
              Fast, modular, and energy-efficient — our cold-formed steel warehouses are engineered for South African conditions and tailored to your industry.
            </p>
            <ul className="space-y-3 text-gray-800 font-medium mb-8 text-left">
              <li>⚡ <strong>50% faster</strong> to build than brick-and-mortar</li>
              <li>🏗️ Clear spans up to <strong>20–40 m</strong> — no interior columns needed</li>
              <li>🌿 <strong>Eco-friendly</strong> materials that are fully recyclable</li>
              <li>🔧 <strong>Modular, customizable</strong>, and future-ready</li>
              <li>🔥 Fire-rated, pest-proof, rot-resistant & low maintenance</li>
            </ul>
            <Link
              href="/steel"
              className="inline-block bg-[#da1a33] text-white px-6 py-3 rounded-full font-semibold 
                hover:bg-[#bf172d] transition mb-10"
            >
              Learn more 
            </Link>

            {/* Collapsible FAQ Section */}
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold mb-4">FAQs</h3>
              {faqs.map(({ q, a }, index) => (
                <div key={index} className="border-b pb-3">
                  <button
                    onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                    className="w-full text-left text-lg font-medium flex justify-between items-center focus:outline-none"
                  >
                    {q}
                    <span className="text-xl">{openFaqIndex === index ? '−' : '+'}</span>
                  </button>
                  {openFaqIndex === index && (
                    <p className="mt-2 text-gray-600 text-sm">{a}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <img
              src="/sale-banner.png"
              alt="Lightweight Steel Warehouse in South Africa"
              className="rounded-2xl shadow-xl w-full h-auto object-cover"
            />
          </div>
        </div>
      </section>






        {/* Brochures Section */}
        <section className="bg-gray-50 py-20 px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Brochures and Technical Resources</h2>
          <p className="text-lg max-w-2xl mx-auto mb-8">
            Download our brochures and technical guides to discover how Smart Steel can enhance your next build.
          </p>

          {/* Dropdown */}
          <div className="mb-12">
            <label htmlFor="audience" className="block text-sm font-medium text-gray-700 mb-2">
              I am a:
            </label>
            <select
              id="audience"
              name="audience"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="mt-1 block mx-auto w-64 px-4 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-[#da1a33] focus:border-[#da1a33] text-gray-700"
            >
              {Object.keys(brochures).map((role) => (
                <option key={role}>{role}</option>
              ))}
            </select>
          </div>

          {/* Filtered Results */}
          <h3 className="text-2xl font-semibold text-left max-w-6xl mx-auto mb-8">Recommended for you</h3>
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 text-left">
            {brochures[selectedRole].map((item, index) => (
              <div key={index} className="bg-white shadow-md rounded-lg overflow-hidden flex">
                <div className="w-1/3">
                  <img src={item.image} alt={item.title} className="object-cover w-full h-full" />
                </div>
                <div className="p-6 w-2/3 flex flex-col justify-between">
                  <div>
                    <h4 className="text-lg font-semibold mb-2">{item.title}</h4>
                    <p className="text-sm text-gray-600 mb-4">{item.desc}</p>
                  </div>
                  <a
                    href={item.link}
                    download
                    className="inline-block bg-[#da1a33] text-white px-4 py-2 rounded hover:bg-[#bf172d] transition"
                  >
                    Download
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12">
            <a
              href="/resources"
              className="inline-block bg-gray-800 text-white px-6 py-3 rounded-full hover:bg-gray-700 transition"
            >
              View All Resources
            </a>
          </div>
        </section>

       {/* Homepage Recent Projects Preview Section */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold mb-2 text-left">Recent Projects</h2>
            <p className="text-lg text-left">Take a look at some recent builds that have benefited from the inner strength of lightweight steel.</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link
              href="/recent"
              className="inline-block bg-gray-800 text-white px-6 py-3 rounded-full hover:bg-gray-700 transition"
            >
              Explore All Projects
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[{
            image: '/B.jpg',
            title: 'Modern Farm Shed, Free State',
            description: 'Custom agricultural shed using galvanised lightweight steel — fast to erect, built to last.'
          }, {
            image: '/C.jpg',
            title: 'Lightweight Roof Retrofit, Pretoria',
            description: 'Steel trusses were used to replace aging timber in a school roof retrofit project.'
          }].map((project, index) => (
            <div key={index} className="relative group rounded-lg overflow-hidden shadow hover:shadow-lg transition">
              <img
                src={project.image}
                alt={project.title}
                className="w-full h-72 object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-[#1e2a39] bg-opacity-90 text-white p-4">
                <h4 className="text-lg font-semibold">{project.title}</h4>
                <p className="text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-2">{project.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

        {/* Built-in Quality */}
        <section className="bg-gray-100 py-20 px-6">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-10 items-center">
            {/* Image on left */}
            <div>
              <img
                src={features[hoveredFeature ? hoveredFeature : 0].image}
                alt={features[hoveredFeature ? hoveredFeature : 0].title}
                className="rounded-lg shadow w-full object-cover h-auto"
              />
            </div>

            {/* Text on right */}
            <div>
              <h2 className="text-3xl font-bold text-center md:text-left mb-4">Built-in Quality</h2>
              <p className="text-lg text-center md:text-left mb-8">
                Today, modern building technologies are changing the way our homes are built. Advanced materials and contemporary designs work hand-in-hand, allowing durable and family friendly homes.
              </p>

              <div className="space-y-6">
                {features.map((feature, index) => (
  <div
    key={index}
    onMouseEnter={() => setHoveredFeature(index)}
    onMouseLeave={() => setHoveredFeature(null)}
    className="transition duration-300 ease-in-out"
  >
    <h4 className="text-xl font-semibold text-black cursor-pointer hover:underline">
      {feature.title}
    </h4>
    {hoveredFeature === index && (
      <p className="text-sm text-gray-700 mt-2">
        {feature.description}
      </p>
    )}
  </div>
))}

              </div>
            </div>
          </div>
        </section>

{/* Solar Solutions */}
<section className="py-20 px-6 bg-white text-center">
  <h2 className="text-3xl font-bold mb-6">Solar-Ready Steel Solutions</h2>
  <p className="text-lg max-w-3xl mx-auto mb-12">
    Smart Steel’s lightweight steel frames are the ideal foundation for modern solar installations. From carports to ground-mounted systems and integrated solar roofs, our structures are engineered for strength, longevity, and effortless solar compatibility.
  </p>

  <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 text-left">
    <div className="bg-gray-50 p-6 rounded-lg shadow hover:shadow-lg transition">
      <h3 className="text-xl font-semibold mb-2">Solar Carports</h3>
      <p className="text-gray-700 mb-4">
        Create covered parking that works double-time — our steel carport systems provide reliable shelter while supporting solar panels for on-site energy generation.
      </p>
      <img src="/solar-carport.jpg" alt="Solar Carports" className="w-full h-48 object-cover rounded" />
    </div>

    <div className="bg-gray-50 p-6 rounded-lg shadow hover:shadow-lg transition">
      <h3 className="text-xl font-semibold mb-2">Ground Mount Systems</h3>
      <p className="text-gray-700 mb-4">
        Lightweight steel ground mounts designed for durability, fast assembly, and precise alignment — ideal for solar farms, rural sites, and residential arrays.
      </p>
      <img src="/solar-ground.jpg" alt="Solar Ground Mounts" className="w-full h-48 object-cover rounded" />
    </div>

    <div className="bg-gray-50 p-6 rounded-lg shadow hover:shadow-lg transition">
      <h3 className="text-xl font-semibold mb-2">Solar Roof Structures</h3>
      <p className="text-gray-700 mb-4">
        Whether retrofitting an existing building or designing from the ground up, our precision-engineered steel frames provide the perfect base for integrated solar roofing.
      </p>
      <img src="/solar-roof.jpg" alt="Solar Roof Structures" className="w-full h-48 object-cover rounded" />
    </div>
  </div>

  <div className="mt-12">
    <Link
      href="/solar"
      className="inline-block bg-[#da1a33] text-white px-6 py-3 rounded-full hover:bg-[#bf172d] transition"
    >
      Discuss Solar Solutions
    </Link>
  </div>
</section>

  

       {/* CTA */}
        <section id="contact" className="bg-[#000000] text-white py-20 px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">Ready to build with steel?</h2>
          <p className="text-lg mb-6">Get in touch today and let us bring your vision to life.</p>
          <a
            href="mailto:info@smartsteel.co.za"
            className="bg-white text-gray-900 px-6 py-3 rounded-full font-semibold hover:bg-gray-200 transition"
          >
            Contact Us
          </a>
        </section>

        
      </main>
  
  );
}


