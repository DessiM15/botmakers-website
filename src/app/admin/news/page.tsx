// SPEC: SPEC-PAGES > /admin/news — News article listing
import Link from "next/link";
import { getArticles, getArticleCountsByStatus } from "@/lib/db/queries/news";
import { requireTeam } from "@/lib/auth/helpers";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Eye, Archive, Clock } from "lucide-react";

export const metadata = { title: "News — Botmakers CRM" };

const STATUS_BADGES: Record<string, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-yellow-500/10 text-yellow-400" },
  published: { label: "Published", className: "bg-[#03FF00]/10 text-[#03FF00]" },
  archived: { label: "Archived", className: "bg-gray-500/10 text-gray-400" },
  scheduled: { label: "Scheduled", className: "bg-blue-500/10 text-blue-400" },
};

export default async function AdminNewsPage() {
  await requireTeam();
  const [{ data: articles }, counts] = await Promise.all([
    getArticles({ perPage: 50 }),
    getArticleCountsByStatus(),
  ]);

  const statCards = [
    { label: "Draft", count: counts.draft, icon: FileText, color: "text-yellow-400" },
    { label: "Published", count: counts.published, icon: Eye, color: "text-[#03FF00]" },
    { label: "Scheduled", count: counts.scheduled, icon: Clock, color: "text-blue-400" },
    { label: "Archived", count: counts.archived, icon: Archive, color: "text-gray-400" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">News</h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage articles and press releases
          </p>
        </div>
        <Link href="/admin/news/new">
          <Button className="bg-[#03FF00] text-[#033457] hover:bg-[#03FF00]/90 font-semibold">
            <Plus className="w-4 h-4 mr-2" />
            New Article
          </Button>
        </Link>
      </div>

      {/* Status summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white/5 border border-white/10 rounded-lg p-4"
          >
            <div className="flex items-center gap-3">
              <card.icon className={`w-5 h-5 ${card.color}`} />
              <div>
                <p className="text-2xl font-bold text-white">{card.count}</p>
                <p className="text-xs text-gray-400">{card.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Article list */}
      {articles.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-white/10 rounded-lg">
          <FileText className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No articles yet</h3>
          <p className="text-sm text-gray-400 mb-6">
            Create your first article to get started with news publishing.
          </p>
          <Link href="/admin/news/new">
            <Button className="bg-[#03FF00] text-[#033457] hover:bg-[#03FF00]/90">
              <Plus className="w-4 h-4 mr-2" />
              Create Article
            </Button>
          </Link>
        </div>
      ) : (
        <div className="border border-white/10 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-4 py-3">
                  Title
                </th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-4 py-3 hidden md:table-cell">
                  Status
                </th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-4 py-3 hidden lg:table-cell">
                  Author
                </th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-4 py-3 hidden md:table-cell">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {articles.map((article) => {
                const badge = STATUS_BADGES[article.status] ?? STATUS_BADGES.draft;
                const date = article.publishedAt ?? article.createdAt;
                return (
                  <tr
                    key={article.id}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/news/${article.id}`}
                        className="text-sm font-medium text-white hover:text-[#03FF00] transition-colors"
                      >
                        {article.title}
                      </Link>
                      {article.excerpt && (
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                          {article.excerpt}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span
                        className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400 hidden lg:table-cell">
                      {article.authorName ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400 hidden md:table-cell">
                      {date
                        ? new Date(date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
