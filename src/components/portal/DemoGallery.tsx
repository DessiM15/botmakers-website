"use client";

import { ExternalLink } from "lucide-react";
import type { ProjectDemo } from "@/lib/types";

interface Props {
  demos: ProjectDemo[];
}

export default function DemoGallery({ demos }: Props) {
  if (demos.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
        <ExternalLink className="mx-auto mb-2 text-gray-300" size={24} />
        <p className="text-gray-400 text-sm">No demos available yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="font-semibold text-[#033457]">Demos</h2>
      </div>
      <div className="divide-y divide-gray-100">
        {demos.map((demo) => (
          <div key={demo.id} className="px-6 py-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h4 className="font-medium text-[#033457] text-sm">
                  {demo.title}
                </h4>
                {demo.description && (
                  <p className="text-gray-500 text-xs mt-1">
                    {demo.description}
                  </p>
                )}
                <p className="text-gray-300 text-xs mt-2">
                  {new Date(demo.created_at).toLocaleDateString()}
                </p>
              </div>
              <a
                href={demo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-[#033457] text-white px-4 py-2 rounded-lg text-xs font-medium hover:bg-[#022a47] transition-colors shrink-0"
              >
                View Demo
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
