"use client";

import LeadTable from "@/components/admin/LeadTable";

export default function LeadsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Leads</h1>
        <p className="text-white/50 text-sm mt-1">
          Review and manage incoming leads from all sources.
        </p>
      </div>
      <LeadTable />
    </div>
  );
}
