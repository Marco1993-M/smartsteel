'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const articles = [
  {
    slug: 'how-to-choose-a-steel-warehouse-supplier-in-south-africa',
    category: 'Buyer guides',
    date: '22 June 2026',
    readTime: '4 min read',
    title: 'How to choose a steel warehouse supplier in South Africa',
    excerpt:
      'A practical guide to comparing warehouse suppliers, pricing clarity, lead times, structural systems, and support before you commit.',
    image: '/warehouse.jpg',
    featured: true,
  },
  {
    slug: 'resilient-outcomes-of-lightweight-steel',
    category: 'Industry news',
    date: '2 July 2025',
    readTime: '2 min read',
    title: 'Resilient outcomes with lightweight steel',
    excerpt:
      'Framing made from lightweight steel offers a resilient and reliable solution for modern construction.',
    image: '/news1.jpg',
  },
  {
    slug: 'smart-steel-unveils-new-modular-warehouses',
    category: 'Company news',
    date: '15 June 2025',
    readTime: '3 min read',
    title: 'Smart Steel unveils new modular kits',
    excerpt:
      'A streamlined range of modular steel kits designed to fast-track residential builds.',
    image: '/news2.jpg',
  },
];

const sortOptions = [
  { label: 'Most Recent', value: 'recent' },
  { label: 'Least Recent', value: 'oldest' },
  { label: 'Alphabetical (A–Z)', value: 'az' },
  { label: 'Alphabetical (Z–A)', value: 'za' },
];

export default function NewsPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('recent');

  const filtered = articles.filter((a) =>
    selectedCategory === 'All' ? true : a.category === selectedCategory
  );

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'az') return a.title.localeCompare(b.title);
    if (sortBy === 'za') return b.title.localeCompare(a.title);
    if (sortBy === 'recent') return new Date(b.date) - new Date(a.date);
    if (sortBy === 'oldest') return new Date(a.date) - new Date(b.date);
    return 0;
  });

  return (
    <main className="max-w-7xl mx-auto px-6 py-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
        <h1 className="text-3xl font-semibold mb-4 md:mb-0">News & Events</h1>
        <div className="w-full md:w-auto">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border rounded-md px-4 py-2 text-sm"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-10">
        {/* LEFT FILTERS */}
        <aside className="col-span-1">
          <h2 className="text-lg font-semibold mb-4">Filter by Category</h2>
          <ul className="space-y-2 text-sm text-gray-700">
            {['All', 'Buyer guides', 'Industry news', 'Company news'].map((category) => (
              <li key={category}>
                <button
                  onClick={() => setSelectedCategory(category)}
                  className={`block w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 ${
                    selectedCategory === category
                      ? 'bg-gray-100 font-medium'
                      : ''
                  }`}
                >
                  {category}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* RIGHT CONTENT */}
        <div className="col-span-2 space-y-12">
          {/* Featured Article */}
          {sorted
            .filter((a) => a.featured)
            .map((article) => (
              <div key={article.slug} className="group">
                <div className="w-full h-64 relative mb-4 rounded-xl overflow-hidden">
                  <Image
                    src={article.image}
                    alt={article.title}
                    layout="fill"
                    objectFit="cover"
                    className="group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <p className="text-sm text-gray-500">
                  {article.date} | {article.readTime}
                </p>
                <h2 className="text-2xl font-semibold mt-2 mb-1">
                  {article.title}
                </h2>
                <p className="text-gray-600">{article.excerpt}</p>
                <Link
                  href={`/news/${article.slug}`}
                  className="text-[#da1a33] text-sm font-medium mt-2 inline-block"
                >
                  Read article →
                </Link>
              </div>
            ))}

          {/* Remaining Articles in Grid */}
          <div className="grid sm:grid-cols-2 gap-8">
            {sorted
              .filter((a) => !a.featured)
              .map((article) => (
                <div key={article.slug} className="group">
                  <div className="w-full h-48 relative mb-3 rounded-lg overflow-hidden">
                    <Image
                      src={article.image}
                      alt={article.title}
                      layout="fill"
                      objectFit="cover"
                      className="group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <p className="text-sm text-gray-500">
                    {article.date} | {article.readTime}
                  </p>
                  <h3 className="text-lg font-semibold mt-1 mb-1">
                    {article.title}
                  </h3>
                  <p className="text-sm text-gray-600">{article.excerpt}</p>
                  <Link
                    href={`/news/${article.slug}`}
                    className="text-[#da1a33] text-sm font-medium mt-2 inline-block"
                  >
                    Read article →
                  </Link>
                </div>
              ))}
          </div>
        </div>
      </div>
    </main>
  );
}
