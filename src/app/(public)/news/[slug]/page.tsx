// SPEC: SPEC-PAGES > /news/[slug] — Article detail page
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getArticleBySlug } from "@/lib/db/queries/news";
import type { Metadata } from "next";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  let article: Awaited<ReturnType<typeof getArticleBySlug>> | null = null;

  try {
    article = await getArticleBySlug(slug);
  } catch {
    return {};
  }

  if (!article) return {};

  return {
    title: article.metaTitle || `${article.title} — BotMakers Inc.`,
    description: article.metaDescription || article.excerpt || undefined,
    openGraph: {
      title: article.metaTitle || article.title,
      description: article.metaDescription || article.excerpt || undefined,
      images: article.featuredImageUrl
        ? [{ url: article.featuredImageUrl }]
        : undefined,
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  let article: Awaited<ReturnType<typeof getArticleBySlug>> | null = null;

  try {
    article = await getArticleBySlug(slug);
  } catch {
    notFound();
  }

  if (!article) notFound();

  return (
    <div className="pt-20 lg:pt-24">
      {/* Back link */}
      <div className="max-w-3xl mx-auto px-6 lg:px-12 pt-8">
        <Link
          href="/news"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#033457] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to News
        </Link>
      </div>

      {/* Article header */}
      <header className="max-w-3xl mx-auto px-6 lg:px-12 pt-8 pb-8">
        <div className="flex items-center gap-3 text-sm text-gray-400 mb-6">
          {article.publishedAt && (
            <time>
              {new Date(article.publishedAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </time>
          )}
          {article.authorName && (
            <>
              <span>&middot;</span>
              <span>{article.authorName}</span>
            </>
          )}
        </div>
        <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-[#033457] leading-tight">
          {article.title}
        </h1>
        {article.tags && (article.tags as string[]).length > 0 && (
          <div className="flex flex-wrap gap-2 mt-6">
            {(article.tags as string[]).map((tag) => (
              <span
                key={tag}
                className="text-xs font-medium px-3 py-1 rounded-full bg-[#033457]/5 text-[#033457]"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* Featured image */}
      {article.featuredImageUrl && (
        <div className="max-w-4xl mx-auto px-6 lg:px-12 mb-12">
          <div className="relative h-64 md:h-96 rounded-xl overflow-hidden">
            <Image
              src={article.featuredImageUrl}
              alt={article.title}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 900px"
              priority
            />
          </div>
        </div>
      )}

      {/* Article content */}
      <article className="max-w-3xl mx-auto px-6 lg:px-12 pb-20">
        <div
          className="article-content"
          dangerouslySetInnerHTML={{ __html: article.content ?? "" }}
        />
      </article>
    </div>
  );
}
