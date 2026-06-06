// SPEC: SPEC-PAGES > /portal/projects/[id] — Client Project View
// DEP-MAP: Project Management > UI > /portal/projects/[id]
import { notFound } from "next/navigation";
import { requireClient } from "@/lib/auth/helpers";
import {
  getProjectById,
  getDemosForProject,
  getQuestionsForProject,
} from "@/lib/db/queries/projects";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  Circle,
  Clock,
  ExternalLink,
  MessageSquare,
} from "lucide-react";
import { PortalQuestionForm } from "@/components/portal/portal-question-form";

const statusIcons: Record<string, React.ReactNode> = {
  completed: <CheckCircle2 className="h-4 w-4 text-green-600" />,
  in_progress: <Clock className="h-4 w-4 text-blue-600" />,
  pending: <Circle className="h-4 w-4 text-gray-400" />,
  overdue: <Clock className="h-4 w-4 text-red-600" />,
};

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800",
  in_progress: "bg-blue-100 text-blue-800",
  paused: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default async function PortalProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await requireClient();
  const project = await getProjectById(id);

  if (!project || project.clientId !== client.id) {
    notFound();
  }

  const [demos, questions] = await Promise.all([
    getDemosForProject(id),
    getQuestionsForProject(id),
  ]);

  const approvedDemos = demos.filter((d) => d.isApproved);
  const currentPhaseIdx = project.phases.findIndex((p) =>
    p.milestones.some((m) => m.status !== "completed")
  );
  const currentPhase =
    currentPhaseIdx >= 0 ? project.phases[currentPhaseIdx] : null;

  // Next 3 upcoming milestones
  const upcomingMilestones = project.phases
    .flatMap((p) => p.milestones)
    .filter((m) => m.status !== "completed")
    .slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-[#033457]">{project.name}</h1>
          <Badge
            variant="secondary"
            className={statusColors[project.status] ?? ""}
          >
            {project.status.replace("_", " ")}
          </Badge>
        </div>
        {currentPhase && (
          <p className="mt-1 text-sm text-muted-foreground">
            Phase {currentPhaseIdx + 1} of {project.phases.length}:{" "}
            {currentPhase.name}
          </p>
        )}
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#033457]">
              Overall Progress
            </span>
            <span className="text-lg font-bold text-[#033457]">
              {project.progress}%
            </span>
          </div>
          <div className="mt-2 h-3 w-full rounded-full bg-gray-200">
            <div
              className="h-3 rounded-full bg-[#03FF00] transition-all duration-700"
              style={{ width: `${project.progress}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {project.completedMilestones} of {project.totalMilestones}{" "}
            milestones complete
          </p>
        </CardContent>
      </Card>

      {/* What's Next */}
      {upcomingMilestones.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-[#033457]">
              What&apos;s Next
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingMilestones.map((m, idx) => (
              <div key={m.id} className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#033457] text-xs font-bold text-white">
                  {idx + 1}
                </div>
                <div>
                  <p className="font-medium">{m.title}</p>
                  {m.description && (
                    <p className="text-sm text-muted-foreground">
                      {m.description}
                    </p>
                  )}
                  {m.dueDate && (
                    <p className="text-xs text-muted-foreground">
                      Target: {new Date(m.dueDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Milestone Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base text-[#033457]">
            Milestone Checklist
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {project.phases.map((phase) => (
            <div key={phase.id}>
              <h3 className="mb-2 text-sm font-semibold text-[#033457]">
                {phase.name}
              </h3>
              <div className="space-y-2">
                {phase.milestones.map((m) => (
                  <div key={m.id} className="flex items-center gap-3">
                    {statusIcons[m.status] ?? statusIcons.pending}
                    <span
                      className={
                        m.status === "completed"
                          ? "text-sm text-muted-foreground line-through"
                          : "text-sm"
                      }
                    >
                      {m.title}
                    </span>
                    {m.completedAt && (
                      <span className="ml-auto text-xs text-muted-foreground">
                        {new Date(m.completedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
          {project.phases.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No milestones have been set up yet.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Demo Gallery */}
      {approvedDemos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-[#033457]">
              Demo Gallery
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {approvedDemos.map((demo) => (
                <Card key={demo.id} className="border shadow-none">
                  <CardContent className="py-4">
                    <p className="font-medium">{demo.title}</p>
                    {demo.description && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {demo.description}
                      </p>
                    )}
                    <a
                      href={demo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-[#1E40AF] hover:underline"
                    >
                      View Demo
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Q&A Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-[#033457]">
            <MessageSquare className="h-5 w-5" />
            Questions & Answers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <PortalQuestionForm projectId={id} />

          {questions.length > 0 ? (
            <div className="space-y-4">
              <Separator />
              {questions.map((q) => (
                <div key={q.id} className="space-y-2">
                  <div className="rounded-lg bg-gray-100 p-3">
                    <p className="text-xs font-medium text-muted-foreground">
                      You asked on{" "}
                      {new Date(q.createdAt).toLocaleDateString()}:
                    </p>
                    <p className="mt-1 text-sm">{q.questionText}</p>
                  </div>
                  {q.replyText ? (
                    <div className="ml-4 rounded-lg border-l-2 border-[#03FF00] bg-white p-3">
                      <p className="text-xs font-medium text-muted-foreground">
                        Reply from Botmakers:
                      </p>
                      <p className="mt-1 text-sm">{q.replyText}</p>
                    </div>
                  ) : (
                    <p className="ml-4 text-xs text-muted-foreground">
                      Awaiting reply...
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No questions yet. Ask anything about your project above.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
