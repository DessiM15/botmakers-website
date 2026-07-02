// SPEC: Homepage latest news preview — server component
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { getPublishedArticles } from "@/lib/db/queries/news";

export async function LatestNewsSection() {
  let articles: Awaited<ReturnType<typeof getPublishedArticles>>["data"] = [];

  try {
    const result = await getPublishedArticles({ limit: 3 });
    articles = result.data;
  } catch {
    // DB may not have articles table yet — graceful empty state
  }

  if (articles.length === 0) {
    return null;
  }

  return (
    <section className="py-28 lg:py-36 bg-gray-50">
      <div className="max-w-screen-xl mx-auto px-6 lg:px-12">
        <div className="flex items-end justify-between mb-16">
          <div>
            <p className="text-sm font-medium text-[#03FF00] tracking-widest uppercase mb-4">
              Latest News
            </p>
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-[#033457]">
              Company Updates
            </h2>
          </div>
          <Link
            href="/news"
            className="hidden md:inline-flex items-center gap-2 text-sm font-medium text-[#033457] hover:text-[#03FF00] transition-colors"
          >
            View All News
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/news/${article.slug}`}
              className="group"
            >
              <article className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-[#033457]/10 transition-all">
                {article.featuredImageUrl && (
                  <div className="relative h-48 bg-gray-100">
                    <Image
                      src={article.featuredImageUrl}
                      alt={article.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                )}
                <div className="p-6">
                  {article.publishedAt && (
                    <time className="text-xs text-gray-400 uppercase tracking-wide">
                      {new Date(article.publishedAt).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </time>
                  )}
                  <h3 className="text-lg font-semibold text-[#033457] mt-2 mb-2 group-hover:text-[#03FF00] transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  {article.excerpt && (
                    <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                      {article.excerpt}
                    </p>
                  )}
                </div>
              </article>
            </Link>
          ))}
        </div>

        <div className="md:hidden mt-8 text-center">
          <Link
            href="/news"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#033457] hover:text-[#03FF00] transition-colors"
          >
            View All News
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
