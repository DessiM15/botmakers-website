// SPEC: SPEC-PAGES > /admin/activity — filters for activity log
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ActivityFiltersProps {
  actions: string[];
  entityTypes: string[];
  members: Array<{ id: string; fullName: string }>;
  currentFilters: {
    actorId?: string;
    action?: string;
    entityType?: string;
    dateFrom?: string;
    dateTo?: string;
  };
}

export function ActivityFilters({
  actions,
  entityTypes,
  members,
  currentFilters,
}: ActivityFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function setFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`/admin/activity?${params.toString()}`);
  }

  function clearFilters() {
    router.push("/admin/activity");
  }

  const hasFilters = !!(currentFilters.actorId || currentFilters.action || currentFilters.entityType || currentFilters.dateFrom || currentFilters.dateTo);

  return (
    <div className="flex flex-wrap gap-3 items-end">
      <div className="space-y-1">
        <label className="text-xs text-gray-500">Actor</label>
        <Select value={currentFilters.actorId ?? "all"} onValueChange={(v) => setFilter("actorId", v)}>
          <SelectTrigger className="w-[160px] bg-white/5 border-white/10 text-white text-sm">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {members.map((m) => (
              <SelectItem key={m.id} value={m.id}>{m.fullName}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <label className="text-xs text-gray-500">Action</label>
        <Select value={currentFilters.action ?? "all"} onValueChange={(v) => setFilter("action", v)}>
          <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-white text-sm">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {actions.map((a) => (
              <SelectItem key={a} value={a}>{a.replace(/[._]/g, " ")}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <label className="text-xs text-gray-500">Entity</label>
        <Select value={currentFilters.entityType ?? "all"} onValueChange={(v) => setFilter("entityType", v)}>
          <SelectTrigger className="w-[140px] bg-white/5 border-white/10 text-white text-sm">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {entityTypes.map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <label className="text-xs text-gray-500">From</label>
        <Input
          type="date"
          value={currentFilters.dateFrom ?? ""}
          onChange={(e) => setFilter("dateFrom", e.target.value)}
          className="w-[140px] bg-white/5 border-white/10 text-white text-sm"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs text-gray-500">To</label>
        <Input
          type="date"
          value={currentFilters.dateTo ?? ""}
          onChange={(e) => setFilter("dateTo", e.target.value)}
          className="w-[140px] bg-white/5 border-white/10 text-white text-sm"
        />
      </div>

      {hasFilters && (
        <Button onClick={clearFilters} size="sm" variant="ghost" className="text-gray-400 hover:text-white">
          <X className="h-4 w-4 mr-1" /> Clear
        </Button>
      )}
    </div>
  );
}
