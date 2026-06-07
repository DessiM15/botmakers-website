"use client";

import { useState } from "react";
import { Maximize2, Minimize2 } from "lucide-react";
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
  const [fullscreen, setFullscreen] = useState(false);

  function handleOpenChange(value: boolean) {
    if (!value) setFullscreen(false);
    onOpenChange(value);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={`flex flex-col bg-white border-gray-200 text-gray-900 p-0 transition-all duration-200 ${
          fullscreen
            ? "sm:max-w-[98vw] h-[98vh]"
            : "sm:max-w-4xl h-[85vh]"
        }`}
      >
        <DialogHeader className="px-6 pt-5 pb-0 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-gray-900">{title}</DialogTitle>
              <DialogDescription className="text-gray-500">
                Viewing document inline. Use the download button for full functionality.
              </DialogDescription>
            </div>
            <button
              onClick={() => setFullscreen((prev) => !prev)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:text-[#3B82F6] hover:bg-[#3B82F6]/5 border border-gray-200 hover:border-[#3B82F6]/20 transition-colors"
            >
              {fullscreen ? (
                <>
                  <Minimize2 className="h-3.5 w-3.5" />
                  Exit Fullscreen
                </>
              ) : (
                <>
                  <Maximize2 className="h-3.5 w-3.5" />
                  Fullscreen
                </>
              )}
            </button>
          </div>
        </DialogHeader>
        <div className="flex-1 px-6 pb-6 min-h-0">
          <iframe
            src={url}
            className="w-full h-full rounded-lg border border-gray-200"
            title={title}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
