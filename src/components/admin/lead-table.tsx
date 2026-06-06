// SPEC: SPEC-DEPENDENCY-MAP > Lead Management > UI > filterable table
// DEP-MAP: Lead Management > LeadTable component
"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { updateLeadStage } from "@/lib/actions/leads";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Lead, TeamUser, LeadFilters, PipelineStage } from "@/lib/types";

interface LeadTableProps {
  leads: Lead[];
  total: number;
  page: number;
  totalPages: number;
  stageLabels: Record<string, string>;
  teamMembers: TeamUser[];
  filters: LeadFilters;
}

const SCORE_STYLES: Record<string, string> = {
  high: "bg-green-500/20 text-green-400",
  medium: "bg-yellow-500/20 text-yellow-400",
  low: "bg-red-500/20 text-red-400",
};

const SOURCE_STYLES: Record<string, string> = {
  web_form: "bg-blue-500/20 text-blue-400",
  referral: "bg-purple-500/20 text-purple-400",
  vapi: "bg-cyan-500/20 text-cyan-400",
  cold_outreach: "bg-orange-500/20 text-orange-400",
  word_of_mouth: "bg-indigo-500/20 text-indigo-400",
  other: "bg-gray-500/20 text-gray-400",
};

const STAGES: PipelineStage[] = [
  "new_lead", "contacted", "discovery_scheduled", "discovery_completed",
  "proposal_sent", "negotiation", "contract_signed", "active_client",
  "project_delivered", "retention",
];

export function LeadTable({
  leads,
  total,
  page,
  totalPages,
  stageLabels,
  teamMembers,
  filters,
}: LeadTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(filters.search ?? "");
  const [, startTransition] = useTransition();
  let debounceTimer: ReturnType<typeof setTimeout>;

  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      router.push(`/admin/leads?${params.toString()}`);
    },
    [router, searchParams]
  );

  function handleSearch(value: string) {
    setSearch(value);
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => updateParams("search", value), 300);
  }

  function handlePageChange(newPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`/admin/leads?${params.toString()}`);
  }

  async function handleStageChange(leadId: string, newStage: PipelineStage) {
    startTransition(async () => {
      const result = await updateLeadStage(leadId, newStage);
      if (!result.success) {
        toast.error(result.error?.message ?? "Failed to update stage");
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search leads..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-64 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
        />
        <Select
          value={filters.source ?? "all"}
          onValueChange={(v) => updateParams("source", v)}
        >
          <SelectTrigger className="w-36 bg-white/5 border-white/10 text-white">
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            <SelectItem value="web_form">Web Form</SelectItem>
            <SelectItem value="referral">Referral</SelectItem>
            <SelectItem value="vapi">Vapi</SelectItem>
            <SelectItem value="cold_outreach">Cold Outreach</SelectItem>
            <SelectItem value="word_of_mouth">Word of Mouth</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filters.score ?? "all"}
          onValueChange={(v) => updateParams("score", v)}
        >
          <SelectTrigger className="w-32 bg-white/5 border-white/10 text-white">
            <SelectValue placeholder="Score" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Scores</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filters.stage ?? "all"}
          onValueChange={(v) => updateParams("stage", v)}
        >
          <SelectTrigger className="w-44 bg-white/5 border-white/10 text-white">
            <SelectValue placeholder="Stage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            {STAGES.map((s) => (
              <SelectItem key={s} value={s}>
                {stageLabels[s] ?? s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {leads.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400">No leads yet</p>
          <p className="text-sm text-gray-500 mt-1">
            Leads from your website form will appear here
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-lg border border-white/10 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead className="text-gray-400">Name</TableHead>
                  <TableHead className="text-gray-400">Email</TableHead>
                  <TableHead className="text-gray-400">Source</TableHead>
                  <TableHead className="text-gray-400">Score</TableHead>
                  <TableHead className="text-gray-400">Stage</TableHead>
                  <TableHead className="text-gray-400">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => (
                  <TableRow
                    key={lead.id}
                    className="border-white/10 hover:bg-white/5"
                  >
                    <TableCell>
                      <Link
                        href={`/admin/leads/${lead.id}`}
                        className="font-medium text-white hover:text-[#03FF00] transition-colors"
                      >
                        {lead.fullName}
                      </Link>
                      {lead.companyName && (
                        <p className="text-xs text-gray-500">{lead.companyName}</p>
                      )}
                    </TableCell>
                    <TableCell className="text-gray-300 text-sm">
                      {lead.email}
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-[10px] ${SOURCE_STYLES[lead.source] ?? SOURCE_STYLES.other}`}>
                        {lead.source.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {lead.score ? (
                        <Badge className={`text-[10px] ${SCORE_STYLES[lead.score]}`}>
                          {lead.score}
                        </Badge>
                      ) : (
                        <span className="text-xs text-gray-500">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={lead.pipelineStage}
                        onValueChange={(v) => handleStageChange(lead.id, v as PipelineStage)}
                      >
                        <SelectTrigger className="h-7 text-xs bg-white/5 border-white/10 text-gray-300 w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STAGES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {stageLabels[s] ?? s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-xs text-gray-500">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">
              {total} lead{total !== 1 ? "s" : ""} total
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                disabled={page <= 1}
                onClick={() => handlePageChange(page - 1)}
                className="text-gray-400 hover:text-white"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-gray-400">
                {page} / {totalPages}
              </span>
              <Button
                variant="ghost"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => handlePageChange(page + 1)}
                className="text-gray-400 hover:text-white"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
