"use client";

import { useState } from "react";
import { MessageSquare, Sparkles, Send, Loader2 } from "lucide-react";
import type { ProjectQuestion } from "@/lib/types";

interface Props {
  projectId: string;
  questions: ProjectQuestion[];
  onUpdate: () => void;
}

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function QuestionReply({
  projectId,
  questions,
  onUpdate,
}: Props) {
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [polished, setPolished] = useState("");
  const [polishing, setPolishing] = useState(false);
  const [sending, setSending] = useState(false);

  const handlePolish = async (questionId: string) => {
    if (!draft.trim()) return;
    setPolishing(true);
    try {
      const question = questions.find((q) => q.id === questionId);
      const res = await fetch("/api/ai/polish-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question_text: question?.question_text || "",
          draft_reply: draft,
          project_id: projectId,
        }),
      });
      const data = await res.json();
      setPolished(data.polished || draft);
    } catch {
      setPolished(draft);
    } finally {
      setPolishing(false);
    }
  };

  const handleSend = async (questionId: string) => {
    const replyText = polished || draft;
    if (!replyText.trim()) return;
    setSending(true);
    await fetch(
      `/api/admin/projects/${projectId}/questions/${questionId}/reply`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          draft: draft,
          reply_text: replyText,
          polished: true,
        }),
      }
    );
    setDraft("");
    setPolished("");
    setReplyingTo(null);
    setSending(false);
    onUpdate();
  };

  const pending = questions.filter((q) => !q.reply_text);
  const replied = questions.filter((q) => q.reply_text);

  return (
    <div>
      {questions.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
          <MessageSquare className="mx-auto mb-2 text-white/20" size={24} />
          <p className="text-white/40 text-sm">
            No questions from the client yet.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Pending questions */}
          {pending.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-3">
                Needs Reply ({pending.length})
              </h3>
              <div className="space-y-3">
                {pending.map((q) => (
                  <div
                    key={q.id}
                    className="bg-white/5 border border-yellow-500/20 rounded-xl p-5"
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <p className="text-white text-sm">{q.question_text}</p>
                        <p className="text-white/30 text-xs mt-1">
                          {q.client_email} · {relativeTime(q.created_at)}
                        </p>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400">
                        Pending
                      </span>
                    </div>

                    {replyingTo === q.id ? (
                      <div className="mt-4 space-y-3">
                        {/* Draft input */}
                        <textarea
                          value={draft}
                          onChange={(e) => {
                            setDraft(e.target.value);
                            setPolished("");
                          }}
                          placeholder="Type your reply..."
                          rows={3}
                          className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#03FF00] transition-colors"
                        />

                        {/* Polished preview */}
                        {polished && (
                          <div className="bg-[#03FF00]/5 border border-[#03FF00]/20 rounded-lg p-3">
                            <p className="text-xs text-[#03FF00] font-medium mb-1.5 flex items-center gap-1">
                              <Sparkles size={10} /> AI-Polished Reply
                            </p>
                            <textarea
                              value={polished}
                              onChange={(e) => setPolished(e.target.value)}
                              rows={3}
                              className="w-full bg-transparent text-sm text-white/80 focus:outline-none resize-none"
                            />
                          </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handlePolish(q.id)}
                            disabled={polishing || !draft.trim()}
                            className="flex items-center gap-1.5 bg-white/5 border border-white/10 text-white/60 px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-30 hover:bg-white/10 transition-colors"
                          >
                            {polishing ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <Sparkles size={12} />
                            )}
                            {polishing ? "Polishing..." : "Polish with AI"}
                          </button>
                          <button
                            onClick={() => handleSend(q.id)}
                            disabled={
                              sending || (!draft.trim() && !polished.trim())
                            }
                            className="flex items-center gap-1.5 bg-[#03FF00] text-[#033457] px-3 py-1.5 rounded-lg text-xs font-bold disabled:opacity-30 hover:bg-[#02dd00] transition-colors"
                          >
                            {sending ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <Send size={12} />
                            )}
                            {sending ? "Sending..." : "Send Reply"}
                          </button>
                          <button
                            onClick={() => {
                              setReplyingTo(null);
                              setDraft("");
                              setPolished("");
                            }}
                            className="text-white/30 hover:text-white/60 text-xs transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setReplyingTo(q.id);
                          setDraft("");
                          setPolished("");
                        }}
                        className="mt-2 text-[#03FF00] text-xs font-medium hover:underline"
                      >
                        Write Reply →
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Replied questions */}
          {replied.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-3">
                Replied ({replied.length})
              </h3>
              <div className="space-y-3">
                {replied.map((q) => (
                  <div
                    key={q.id}
                    className="bg-white/5 border border-white/10 rounded-xl p-5"
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <p className="text-white/60 text-sm">
                        {q.question_text}
                      </p>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 shrink-0">
                        Replied
                      </span>
                    </div>
                    <p className="text-white/30 text-xs mb-3">
                      {q.client_email} · {relativeTime(q.created_at)}
                    </p>
                    <div className="bg-white/5 rounded-lg p-3 border-l-2 border-[#03FF00]/30">
                      <p className="text-white/70 text-sm">{q.reply_text}</p>
                      <p className="text-white/20 text-xs mt-2">
                        Replied {q.replied_at ? relativeTime(q.replied_at) : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
