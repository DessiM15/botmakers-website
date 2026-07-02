// SPEC: SPEC-PAGES > /news — Public news listing
import Link from "next/link";
import Image from "next/image";
import { getPublishedArticles } from "@/lib/db/queries/news";

export const metadata = {
  title: "News — BotMakers Inc.",
  description:
    "Latest news, press releases, and company updates from BotMakers Inc.",
};

export default async function NewsPage() {
  let articles: Awaited<ReturnType<typeof getPublishedArticles>>["data"] = [];
  let totalPages = 0;

  try {
    const result = await getPublishedArticles({ limit: 12 });
    articles = result.data;
    totalPages = result.totalPages;
  } catch {
    // Table may not exist yet
  }

  return (
    <div className="pt-20 lg:pt-24">
      {/* Header */}
      <section className="bg-[#033457] py-20 lg:py-28">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-12">
          <p className="text-sm font-medium text-[#03FF00] tracking-widest uppercase mb-4">
            Newsroom
          </p>
          <h1 className="text-4xl lg:text-6xl font-bold tracking-tight text-white">
            Company News
          </h1>
          <p className="text-xl text-gray-300 mt-4 max-w-2xl">
            Press releases, company updates, and industry insights from
            BotMakers Inc.
          </p>
        </div>
      </section>

      {/* Articles grid */}
      <section className="py-16 lg:py-24">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-12">
          {articles.length === 0 ? (
            <div className="text-center py-20">
              <h2 className="text-2xl font-semibold text-[#033457] mb-3">
                No articles yet
              </h2>
              <p className="text-gray-500">
                Check back soon for news and updates from BotMakers Inc.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((article) => (
                <Link
                  key={article.id}
                  href={`/news/${article.slug}`}
                  className="group"
                >
                  <article className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-[#033457]/10 transition-all h-full flex flex-col">
                    {article.featuredImageUrl ? (
                      <div className="relative h-52 bg-gray-100">
                        <Image
                          src={article.featuredImageUrl}
                          alt={article.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      </div>
                    ) : (
                      <div className="h-52 bg-gradient-to-br from-[#033457] to-[#033457]/80 flex items-center justify-center">
                        <span className="text-[#03FF00] text-4xl font-bold opacity-20">
                          B
                        </span>
                      </div>
                    )}
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-center gap-3 mb-3">
                        {article.publishedAt && (
                          <time className="text-xs text-gray-400 uppercase tracking-wide">
                            {new Date(article.publishedAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                          </time>
                        )}
                      </div>
                      <h2 className="text-lg font-semibold text-[#033457] mb-2 group-hover:text-[#03FF00] transition-colors line-clamp-2">
                        {article.title}
                      </h2>
                      {article.excerpt && (
                        <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed flex-1">
                          {article.excerpt}
                        </p>
                      )}
                      <p className="text-sm font-medium text-[#033457] mt-4 group-hover:text-[#03FF00] transition-colors">
                        Read more &rarr;
                      </p>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-12 text-center text-sm text-gray-400">
              Showing page 1 of {totalPages}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
