// SPEC: SPEC-PAGES > Admin > Article editor form (create + edit)
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TiptapEditor } from "./tiptap-editor";
import { createArticle, updateArticle } from "@/lib/actions/news";
import { slugify } from "@/lib/utils/slugify";
import { Loader2, Upload, X } from "lucide-react";
import type { ArticleWithAuthor } from "@/lib/types/news";

interface ArticleEditorProps {
  article?: ArticleWithAuthor | null;
}

export function ArticleEditor({ article }: ArticleEditorProps) {
  const router = useRouter();
  const isEditing = !!article;
  const [isPending, setIsPending] = useState(false);

  const [title, setTitle] = useState(article?.title ?? "");
  const [slug, setSlug] = useState(article?.slug ?? "");
  const [content, setContent] = useState(article?.content ?? "");
  const [excerpt, setExcerpt] = useState(article?.excerpt ?? "");
  const [status, setStatus] = useState<string>(article?.status ?? "draft");
  const [featuredImageUrl, setFeaturedImageUrl] = useState(
    article?.featuredImageUrl ?? ""
  );
  const [tags, setTags] = useState(
    (article?.tags ?? []).join(", ")
  );
  const [metaTitle, setMetaTitle] = useState(article?.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(
    article?.metaDescription ?? ""
  );
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!isEditing && title) {
      setSlug(slugify(title));
    }
  }, [title, isEditing]);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const result = await res.json();

      if (!res.ok || !result.success) {
        toast.error(result?.error?.message ?? "Upload failed");
        return;
      }

      setFeaturedImageUrl(result.data.url);
      toast.success("Image uploaded");
    } catch {
      toast.error("Upload failed");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsPending(true);

    const parsedTags = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const input = {
      title,
      slug,
      content,
      excerpt,
      status: status as "draft" | "published" | "archived" | "scheduled",
      featured_image_url: featuredImageUrl || "",
      tags: parsedTags,
      meta_title: metaTitle,
      meta_description: metaDescription,
    };

    const result = isEditing
      ? await updateArticle(article.id, input)
      : await createArticle(input);

    setIsPending(false);

    if (result.success) {
      toast.success(isEditing ? "Article updated" : "Article created");
      router.push("/admin/news");
    } else {
      toast.error(result.error?.message ?? "Something went wrong");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column — content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-white">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Article title"
              required
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug" className="text-white">
              Slug
            </Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="article-url-slug"
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white">Content</Label>
            <TiptapEditor content={content} onChange={setContent} />
          </div>
        </div>

        {/* Right column — metadata */}
        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="text-white">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-white">Featured Image</Label>
            {featuredImageUrl ? (
              <div className="relative group rounded-lg overflow-hidden border border-white/10">
                <img
                  src={featuredImageUrl}
                  alt="Featured"
                  className="w-full h-40 object-cover"
                />
                <button
                  type="button"
                  onClick={() => setFeaturedImageUrl("")}
                  className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-white/10 rounded-lg cursor-pointer hover:border-white/20 transition-colors">
                {isUploading ? (
                  <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-400">Upload image</span>
                    <span className="text-xs text-gray-500 mt-1">
                      JPEG, PNG, WebP &middot; Max 5MB
                    </span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={isUploading}
                />
              </label>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags" className="text-white">
              Tags
            </Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="press-release, company-news"
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
            />
            <p className="text-xs text-gray-500">Comma-separated</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt" className="text-white">
              Excerpt
            </Label>
            <Textarea
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Short summary for listings..."
              rows={3}
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 resize-none"
            />
          </div>

          <div className="border-t border-white/10 pt-4 space-y-4">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
              SEO
            </p>
            <div className="space-y-2">
              <Label htmlFor="metaTitle" className="text-white">
                Meta Title
              </Label>
              <Input
                id="metaTitle"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder="SEO title (max 70 chars)"
                maxLength={70}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="metaDesc" className="text-white">
                Meta Description
              </Label>
              <Textarea
                id="metaDesc"
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="SEO description (max 160 chars)"
                maxLength={160}
                rows={2}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 resize-none"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isPending}
              className="flex-1 bg-[#03FF00] text-[#033457] hover:bg-[#03FF00]/90 font-semibold"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isEditing ? (
                "Update Article"
              ) : (
                "Create Article"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/news")}
              className="border-white/10 text-gray-300 hover:text-white hover:bg-white/5"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
