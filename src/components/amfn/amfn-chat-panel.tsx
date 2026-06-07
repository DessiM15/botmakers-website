"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, Send, Loader2, X, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { AmfnChatMessage } from "./amfn-chat-message";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED_QUESTIONS = [
  "What's in the brand guidelines?",
  "Summarize the editorial calendar",
  "What are the KPI targets?",
  "Explain the compliance workflow",
];

export function AmfnChatPanel() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setError("");
    const userMessage: ChatMessage = { role: "user", content: trimmed };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/amfn/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to get a response.");
        return;
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply },
      ]);
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleSend() {
    sendMessage(input);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <>
      {/* Floating button — compact red pill, bottom-right */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#EF4444] hover:bg-[#DC2626] text-white px-4 py-3 rounded-full shadow-lg shadow-[#EF4444]/20 transition-all duration-200 hover:scale-105"
        >
          <MessageCircle className="h-5 w-5" />
          <span className="text-sm font-semibold hidden sm:inline">Ask AI</span>
        </button>
      )}

      {/* Chat sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          showCloseButton={false}
          className="w-full sm:max-w-md bg-white border-black/[0.06] p-0 flex flex-col"
        >
          {/* Header */}
          <SheetHeader className="px-4 pt-4 pb-3 border-b border-transparent" style={{
            borderImage: "linear-gradient(90deg, transparent, rgba(59,130,246,0.15), transparent) 1",
          }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#3B82F6]/10 border border-[#3B82F6]/20">
                  <Bot className="h-4 w-4 text-[#3B82F6]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <SheetTitle className="text-gray-900 text-base">
                      Document Assistant
                    </SheetTitle>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20 uppercase tracking-wider">
                      AI
                    </span>
                  </div>
                  <SheetDescription className="text-gray-400 text-xs">
                    Ask questions about your deliverable package
                  </SheetDescription>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-[#EF4444] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </SheetHeader>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-gray-50/50"
          >
            {messages.length === 0 && (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#3B82F6]/10 border border-[#3B82F6]/20 mb-4">
                  <Bot className="h-6 w-6 text-[#3B82F6]" />
                </div>
                <p className="text-sm text-gray-500 mb-1">
                  Ask me anything about your documents
                </p>
                <p className="text-xs text-gray-400 mb-6">
                  I can help with brand guidelines, editorial calendar, KPIs, market intelligence, and more.
                </p>

                {/* Suggested question pills */}
                <div className="flex flex-wrap justify-center gap-2">
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      className="text-xs text-gray-500 bg-white border border-black/[0.06] rounded-full px-3 py-1.5 hover:bg-[#3B82F6]/5 hover:text-[#3B82F6] hover:border-[#3B82F6]/20 transition-colors shadow-sm"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <AmfnChatMessage key={i} role={msg.role} content={msg.content} />
            ))}

            {loading && (
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-lg bg-[#3B82F6]/10 border border-[#3B82F6]/20 flex items-center justify-center">
                  <Loader2 className="h-3.5 w-3.5 text-[#3B82F6] animate-spin" />
                </div>
                <div className="bg-white border border-black/[0.06] rounded-xl px-3.5 py-2.5 shadow-sm">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="px-4 pb-2">
              <p className="text-xs text-red-600 bg-red-50 border-l-2 border-red-500 rounded-r-lg px-3 py-2">
                {error}
              </p>
            </div>
          )}

          {/* Input */}
          <div className="border-t border-transparent px-4 py-3 bg-white" style={{
            borderImage: "linear-gradient(90deg, transparent, rgba(59,130,246,0.1), transparent) 1",
          }}>
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about the documents..."
                rows={1}
                className="flex-1 resize-none bg-gray-50 border border-black/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#3B82F6]/30 max-h-32"
                disabled={loading}
              />
              <Button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                size="sm"
                className="h-10 w-10 bg-[#EF4444] hover:bg-[#DC2626] text-white rounded-xl p-0 flex-shrink-0 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
