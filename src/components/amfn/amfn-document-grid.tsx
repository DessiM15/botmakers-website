"use client";

import { AMFN_CATEGORIES, AMFN_DOCUMENTS } from "@/lib/amfn/documents";
import { AmfnDocumentCard } from "./amfn-document-card";

export function AmfnDocumentGrid() {
  return (
    <div className="space-y-10">
      {AMFN_CATEGORIES.map((category) => {
        const docs = AMFN_DOCUMENTS.filter((d) => d.category === category);
        if (docs.length === 0) return null;

        return (
          <section key={category}>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-[#c53030]" />
              <h2 className="text-lg font-semibold text-white">{category}</h2>
              <span className="text-xs text-gray-500">
                {docs.length} {docs.length === 1 ? "document" : "documents"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {docs.map((doc) => (
                <AmfnDocumentCard key={doc.id} document={doc} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
