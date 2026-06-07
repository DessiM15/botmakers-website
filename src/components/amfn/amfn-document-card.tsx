"use client";

import { useState } from "react";
import { Download, Eye, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AmfnDocument } from "@/lib/amfn/documents";
import { AmfnPdfViewer } from "./amfn-pdf-viewer";

const FILE_TYPE_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  pdf: { bg: "bg-[#EF4444]/10", text: "text-[#EF4444]", label: "PDF" },
  xlsx: { bg: "bg-emerald-500/10", text: "text-emerald-600", label: "XLSX" },
  docx: { bg: "bg-[#3B82F6]/10", text: "text-[#3B82F6]", label: "DOCX" },
};

export function AmfnDocumentCard({ document }: { document: AmfnDocument }) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const style = FILE_TYPE_STYLES[document.fileType];
  const downloadUrl = `/amfn/documents/${document.fileName}`;

  return (
    <>
      <div className="group relative amfn-card-scan amfn-border-glow bg-white border border-black/[0.06] rounded-xl p-5 hover:bg-gray-50/80 hover:shadow-md transition-all duration-300 shadow-sm">
        {/* Corner accent — two blue lines at top-left */}
        <div className="absolute top-0 left-0 pointer-events-none">
          <div className="w-6 h-px bg-[#3B82F6]/30" />
          <div className="w-px h-6 bg-[#3B82F6]/30" />
        </div>

        {/* Background watermark icon */}
        <div className="absolute bottom-3 right-3 pointer-events-none transition-transform duration-500 group-hover:rotate-12">
          <FileText className="h-16 w-16 text-black/[0.02] group-hover:text-black/[0.04]" />
        </div>

        <div className="relative">
          <div className="flex items-start justify-between mb-3">
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${style.bg} ${style.text}`}>
              {style.label}
            </span>
            <span className="text-xs text-gray-400">{document.fileSize}</span>
          </div>

          <h3 className="text-gray-900 font-semibold text-sm mb-2 leading-tight group-hover:text-[#EF4444] transition-colors duration-200">
            {document.title}
          </h3>

          <p className="text-gray-400 text-xs leading-relaxed mb-4 line-clamp-3">
            {document.description}
          </p>

          <div className="flex items-center gap-2">
            {document.canView && (
              <Button
                size="sm"
                onClick={() => setViewerOpen(true)}
                className="flex-1 h-8 text-xs relative bg-[#EF4444] hover:bg-[#DC2626] text-white font-semibold amfn-btn-shine"
              >
                <Eye className="h-3.5 w-3.5 mr-1.5" />
                View
              </Button>
            )}

            <Button
              asChild
              size="sm"
              variant="outline"
              className="flex-1 h-8 text-xs bg-transparent border-black/[0.08] text-gray-500 hover:bg-[#3B82F6]/5 hover:text-[#3B82F6] hover:border-[#3B82F6]/20"
            >
              <a href={downloadUrl} download>
                <Download className="h-3.5 w-3.5 mr-1.5" />
                Download
              </a>
            </Button>
          </div>
        </div>
      </div>

      {document.canView && (
        <AmfnPdfViewer
          open={viewerOpen}
          onOpenChange={setViewerOpen}
          title={document.title}
          url={downloadUrl}
        />
      )}
    </>
  );
}
