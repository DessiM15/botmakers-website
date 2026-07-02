// SPEC: CLAUDE.md > Use Server Actions for mutations
// DEP-MAP: News Management > SERVER > createArticle, updateArticle, deleteArticle
"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { articles, activityLog, auditLog } from "@/lib/db/schema";
import { requireTeam } from "@/lib/auth/helpers";
import { getArticleById } from "@/lib/db/queries/news";
import { slugify } from "@/lib/utils/slugify";
import { articleCreateSchema, articleUpdateSchema } from "@/lib/types/schemas";
import type { ArticleCreateInput, ArticleUpdateInput } from "@/lib/types/schemas";

export async function createArticle(input: ArticleCreateInput) {
  try {
    const user = await requireTeam();
    const parsed = articleCreateSchema.safeParse(input);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return {
        success: false,
        error: { code: "CB-API-002", message: firstError?.message ?? "Invalid input" },
      };
    }

    const data = parsed.data;
    const slug = data.slug
      ? slugify(data.slug)
      : slugify(data.title) + "-" + Date.now().toString(36);

    const [article] = await db
      .insert(articles)
      .values({
        title: data.title,
        slug,
        excerpt: data.excerpt || null,
        content: data.content || null,
        featuredImageUrl: data.featured_image_url || null,
        status: data.status,
        publishedAt: data.status === "published" ? new Date() : null,
        scheduledAt: data.scheduled_at ? new Date(data.scheduled_at) : null,
        tags: data.tags,
        metaTitle: data.meta_title || null,
        metaDescription: data.meta_description || null,
        createdBy: user.id,
      })
      .returning();

    await db.insert(activityLog).values({
      actorId: user.id,
      actorType: "team",
      action: "article.created",
      entityType: "article",
      entityId: article.id,
      metadata: { title: article.title, status: article.status },
    }).catch(() => {});

    revalidatePath("/admin/news");
    revalidatePath("/news");

    return { success: true, data: article };
  } catch {
    return {
      success: false,
      error: { code: "CB-DB-001", message: "Failed to create article" },
    };
  }
}

export async function updateArticle(id: string, input: ArticleUpdateInput) {
  try {
    const user = await requireTeam();
    const parsed = articleUpdateSchema.safeParse(input);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return {
        success: false,
        error: { code: "CB-API-002", message: firstError?.message ?? "Invalid input" },
      };
    }

    const existing = await getArticleById(id);
    if (!existing) {
      return { success: false, error: { code: "CB-DB-002", message: "Article not found" } };
    }

    const data = parsed.data;
    const updates: Record<string, unknown> = { updatedAt: new Date() };

    if (data.title !== undefined) updates.title = data.title;
    if (data.slug !== undefined) updates.slug = slugify(data.slug);
    if (data.excerpt !== undefined) updates.excerpt = data.excerpt || null;
    if (data.content !== undefined) updates.content = data.content || null;
    if (data.featured_image_url !== undefined) {
      updates.featuredImageUrl = data.featured_image_url || null;
    }
    if (data.tags !== undefined) updates.tags = data.tags;
    if (data.meta_title !== undefined) updates.metaTitle = data.meta_title || null;
    if (data.meta_description !== undefined) {
      updates.metaDescription = data.meta_description || null;
    }
    if (data.scheduled_at !== undefined) {
      updates.scheduledAt = data.scheduled_at ? new Date(data.scheduled_at) : null;
    }

    if (data.status !== undefined) {
      updates.status = data.status;
      if (data.status === "published" && existing.status !== "published") {
        updates.publishedAt = new Date();
      }
    }

    const [updated] = await db
      .update(articles)
      .set(updates)
      .where(eq(articles.id, id))
      .returning();

    if (!updated) {
      return { success: false, error: { code: "CB-DB-002", message: "Article not found" } };
    }

    await db.insert(activityLog).values({
      actorId: user.id,
      actorType: "team",
      action: "article.updated",
      entityType: "article",
      entityId: id,
      metadata: { changes: Object.keys(updates).filter((k) => k !== "updatedAt") },
    }).catch(() => {});

    revalidatePath("/admin/news");
    revalidatePath(`/admin/news/${id}`);
    revalidatePath("/news");
    if (updated.slug) revalidatePath(`/news/${updated.slug}`);

    return { success: true, data: updated };
  } catch {
    return {
      success: false,
      error: { code: "CB-DB-001", message: "Failed to update article" },
    };
  }
}

export async function deleteArticle(id: string) {
  try {
    const user = await requireTeam();

    const existing = await getArticleById(id);
    if (!existing) {
      return { success: false, error: { code: "CB-DB-002", message: "Article not found" } };
    }

    const [updated] = await db
      .update(articles)
      .set({ status: "archived", updatedAt: new Date() })
      .where(eq(articles.id, id))
      .returning();

    await db.insert(auditLog).values({
      actorId: user.id,
      action: "article.archived",
      entityType: "article",
      entityId: id,
      beforeState: { status: existing.status },
      afterState: { status: "archived" },
    }).catch(() => {});

    await db.insert(activityLog).values({
      actorId: user.id,
      actorType: "team",
      action: "article.archived",
      entityType: "article",
      entityId: id,
      metadata: { title: existing.title },
    }).catch(() => {});

    revalidatePath("/admin/news");
    revalidatePath("/news");

    return { success: true, data: updated };
  } catch {
    return {
      success: false,
      error: { code: "CB-DB-001", message: "Failed to archive article" },
    };
  }
}
