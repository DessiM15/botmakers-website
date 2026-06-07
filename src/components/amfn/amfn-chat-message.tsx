import { Bot, User } from "lucide-react";

interface AmfnChatMessageProps {
  role: "user" | "assistant";
  content: string;
}

export function AmfnChatMessage({ role, content }: AmfnChatMessageProps) {
  const isUser = role === "user";

  return (
    <div className={`flex gap-3 amfn-fade-up ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center ${
          isUser
            ? "bg-[#EF4444]/10 text-[#EF4444]"
            : "bg-[#3B82F6]/10 border border-[#3B82F6]/20 text-[#3B82F6]"
        }`}
      >
        {isUser ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
      </div>
      <div
        className={`max-w-[80%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
          isUser
            ? "bg-[#EF4444] text-white"
            : "bg-white border-l-2 border-[#3B82F6]/30 text-gray-700 shadow-sm"
        }`}
      >
        <div className="whitespace-pre-wrap">{content}</div>
      </div>
    </div>
  );
}
