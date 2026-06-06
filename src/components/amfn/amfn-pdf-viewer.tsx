"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface AmfnPdfViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  url: string;
}

export function AmfnPdfViewer({ open, onOpenChange, title, url }: AmfnPdfViewerProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl h-[85vh] flex flex-col bg-[#1a2744] border-white/10 text-white p-0">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle className="text-white">{title}</DialogTitle>
          <DialogDescription className="text-gray-400">
            Viewing document inline. Use the download button for full functionality.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 px-6 pb-6 min-h-0">
          <iframe
            src={url}
            className="w-full h-full rounded-lg border border-white/10"
            title={title}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
