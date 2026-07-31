import Link from "next/link";

import { buyerIntentArticles } from "@/data/buyerIntentArticles";

export const metadata = {
  title: "Articles | Pequeno",
  description:
    "Read Pequeno articles on lightweight steel frame homes, modular architecture, off-grid planning, and architect-led building in South Africa.",
  alternates: {
    canonical: "https://www.pequenohome.com/articles",
  },
};

const articles = [
  ...buyerIntentArticles,
  {
    title: "Exploring Modular Architecture",
    description:
      "A look at how modular architecture can support better design control, cleaner delivery, and more considered building outcomes in South Africa.",
    href: "/articles/modular-architecture",
    category: "Architecture",
  },
];

export default function ArticlesPage() {
  return (
    <main className="px-6 py-20 text-gray-900">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#c45734]">
            Articles
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight md:text-6xl">
            Ideas, insights, and building guidance
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Explore articles from Pequeno on lightweight steel frame homes,
            modular architecture, and the practical thinking behind more
            considered homes and buildings in South Africa.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {articles.map((article) => (
            <Link
              key={article.href}
              href={article.href}
              className="rounded-[2rem] border border-black/10 bg-white p-8 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <p className="text-xs uppercase tracking-[0.22em] text-gray-500">
                {article.category}
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-gray-900">
                {article.title}
              </h2>
              <p className="mt-4 text-base leading-7 text-gray-700">
                {article.description}
              </p>
              <p className="mt-6 text-sm font-medium text-[#ff5c36]">
                Read article →
              </p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
