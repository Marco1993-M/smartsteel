'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const numberedGallery = (folder, order) => order.map((number) => `/projects/${folder}/${number}.webp`);

const projects = [
  {
    cover: '/projects/Solar Carports_Centurion Golf Club/7.webp',
    gallery: numberedGallery('Solar Carports_Centurion Golf Club', [7, 1, 2, 3, 4, 5, 6]),
    title: 'Solar carports at Centurion Golf Club',
    system: 'Atlas',
    application: 'Solar carport',
    location: 'Centurion, Gauteng',
    stage: 'Completed',
    description: 'A completed solar-carport project that turns an existing parking area into useful covered parking and a working platform for solar panels.'
  },
  {
    cover: '/projects/Somerset West/2.webp',
    gallery: numberedGallery('Somerset West', [2, 1, 3, 4]),
    title: 'Light steel frame structure in Somerset West',
    system: 'LSF',
    application: 'Residential structure',
    location: 'Somerset West, Western Cape',
    stage: 'Structure installation',
    description: 'A lightweight steel frame taking shape on site, with wall panels and roof framing assembled into a precise, open structural shell.'
  },
  {
    cover: '/projects/Karongwe/5.webp',
    gallery: numberedGallery('Karongwe', [5, 1, 2, 3, 4, 6, 7]),
    title: 'Light steel frame project in Hoedspruit',
    system: 'LSF',
    application: 'Building structure',
    location: 'Hoedspruit, Limpopo',
    stage: 'Structure installation',
    description: 'A substantial lightweight steel frame project documented from delivery and wall erection through to roof-truss installation and sheeting.'
  },
  {
    cover: '/projects/atkv.jpg',
    gallery: ['/projects/atkv.jpg', ...Array.from({ length: 10 }, (_, index) => `/projects/atkv${index + 1}.jpg`)],
    title: '5m x 8m steel stage for ATKV',
    system: 'LSF',
    application: 'Commercial structure',
    location: 'Bergville, KwaZulu-Natal',
    stage: 'Completed',
    description: 'A compact lightweight steel stage structure completed for ATKV, showing how an efficient steel system can support a practical commercial application.'
  }
];

const filters = ['All', 'Atlas', 'LSF'];

