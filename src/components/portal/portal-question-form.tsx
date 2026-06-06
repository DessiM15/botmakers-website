// SPEC: SPEC-PAGES > /portal/projects/[id] > Q&A section
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { submitQuestion } from "@/lib/actions/projects";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface PortalQuestionFormProps {
  projectId: string;
}

export function PortalQuestionForm({ projectId }: PortalQuestionFormProps) {
  const [question, setQuestion] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = question.trim();
    if (!text) return;

    setSubmitting(true);
    try {
      const result = await submitQuestion(projectId, text);
      if (result.success) {
        toast.success("Question submitted! We'll get back to you soon.");
        setQuestion("");
      } else {
        toast.error(result.error?.message ?? "Failed to submit question");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Label htmlFor="portal-question" className="text-sm font-medium">
        Have a Question?
      </Label>
      <Textarea
        id="portal-question"
        placeholder="Type your question here..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        disabled={submitting}
        rows={3}
      />
      <Button
        type="submit"
        size="sm"
        disabled={submitting || !question.trim()}
        className="bg-[#03FF00] text-[#033457] hover:bg-[#03FF00]/90"
      >
        {submitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          "Submit Question"
        )}
      </Button>
    </form>
  );
}
