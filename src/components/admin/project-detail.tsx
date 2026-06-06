// SPEC: SPEC-DEPENDENCY-MAP > Project Management > UI > tabbed detail
// DEP-MAP: Project Management > ProjectDetail component
"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, ExternalLink, Check, Clock, AlertTriangle, CalendarPlus } from "lucide-react";
import { CreateEventModal } from "@/components/admin/create-event-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateProject, updateMilestone, linkRepo, createDemo, replyQuestion } from "@/lib/actions/projects";
import { toast } from "sonner";
import type { ProjectWithProgress, ProjectRepo, ProjectDemo, ProjectQuestion } from "@/lib/types";
import type { Client, Invoice } from "@/lib/types";

interface ProjectDetailProps {
  project: ProjectWithProgress;
  client: Client | null;
  repos: ProjectRepo[];
  demos: ProjectDemo[];
  questions: ProjectQuestion[];
  invoices: Invoice[];
}

const MILESTONE_ICONS: Record<string, React.ReactNode> = {
  completed: <Check className="h-4 w-4 text-green-400" />,
  in_progress: <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />,
  pending: <Clock className="h-4 w-4 text-gray-500" />,
  overdue: <AlertTriangle className="h-4 w-4 text-red-400" />,
};

export function ProjectDetail({ project, client, repos, demos, questions, invoices }: ProjectDetailProps) {
  const [isPending, startTransition] = useTransition();

  function handleStatusChange(status: string) {
    startTransition(async () => {
      const result = await updateProject(project.id, { status });
      if (result.success) toast.success("Status updated");
      else toast.error("Failed to update status");
    });
  }

  function handleMilestoneChange(milestoneId: string, status: string) {
    startTransition(async () => {
      const result = await updateMilestone(milestoneId, { status });
      if (result.success) {
        if (status === "completed") toast.success("Milestone completed! Client notified.");
        else toast.success("Milestone updated");
      } else {
        toast.error("Failed to update milestone");
      }
    });
  }

  async function handleLinkRepo(formData: FormData) {
    const owner = formData.get("owner") as string;
    const repo = formData.get("repo") as string;
    if (!owner || !repo) { toast.error("Owner and repo are required"); return; }

    const result = await linkRepo(project.id, owner, repo);
    if (result.success) toast.success("Repository linked!");
    else toast.error(result.error?.message ?? "Failed to link repo");
  }

  async function handleAddDemo(formData: FormData) {
    const title = formData.get("title") as string;
    const url = formData.get("url") as string;
    if (!title || !url) { toast.error("Title and URL are required"); return; }

    const result = await createDemo(project.id, { title, url });
    if (result.success) toast.success("Demo added!");
    else toast.error("Failed to add demo");
  }

  async function handleReplyQuestion(questionId: string, formData: FormData) {
    const reply = formData.get("reply") as string;
    if (!reply) { toast.error("Reply is required"); return; }

    const result = await replyQuestion(questionId, reply);
    if (result.success) toast.success("Reply sent to client!");
    else toast.error("Failed to send reply");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/projects">
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            <ArrowLeft className="h-4 w-4 mr-1" /> Projects
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{project.name}</h1>
          {client && <p className="text-sm text-gray-400">{client.fullName}{client.company ? ` — ${client.company}` : ""}</p>}
        </div>
      </div>

      {/* Schedule Meeting + Progress */}
      <div className="flex justify-end">
        <CreateEventModal
          defaultTitle={`Meeting re: ${project.name}`}
          defaultProjectId={project.id}
          trigger={
            <Button variant="outline" size="sm" className="border-white/10 text-gray-300 hover:text-white">
              <CalendarPlus className="h-4 w-4 mr-1" /> Schedule Meeting
            </Button>
          }
        />
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-gray-400">{project.completedMilestones}/{project.totalMilestones} milestones</span>
          <span className="text-sm font-medium text-[#03FF00]">{project.progress}%</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-3">
          <div className="bg-[#03FF00] h-3 rounded-full transition-all" style={{ width: `${project.progress}%` }} />
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="overview" className="data-[state=active]:bg-white/10">Overview</TabsTrigger>
          <TabsTrigger value="milestones" className="data-[state=active]:bg-white/10">Milestones</TabsTrigger>
          <TabsTrigger value="repos" className="data-[state=active]:bg-white/10">Repos & Demos</TabsTrigger>
          <TabsTrigger value="questions" className="data-[state=active]:bg-white/10">Questions ({questions.filter(q => q.status === "pending").length})</TabsTrigger>
          <TabsTrigger value="invoices" className="data-[state=active]:bg-white/10">Invoices</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-white/10 bg-white/5 text-white">
              <CardHeader><CardTitle className="text-base">Project Info</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Status</span>
                  <Select value={project.status} onValueChange={handleStatusChange}>
                    <SelectTrigger className="w-36 h-7 text-xs bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {project.projectType && <div className="flex justify-between"><span className="text-gray-400">Type</span><span>{project.projectType}</span></div>}
                <div className="flex justify-between"><span className="text-gray-400">Pricing</span><span className="capitalize">{project.pricingType}</span></div>
                {parseFloat(project.totalValue) > 0 && <div className="flex justify-between"><span className="text-gray-400">Value</span><span>${parseFloat(project.totalValue).toLocaleString()}</span></div>}
                {project.startDate && <div className="flex justify-between"><span className="text-gray-400">Start</span><span>{project.startDate}</span></div>}
                {project.targetEndDate && <div className="flex justify-between"><span className="text-gray-400">Target End</span><span>{project.targetEndDate}</span></div>}
                {project.description && <div><span className="text-gray-400">Description:</span><p className="text-gray-300 mt-1">{project.description}</p></div>}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Milestones */}
        <TabsContent value="milestones" className="mt-4 space-y-4">
          {project.phases.map((phase) => (
            <Card key={phase.id} className="border-white/10 bg-white/5 text-white">
              <CardHeader>
                <CardTitle className="text-base">{phase.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {phase.milestones.map((ms) => (
                  <div key={ms.id} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                    <div className="flex-shrink-0">{MILESTONE_ICONS[ms.status]}</div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${ms.status === "completed" ? "line-through text-gray-500" : "text-gray-200"}`}>
                        {ms.title}
                      </p>
                      {ms.dueDate && <p className="text-xs text-gray-500">Due: {ms.dueDate}</p>}
                    </div>
                    <Select value={ms.status} onValueChange={(v) => handleMilestoneChange(ms.id, v)}>
                      <SelectTrigger className="w-32 h-7 text-xs bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Repos & Demos */}
        <TabsContent value="repos" className="mt-4 space-y-6">
          <Card className="border-white/10 bg-white/5 text-white">
            <CardHeader><CardTitle className="text-base">Linked Repositories</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {repos.map((repo) => (
                <div key={repo.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <div>
                    <p className="font-medium text-sm">{repo.githubOwner}/{repo.githubRepo}</p>
                    {repo.lastSyncedAt && <p className="text-xs text-gray-500">Last sync: {new Date(repo.lastSyncedAt).toLocaleString()}</p>}
                  </div>
                  <a href={repo.githubUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="sm" className="text-gray-400"><ExternalLink className="h-3 w-3" /></Button>
                  </a>
                </div>
              ))}
              <form action={handleLinkRepo} className="flex gap-2">
                <Input name="owner" placeholder="Owner" className="bg-white/5 border-white/10 text-white flex-1" />
                <Input name="repo" placeholder="Repo" className="bg-white/5 border-white/10 text-white flex-1" />
                <Button type="submit" size="sm" className="bg-[#03FF00] text-[#033457]">Link</Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 text-white">
            <CardHeader><CardTitle className="text-base">Demos</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {demos.map((demo) => (
                <div key={demo.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{demo.title}</p>
                      {demo.isAutoPulled && <Badge variant="outline" className="text-[9px] border-white/10 text-gray-500">Auto</Badge>}
                      {demo.isApproved && <Badge className="text-[9px] bg-green-500/20 text-green-400">Approved</Badge>}
                    </div>
                    <a href={demo.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline">{demo.url}</a>
                  </div>
                </div>
              ))}
              <form action={handleAddDemo} className="flex gap-2">
                <Input name="title" placeholder="Demo title" className="bg-white/5 border-white/10 text-white flex-1" />
                <Input name="url" placeholder="https://..." className="bg-white/5 border-white/10 text-white flex-1" />
                <Button type="submit" size="sm" className="bg-[#03FF00] text-[#033457]">Add</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Questions */}
        <TabsContent value="questions" className="mt-4 space-y-4">
          {questions.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No questions from the client yet</p>
          ) : (
            questions.map((q) => (
              <Card key={q.id} className="border-white/10 bg-white/5 text-white">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-200">{q.questionText}</p>
                      <p className="text-xs text-gray-500 mt-1">{new Date(q.createdAt).toLocaleString()}</p>
                    </div>
                    <Badge className={q.status === "replied" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}>
                      {q.status}
                    </Badge>
                  </div>
                  {q.replyText ? (
                    <div className="bg-white/5 rounded p-3">
                      <p className="text-xs text-gray-400 mb-1">Reply:</p>
                      <p className="text-sm text-gray-300">{q.replyText}</p>
                    </div>
                  ) : (
                    <form action={(fd) => handleReplyQuestion(q.id, fd)} className="flex gap-2">
                      <Textarea name="reply" placeholder="Type your reply..." className="bg-white/5 border-white/10 text-white min-h-[60px] flex-1" />
                      <Button type="submit" size="sm" className="bg-[#03FF00] text-[#033457] self-end">Reply</Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Invoices */}
        <TabsContent value="invoices" className="mt-4">
          {invoices.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No invoices yet</p>
          ) : (
            <div className="space-y-2">
              {invoices.map((inv) => (
                <Card key={inv.id} className="border-white/10 bg-white/5 text-white">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{inv.title}</p>
                      <p className="text-xs text-gray-500">${parseFloat(inv.amount).toLocaleString()}</p>
                    </div>
                    <Badge variant="outline" className="border-white/10 text-gray-400">{inv.status}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
