// SPEC: CLAUDE.md > All DB queries in src/lib/db/queries/
// DEP-MAP: News Management > SERVER > getArticles, getArticleById, getArticleBySlug
import { eq, and, or, desc, asc, ilike, count } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { articles, teamUsers } from "@/lib/db/schema";
import type { ArticleFilters } from "@/lib/types/news";

export async function getArticles(filters: ArticleFilters = {}) {
  const {
    search,
    status,
    page = 1,
    perPage = 25,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = filters;

  const conditions = [];

  if (search) {
    conditions.push(
      or(
        ilike(articles.title, `%${search}%`),
        ilike(articles.excerpt, `%${search}%`)
      )
    );
  }

  if (status) conditions.push(eq(articles.status, status));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const orderFn = sortOrder === "asc" ? asc : desc;
  const orderColumn = sortBy === "publishedAt" ? articles.publishedAt : articles.createdAt;

  const [data, [total]] = await Promise.all([
    db
      .select({
        id: articles.id,
        title: articles.title,
        slug: articles.slug,
        excerpt: articles.excerpt,
        content: articles.content,
        featuredImageUrl: articles.featuredImageUrl,
        status: articles.status,
        publishedAt: articles.publishedAt,
        scheduledAt: articles.scheduledAt,
        tags: articles.tags,
        metaTitle: articles.metaTitle,
        metaDescription: articles.metaDescription,
        createdBy: articles.createdBy,
        createdAt: articles.createdAt,
        updatedAt: articles.updatedAt,
        authorName: teamUsers.fullName,
      })
      .from(articles)
      .leftJoin(teamUsers, eq(articles.createdBy, teamUsers.id))
      .where(where)
      .orderBy(orderFn(orderColumn))
      .limit(perPage)
      .offset((page - 1) * perPage),
    db
      .select({ count: count() })
      .from(articles)
      .where(where),
  ]);

  return {
    data,
    total: total?.count ?? 0,
    page,
    perPage,
    totalPages: Math.ceil((total?.count ?? 0) / perPage),
  };
}

export async function getArticleById(id: string) {
  const [article] = await db
    .select({
      id: articles.id,
      title: articles.title,
      slug: articles.slug,
      excerpt: articles.excerpt,
      content: articles.content,
      featuredImageUrl: articles.featuredImageUrl,
      status: articles.status,
      publishedAt: articles.publishedAt,
      scheduledAt: articles.scheduledAt,
      tags: articles.tags,
      metaTitle: articles.metaTitle,
      metaDescription: articles.metaDescription,
      createdBy: articles.createdBy,
      createdAt: articles.createdAt,
      updatedAt: articles.updatedAt,
      authorName: teamUsers.fullName,
    })
    .from(articles)
    .leftJoin(teamUsers, eq(articles.createdBy, teamUsers.id))
    .where(eq(articles.id, id))
    .limit(1);

  return article ?? null;
}

export async function getArticleBySlug(slug: string) {
  const [article] = await db
    .select({
      id: articles.id,
      title: articles.title,
      slug: articles.slug,
      excerpt: articles.excerpt,
      content: articles.content,
      featuredImageUrl: articles.featuredImageUrl,
      status: articles.status,
      publishedAt: articles.publishedAt,
      scheduledAt: articles.scheduledAt,
      tags: articles.tags,
      metaTitle: articles.metaTitle,
      metaDescription: articles.metaDescription,
      createdBy: articles.createdBy,
      createdAt: articles.createdAt,
      updatedAt: articles.updatedAt,
      authorName: teamUsers.fullName,
    })
    .from(articles)
    .leftJoin(teamUsers, eq(articles.createdBy, teamUsers.id))
    .where(and(eq(articles.slug, slug), eq(articles.status, "published")))
    .limit(1);

  return article ?? null;
}

export async function getPublishedArticles({
  limit = 10,
  page = 1,
}: { limit?: number; page?: number } = {}) {
  const [data, [total]] = await Promise.all([
    db
      .select({
        id: articles.id,
        title: articles.title,
        slug: articles.slug,
        excerpt: articles.excerpt,
        featuredImageUrl: articles.featuredImageUrl,
        publishedAt: articles.publishedAt,
        tags: articles.tags,
        authorName: teamUsers.fullName,
      })
      .from(articles)
      .leftJoin(teamUsers, eq(articles.createdBy, teamUsers.id))
      .where(eq(articles.status, "published"))
      .orderBy(desc(articles.publishedAt))
      .limit(limit)
      .offset((page - 1) * limit),
    db
      .select({ count: count() })
      .from(articles)
      .where(eq(articles.status, "published")),
  ]);

  return {
    data,
    total: total?.count ?? 0,
    page,
    perPage: limit,
    totalPages: Math.ceil((total?.count ?? 0) / limit),
  };
}

export async function getArticleCountsByStatus() {
  const all = await db
    .select({ status: articles.status, count: count() })
    .from(articles)
    .groupBy(articles.status);

  const counts: Record<string, number> = {
    draft: 0,
    published: 0,
    archived: 0,
    scheduled: 0,
  };

  for (const row of all) {
    counts[row.status] = row.count;
  }

  return counts;
}