export default function RecentProjectsClient() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [modalProject, setModalProject] = useState(null);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const visibleProjects = activeFilter === 'All' ? projects : projects.filter((project) => project.system === activeFilter);

  const openProject = (project) => {
    setModalProject(project);
    setCurrentImageIdx(0);
  };

  const changeImage = (direction) => {
    setCurrentImageIdx((current) => (current + direction + modalProject.gallery.length) % modalProject.gallery.length);
  };

  return (
    <main className="min-h-screen bg-white text-[#071d2b]">
      <section className="px-4 pb-16 pt-4 sm:px-6 sm:pt-5 lg:px-8">
        <div className="mx-auto max-w-[1500px] overflow-hidden rounded-[2rem] bg-white sm:rounded-[3rem]">
          <div className="grid lg:grid-cols-[0.82fr_1.18fr]">
            <div className="flex flex-col justify-center px-7 py-12 sm:px-12 lg:px-16 lg:py-20">
              <p className="mb-5 text-xs font-bold uppercase tracking-[0.28em] text-[#0043f3]">Recent projects</p>
              <h1 className="max-w-3xl text-4xl font-bold leading-[0.98] sm:text-6xl lg:text-7xl">Steel systems, proven on site.</h1>
              <p className="mt-7 max-w-xl text-base leading-7 text-[#52677d] sm:text-lg">Explore Atlas and lightweight steel projects delivered across South Africa, from solar parking to complete building structures.</p>
            </div>
            <div className="relative min-h-[360px] lg:min-h-[590px]">
              <Image src="/projects/Solar Carports_Centurion Golf Club/7.webp" alt="Completed solar carports at Centurion Golf Club" fill priority className="object-cover" sizes="(max-width: 1024px) 100vw, 58vw" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#071d2b]/55 via-transparent to-transparent lg:bg-gradient-to-r lg:from-white lg:via-white/10" />
              <div className="absolute bottom-6 left-6 right-6 border-l-4 border-[#0043f3] bg-white/95 p-5 text-[#071d2b] backdrop-blur sm:bottom-10 sm:left-10 sm:max-w-md">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#0043f3]">Featured project</p>
                <p className="mt-2 text-xl font-bold">Centurion Golf Club solar carports</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1500px]">
          <div className="mb-10 flex flex-col gap-6 border-b border-[#cbd7df] pb-8 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="text-xs font-bold uppercase tracking-[0.25em] text-[#0043f3]">Built work</p><h2 className="mt-3 text-3xl font-bold sm:text-5xl">Projects in the field.</h2></div>
            <div className="flex gap-2" aria-label="Filter projects">
              {filters.map((filter) => <button key={filter} type="button" onClick={() => setActiveFilter(filter)} className={`min-h-11 border px-5 text-sm font-bold transition ${activeFilter === filter ? 'border-[#0043f3] bg-[#0043f3] text-white' : 'border-[#cbd7df] bg-white hover:border-[#0043f3]'}`}>{filter}</button>)}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {visibleProjects.map((project, index) => (
              <button key={project.title} type="button" onClick={() => openProject(project)} className="group overflow-hidden rounded-[1.75rem] border border-[#d7e0e6] bg-white text-left transition hover:-translate-y-1 hover:border-[#0043f3] hover:shadow-xl sm:rounded-[2.25rem]">
                <div className="relative aspect-[4/3] overflow-hidden bg-[#dce5ea] sm:aspect-[16/10]">
                  <Image src={project.cover} alt={project.title} fill className="object-cover transition duration-700 group-hover:scale-[1.03]" sizes="(max-width: 1024px) 100vw, 50vw" />
                  <span className={`absolute left-5 top-5 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] ${project.system === 'Atlas' ? 'bg-[#0043f3] text-white' : 'bg-white text-[#071d2b]'}`}>{project.system} system</span>
                </div>
                <div className="p-6 sm:p-8">
                  <div className="flex items-center justify-between gap-4 text-xs font-bold uppercase tracking-[0.16em] text-[#667b91]"><span>{project.location}</span><span>{String(index + 1).padStart(2, '0')}</span></div>
                  <h3 className="mt-4 text-2xl font-bold leading-tight sm:text-3xl">{project.title}</h3>
                  <div className="mt-6 flex items-center justify-between border-t border-[#d7e0e6] pt-5"><span className="text-sm text-[#52677d]">{project.application} · {project.stage}</span><span className="text-sm font-bold text-[#0043f3]">View project →</span></div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-8 rounded-[2rem] bg-[#c1d9e5] px-7 py-10 sm:px-12 lg:flex-row lg:items-center lg:justify-between lg:py-14">
          <div><p className="text-xs font-bold uppercase tracking-[0.25em] text-[#0043f3]">Plan your project</p><h2 className="mt-3 max-w-3xl text-3xl font-bold sm:text-5xl">Move from inspiration to a practical starting price.</h2></div>
          <div className="flex flex-col gap-3 sm:flex-row"><Link href="/products" className="flex min-h-12 items-center justify-center border border-[#071d2b] px-6 font-bold hover:bg-white">Explore products</Link><Link href="/warehouse-builder" className="flex min-h-12 items-center justify-center bg-[#0043f3] px-6 font-bold text-white hover:bg-[#0038ce]">Build a warehouse</Link></div>
        </div>
      </section>

      {modalProject && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#071d2b]/90 p-3 sm:p-6" onClick={() => setModalProject(null)} role="presentation">
          <div className="relative grid max-h-[94vh] w-full max-w-7xl overflow-y-auto bg-white lg:grid-cols-[1.35fr_0.65fr]" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label={modalProject.title}>
            <div className="relative min-h-[55vh] bg-[#e6edf1] lg:min-h-[82vh]">
              <Image src={modalProject.gallery[currentImageIdx]} alt={`${modalProject.title}, image ${currentImageIdx + 1}`} fill className="object-contain" sizes="(max-width: 1024px) 100vw, 68vw" />
              <button type="button" onClick={() => changeImage(-1)} aria-label="Previous image" className="absolute left-4 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center bg-white shadow"><FaChevronLeft /></button>
              <button type="button" onClick={() => changeImage(1)} aria-label="Next image" className="absolute right-4 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center bg-white shadow"><FaChevronRight /></button>
            </div>
            <div className="flex flex-col p-6 sm:p-9">
              <button type="button" onClick={() => setModalProject(null)} className="ml-auto text-sm font-bold uppercase tracking-[0.18em] text-[#52677d]">Close ×</button>
              <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-[#0043f3]">{modalProject.system} · {modalProject.stage}</p>
              <h2 className="mt-3 text-3xl font-bold leading-tight">{modalProject.title}</h2>
              <p className="mt-5 leading-7 text-[#52677d]">{modalProject.description}</p>
              <dl className="mt-8 space-y-4 border-t border-[#d7e0e6] pt-6 text-sm"><div className="flex justify-between gap-6"><dt className="text-[#789]">Location</dt><dd className="text-right font-bold">{modalProject.location}</dd></div><div className="flex justify-between gap-6"><dt className="text-[#789]">Application</dt><dd className="text-right font-bold">{modalProject.application}</dd></div></dl>
              <div className="mt-8 flex gap-2 overflow-x-auto pb-2">{modalProject.gallery.map((image, index) => <button key={image} type="button" onClick={() => setCurrentImageIdx(index)} className={`relative h-16 w-20 flex-none overflow-hidden border-2 ${index === currentImageIdx ? 'border-[#0043f3]' : 'border-transparent'}`} aria-label={`View image ${index + 1}`}><Image src={image} alt="" fill className="object-cover" sizes="80px" /></button>)}</div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
