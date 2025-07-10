'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const projects = [
  {
    image: '/projects/commercial1.jpg',
    gallery: [
      '/projects/commercial1.jpg',
      '/projects/commercial2.jpg',
      '/projects/commercial3.jpg',
      '/projects/commercial4.jpg'
    ],
    title: 'Spa & Coffee',
    tag: 'Commercial',
    keywords: ['Infrastructure', 'Modular Construction'],
    architect: 'Pequeño',
    builder: 'Pequeño',
    fabricator: 'LSF Steel Supply',
    description:
      'Nestled in the heart of urban tranquility, Spa & Coffee redefines relaxation with its innovative fusion of wellness and café culture, delivered through cutting-edge modular construction...'
  },
  {
    image: '/projects/residential1.jpg',
    gallery: [
      '/projects/residential1.jpg',
      '/projects/residential2.jpg',
      '/projects/residential3.jpg',
      '/projects/residential4.jpg',
      '/projects/residential5.jpg'
    ],
    title: 'Roof Overhaul',
    tag: 'Residential',
    keywords: ['Infrastructure', 'Roof Construction'],
    architect: 'Designed by Smart Steel',
    builder: 'Smart Steel',
    fabricator: 'LSF Steel Supply',
    description:
      'Elevating an existing flat roof into a roof that won’t be moved, this residential retrofit showcases innovative lightweight steel construction...'
  },
];

const filters = ['All', 'Commercial', 'Residential', 'Industrial'];

export default function RecentProjects() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [modalProject, setModalProject] = useState(null);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  const filteredProjects =
    activeFilter === 'All'
      ? projects
      : projects.filter((project) => project.tag === activeFilter);

  const handlePrev = () => {
    setCurrentImageIdx((prev) =>
      prev === 0 ? modalProject.gallery.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentImageIdx((prev) =>
      prev === modalProject.gallery.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <main className="font-sans text-gray-800 px-4 py-12 bg-white">
      {/* Header */}
      <section className="max-w-6xl mx-auto mb-10">
        <h1 className="text-4xl font-bold mb-4 text-left">Project Gallery</h1>
        <p className="text-lg text-gray-700 text-left">
          Lightweight steel has been used across residential and commercial buildings across South Africa. Whether you are
          building your home or a large-scale commercial project, explore and be inspired by projects that showcase the use
          of lightweight steel.
        </p>
      </section>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-10 border-b border-gray-300 max-w-6xl mx-auto">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`pb-2 text-lg font-medium transition border-b-4 ${
              activeFilter === filter
                ? 'border-[#da1a33] text-[#da1a33]'
                : 'border-transparent text-gray-600 hover:text-black'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Project Cards */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
        {filteredProjects.map((project, idx) => (
          <div key={idx} className="shadow rounded-lg overflow-hidden bg-white">
            <div className="relative w-full h-64">
              <Image
                src={project.image}
                alt={project.title}
                layout="fill"
                objectFit="cover"
                className="rounded-t-lg"
              />
            </div>
            <div className="p-6">
              <span className="inline-block border border-[#da1a33] text-[#da1a33] text-xs uppercase font-semibold px-3 py-1 rounded-full mb-2">
                {project.tag}
              </span>
              <h3
                className="text-xl font-bold mb-2 cursor-pointer text-[#1e2a39] hover:underline"
                onClick={() => {
                  setModalProject(project);
                  setCurrentImageIdx(0);
                }}
              >
                {project.title}
              </h3>
              <p className="text-sm text-gray-600">
                {project.keywords.join(' / ')}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {modalProject && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-2 sm:p-4"
          onClick={() => setModalProject(null)}
        >
          <div
            className="bg-white rounded-lg w-full max-w-6xl max-h-[95vh] overflow-y-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setModalProject(null)}
              className="absolute top-2 right-2 text-3xl text-gray-600 hover:text-red-600 z-50"
              aria-label="Close modal"
            >
              &times;
            </button>

            {/* Image Viewer */}
            <div className="relative w-full h-[60vh] sm:h-[400px]">
              <Image
                src={modalProject.gallery[currentImageIdx]}
                alt={modalProject.title}
                layout="fill"
                objectFit="cover"
              />
              <button
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow"
                onClick={handlePrev}
              >
                <FaChevronLeft />
              </button>
              <button
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow"
                onClick={handleNext}
              >
                <FaChevronRight />
              </button>
            </div>

            {/* Thumbnails - Horizontal scroll on small screens */}
            <div className="flex gap-2 px-4 py-3 overflow-x-auto">
              {modalProject.gallery.map((thumb, i) => (
                <div
                  key={i}
                  className={`relative w-20 h-16 border-2 ${
                    i === currentImageIdx
                      ? 'border-[#da1a33]'
                      : 'border-transparent'
                  } cursor-pointer flex-shrink-0`}
                  onClick={() => setCurrentImageIdx(i)}
                >
                  <Image src={thumb} alt={`thumb-${i}`} layout="fill" objectFit="cover" />
                </div>
              ))}
            </div>

            {/* Project Info */}
            <div className="grid md:grid-cols-2 gap-6 px-6 py-6 text-sm text-gray-700">
              <div className="space-y-2">
                <p><strong>Project:</strong> {modalProject.title}</p>
                <p><strong>Segment:</strong> {modalProject.tag}</p>
                <p><strong>Application type:</strong> {modalProject.keywords.join(', ')}</p>
                <p><strong>Architect:</strong> {modalProject.architect}</p>
                <p><strong>Builder:</strong> {modalProject.builder}</p>
                <p><strong>Fabricator:</strong> {modalProject.fabricator}</p>
              </div>
              <div>
                <p>{modalProject.description}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
