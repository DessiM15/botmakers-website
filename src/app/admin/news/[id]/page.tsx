// SPEC: SPEC-PAGES > /admin/news/[id] — Edit article
import { notFound } from "next/navigation";
import { requireTeam } from "@/lib/auth/helpers";
import { getArticleById } from "@/lib/db/queries/news";
import { ArticleEditor } from "@/components/admin/article-editor";

export const metadata = { title: "Edit Article — Botmakers CRM" };

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireTeam();
  const { id } = await params;
  const article = await getArticleById(id);

  if (!article) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Edit Article</h1>
        <p className="text-sm text-gray-400 mt-1">{article.title}</p>
      </div>
      <ArticleEditor article={article} />
    </div>
  );
}
