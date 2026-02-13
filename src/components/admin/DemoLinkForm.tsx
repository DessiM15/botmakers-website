"use client";

import { useState } from "react";
import { Plus, Trash2, ExternalLink } from "lucide-react";
import type { ProjectDemo, ProjectPhase } from "@/lib/types";

interface Props {
  projectId: string;
  demos: ProjectDemo[];
  phases: ProjectPhase[];
  onUpdate: () => void;
}

export default function DemoLinkForm({
  projectId,
  demos,
  phases,
  onUpdate,
}: Props) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    url: "",
    description: "",
    phase_id: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.url) return;
    setSubmitting(true);
    await fetch(`/api/admin/projects/${projectId}/demos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ title: "", url: "", description: "", phase_id: "" });
    setShowForm(false);
    setSubmitting(false);
    onUpdate();
  };

  const handleDelete = async (demoId: string) => {
    await fetch(`/api/admin/projects/${projectId}/demos/${demoId}`, {
      method: "DELETE",
    });
    onUpdate();
  };

  const inputClass =
    "w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#03FF00] transition-colors";

  return (
    <div>
      {/* Existing demos */}
      {demos.length > 0 ? (
        <div className="space-y-3 mb-6">
          {demos.map((demo) => (
            <div
              key={demo.id}
              className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-start gap-4 group"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-white font-medium text-sm">
                    {demo.title}
                  </h4>
                  {demo.phase_id && (
                    <span className="text-xs bg-white/10 text-white/40 px-2 py-0.5 rounded-full">
                      {phases.find((p) => p.id === demo.phase_id)?.name}
                    </span>
                  )}
                </div>
                {demo.description && (
                  <p className="text-white/50 text-xs mb-2">
                    {demo.description}
                  </p>
                )}
                <a
                  href={demo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[#03FF00] text-xs hover:underline"
                >
                  <ExternalLink size={10} />
                  {demo.url}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/30">
                  {new Date(demo.created_at).toLocaleDateString()}
                </span>
                <button
                  onClick={() => handleDelete(demo.id)}
                  className="p-1.5 text-white/10 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center mb-6">
          <ExternalLink className="mx-auto mb-2 text-white/20" size={24} />
          <p className="text-white/40 text-sm">No demos shared yet.</p>
        </div>
      )}

      {/* Add demo form */}
      {showForm ? (
        <form
          onSubmit={handleSubmit}
          className="bg-white/5 border border-white/10 rounded-xl p-5"
        >
          <h4 className="text-sm font-medium text-white mb-4">
            Add Demo Link
          </h4>
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={form.title}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Demo title *"
                className={inputClass}
              />
              <input
                type="url"
                value={form.url}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, url: e.target.value }))
                }
                placeholder="https://demo-url.com *"
                className={inputClass}
              />
            </div>
            <input
              type="text"
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="Description (optional)"
              className={inputClass}
            />
            <select
              value={form.phase_id}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, phase_id: e.target.value }))
              }
              className={inputClass}
            >
              <option value="">Associate with phase (optional)</option>
              {phases.map((phase) => (
                <option key={phase.id} value={phase.id} className="bg-gray-900">
                  {phase.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              type="submit"
              disabled={submitting || !form.title || !form.url}
              className="bg-[#03FF00] text-[#033457] px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-50 hover:bg-[#02dd00] transition-colors"
            >
              {submitting ? "Adding..." : "Add Demo"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setForm({ title: "", url: "", description: "", phase_id: "" });
              }}
              className="text-white/40 hover:text-white text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 text-white/30 hover:text-white/60 text-sm transition-colors"
        >
          <Plus size={14} />
          Add Demo Link
        </button>
      )}
    </div>
  );
}
