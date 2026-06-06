// SPEC: SPEC-DEPENDENCY-MAP > Project Management > UI > creation form
// DEP-MAP: Project Management > ProjectCreateForm
"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createProject } from "@/lib/actions/projects";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { DEFAULT_PROJECT_PHASES } from "@/lib/types/constants";

interface ClientOption {
  id: string;
  fullName: string;
  company: string | null;
}

interface ProjectCreateFormProps {
  clients: ClientOption[];
}

export function ProjectCreateForm({ clients }: ProjectCreateFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    const data = {
      name: formData.get("name") as string,
      client_id: formData.get("client_id") as string,
      project_type: (formData.get("project_type") as string) || undefined,
      description: (formData.get("description") as string) || undefined,
      pricing_type: (formData.get("pricing_type") as "fixed" | "phased" | "hourly") || "fixed",
      total_value: parseFloat(formData.get("total_value") as string) || 0,
      start_date: (formData.get("start_date") as string) || undefined,
      target_end_date: (formData.get("target_end_date") as string) || undefined,
    };

    if (!data.name || !data.client_id) {
      toast.error("Project name and client are required");
      return;
    }

    startTransition(async () => {
      const result = await createProject(data);
      if (result.success && result.data) {
        toast.success("Project created with default phases");
        router.push(`/admin/projects/${result.data.id}`);
      } else {
        toast.error(result.error?.message ?? "Failed to create project");
      }
    });
  }

  return (
    <form action={handleSubmit}>
      <Card className="border-white/10 bg-white/5 text-white">
        <CardHeader>
          <CardTitle className="text-base">Project Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Project Name *</Label>
            <Input name="name" required className="bg-white/5 border-white/10 text-white" placeholder="E.g., Acme Web Portal" />
          </div>

          <div className="space-y-2">
            <Label>Client *</Label>
            <Select name="client_id" required>
              <SelectTrigger className="bg-white/5 border-white/10 text-gray-300">
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.fullName}{c.company ? ` — ${c.company}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Project Type</Label>
              <Input name="project_type" className="bg-white/5 border-white/10 text-white" placeholder="E.g., Web App" />
            </div>
            <div className="space-y-2">
              <Label>Pricing Type</Label>
              <Select name="pricing_type" defaultValue="fixed">
                <SelectTrigger className="bg-white/5 border-white/10 text-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixed</SelectItem>
                  <SelectItem value="phased">Phased</SelectItem>
                  <SelectItem value="hourly">Hourly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Total Value ($)</Label>
              <Input name="total_value" type="number" min="0" step="0.01" className="bg-white/5 border-white/10 text-white" placeholder="0.00" />
            </div>
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input name="start_date" type="date" className="bg-white/5 border-white/10 text-white" />
            </div>
            <div className="space-y-2">
              <Label>Target End</Label>
              <Input name="target_end_date" type="date" className="bg-white/5 border-white/10 text-white" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea name="description" className="bg-white/5 border-white/10 text-white min-h-[80px]" placeholder="Brief project description..." />
          </div>

          {/* Default phases preview */}
          <div className="rounded-lg bg-white/5 p-4">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Default Phases (auto-created)</p>
            <div className="grid grid-cols-2 gap-2">
              {DEFAULT_PROJECT_PHASES.map((phase) => (
                <div key={phase.name} className="text-xs">
                  <p className="font-medium text-gray-300">{phase.name}</p>
                  <ul className="mt-0.5 text-gray-500 space-y-0.5">
                    {phase.milestones.map((m) => (
                      <li key={m}>• {m}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-[#03FF00] text-[#033457] hover:bg-[#03FF00]/90 font-semibold"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
            Create Project
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
