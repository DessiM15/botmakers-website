"use client";

import { useState } from "react";
import { Download, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AmfnDocument } from "@/lib/amfn/documents";
import { AmfnPdfViewer } from "./amfn-pdf-viewer";

const FILE_TYPE_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  pdf: { bg: "bg-red-500/20", text: "text-red-400", label: "PDF" },
  xlsx: { bg: "bg-green-500/20", text: "text-green-400", label: "XLSX" },
  docx: { bg: "bg-blue-500/20", text: "text-blue-400", label: "DOCX" },
};

export function AmfnDocumentCard({ document }: { document: AmfnDocument }) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const style = FILE_TYPE_STYLES[document.fileType];
  const downloadUrl = `/amfn/documents/${document.fileName}`;

  return (
    <>
      <div className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:bg-white/[0.08] hover:border-white/20 transition-all duration-200">
        <div className="flex items-start justify-between mb-3">
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${style.bg} ${style.text}`}>
            {style.label}
          </span>
          <span className="text-xs text-gray-500">{document.fileSize}</span>
        </div>

        <h3 className="text-white font-semibold text-sm mb-2 leading-tight">
          {document.title}
        </h3>

        <p className="text-gray-400 text-xs leading-relaxed mb-4 line-clamp-3">
          {document.description}
        </p>

        <div className="flex items-center gap-2">
          <Button
            asChild
            size="sm"
            variant="outline"
            className="flex-1 h-8 text-xs bg-transparent border-white/10 text-gray-300 hover:bg-white/10 hover:text-white"
          >
            <a href={downloadUrl} download>
              <Download className="h-3.5 w-3.5 mr-1.5" />
              Download
            </a>
          </Button>

          {document.canView && (
            <Button
              size="sm"
              onClick={() => setViewerOpen(true)}
              className="flex-1 h-8 text-xs bg-[#c53030] hover:bg-[#a32828] text-white"
            >
              <Eye className="h-3.5 w-3.5 mr-1.5" />
              View
            </Button>
          )}
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
