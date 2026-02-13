"use client";

import { useState } from "react";
import { Send, MessageSquare } from "lucide-react";
import type { ProjectQuestion } from "@/lib/types";

interface Props {
  projectId: string;
  questions: ProjectQuestion[];
  onSubmit: () => void;
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

export default function QuestionForm({
  projectId,
  questions,
  onSubmit,
}: Props) {
  const [question, setQuestion] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    setSubmitting(true);
    try {
      await fetch(`/api/portal/projects/${projectId}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question_text: question.trim() }),
      });
      setQuestion("");
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
      onSubmit();
    } catch {
      // silently fail
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="font-semibold text-[#033457]">Questions & Answers</h2>
      </div>

      {/* Ask form */}
      <form onSubmit={handleSubmit} className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        <p className="text-sm font-medium text-[#033457] mb-2">
          Have a Question?
        </p>
        <div className="flex gap-2">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Type your question here..."
            rows={2}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#033457]/20 focus:border-[#033457] transition-colors resize-none"
          />
          <button
            type="submit"
            disabled={submitting || !question.trim()}
            className="self-end bg-[#033457] text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-[#022a47] transition-colors flex items-center gap-1.5"
          >
            <Send size={14} />
            {submitting ? "..." : "Send"}
          </button>
        </div>
        {submitted && (
          <p className="text-xs text-green-600 mt-2">
            Question submitted! Our team will reply shortly.
          </p>
        )}
      </form>

      {/* Q&A list */}
      {questions.length > 0 ? (
        <div className="divide-y divide-gray-100">
          {questions.map((q) => (
            <div key={q.id} className="px-6 py-4">
              <div className="flex items-start gap-3 mb-2">
                <MessageSquare
                  size={14}
                  className="text-[#033457] mt-0.5 shrink-0"
                />
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{q.question_text}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {relativeTime(q.created_at)}
                  </p>
                </div>
              </div>
              {q.reply_text ? (
                <div className="ml-7 mt-2 bg-green-50 border-l-2 border-[#03FF00] rounded-r-lg p-3">
                  <p className="text-sm text-gray-700">{q.reply_text}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Botmakers Team ·{" "}
                    {q.replied_at ? relativeTime(q.replied_at) : ""}
                  </p>
                </div>
              ) : (
                <div className="ml-7 mt-2 bg-gray-50 border-l-2 border-gray-200 rounded-r-lg p-3">
                  <p className="text-sm text-gray-400 italic">
                    Our team is reviewing your question...
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="px-6 py-8 text-center">
          <p className="text-gray-400 text-sm">
            No questions yet. Ask your first one above!
          </p>
        </div>
      )}
    </div>
  );
}
