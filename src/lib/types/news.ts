// SPEC: Article types for news system
import type { articles } from "@/lib/db/schema";

export type Article = typeof articles.$inferSelect;

export type ArticleStatus = "draft" | "published" | "archived" | "scheduled";

export interface ArticleFilters {
  search?: string;
  status?: ArticleStatus;
  tag?: string;
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface ArticleWithAuthor extends Article {
  authorName: string | null;
}
