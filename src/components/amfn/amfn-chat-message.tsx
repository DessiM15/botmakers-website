"use client";

import { Bot, User } from "lucide-react";

interface AmfnChatMessageProps {
  role: "user" | "assistant";
  content: string;
}

function parseMarkdown(text: string): string {
  let html = text
    // Escape HTML entities
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Headings (### h3, ## h2, # h1) — must be at line start
  html = html.replace(/^### (.+)$/gm, '<h4 class="amfn-md-h4">$1</h4>');
  html = html.replace(/^## (.+)$/gm, '<h3 class="amfn-md-h3">$1</h3>');
  html = html.replace(/^# (.+)$/gm, '<h2 class="amfn-md-h2">$1</h2>');

  // Bold + italic (***text*** or ___text___)
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
  html = html.replace(/___(.+?)___/g, "<strong><em>$1</em></strong>");

  // Bold (**text** or __text__)
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/__(.+?)__/g, "<strong>$1</strong>");

  // Italic (*text* or _text_)
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  html = html.replace(/(?<!\w)_(.+?)_(?!\w)/g, "<em>$1</em>");

  // Inline code (`code`)
  html = html.replace(/`([^`]+)`/g, '<code class="amfn-md-code">$1</code>');

  // Unordered list items (- item or * item)
  html = html.replace(/^[\-\*] (.+)$/gm, '<li class="amfn-md-li">$1</li>');

  // Ordered list items (1. item)
  html = html.replace(/^\d+\. (.+)$/gm, '<li class="amfn-md-li amfn-md-oli">$1</li>');

  // Wrap consecutive <li> tags in <ul>
  html = html.replace(
    /((?:<li class="amfn-md-li">.*<\/li>\n?)+)/g,
    '<ul class="amfn-md-ul">$1</ul>'
  );

  // Wrap consecutive ordered <li> tags in <ol>
  html = html.replace(
    /<ul class="amfn-md-ul">((?:<li class="amfn-md-li amfn-md-oli">.*<\/li>\n?)+)<\/ul>/g,
    '<ol class="amfn-md-ol">$1</ol>'
  );

  // Paragraphs — convert double newlines to paragraph breaks
  html = html.replace(/\n\n+/g, '</p><p class="amfn-md-p">');

  // Single newlines to <br> (but not inside list/heading tags)
  html = html.replace(/\n/g, "<br>");

  // Wrap in opening paragraph
  html = '<p class="amfn-md-p">' + html + "</p>";

  // Clean up empty paragraphs and paragraphs wrapping block elements
  html = html.replace(/<p class="amfn-md-p"><\/p>/g, "");
  html = html.replace(/<p class="amfn-md-p">(<(?:h[2-4]|ul|ol))/g, "$1");
  html = html.replace(/(<\/(?:h[2-4]|ul|ol)>)<\/p>/g, "$1");
  html = html.replace(/<p class="amfn-md-p"><br>/g, '<p class="amfn-md-p">');

  return html;
}

export function AmfnChatMessage({ role, content }: AmfnChatMessageProps) {
  const isUser = role === "user";

  return (
    <div className={`flex gap-3 amfn-fade-up ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center mt-0.5 ${
          isUser
            ? "bg-[#EF4444]/10 text-[#EF4444]"
            : "bg-[#3B82F6]/10 border border-[#3B82F6]/20 text-[#3B82F6]"
        }`}
      >
        {isUser ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
      </div>
      <div
        className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
          isUser
            ? "bg-[#EF4444] text-white"
            : "bg-white border-l-2 border-[#3B82F6]/30 text-gray-700 shadow-sm"
        }`}
      >
        {isUser ? (
          <div className="whitespace-pre-wrap">{content}</div>
        ) : (
          <div
            className="amfn-md-content"
            dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }}
          />
        )}
      </div>
    </div>
  );
}
