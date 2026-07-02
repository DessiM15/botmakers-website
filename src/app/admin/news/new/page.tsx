// SPEC: SPEC-PAGES > /admin/news/new — Create article
import { requireTeam } from "@/lib/auth/helpers";
import { ArticleEditor } from "@/components/admin/article-editor";

export const metadata = { title: "New Article — Botmakers CRM" };

export default async function NewArticlePage() {
  await requireTeam();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">New Article</h1>
        <p className="text-sm text-gray-400 mt-1">
          Create a news article or press release
        </p>
      </div>
      <ArticleEditor />
    </div>
  );
}
