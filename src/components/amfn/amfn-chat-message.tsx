import { Bot, User } from "lucide-react";

interface AmfnChatMessageProps {
  role: "user" | "assistant";
  content: string;
}

export function AmfnChatMessage({ role, content }: AmfnChatMessageProps) {
  const isUser = role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
          isUser
            ? "bg-[#c53030]/20 text-[#c53030]"
            : "bg-white/10 text-gray-300"
        }`}
      >
        {isUser ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
      </div>
      <div
        className={`max-w-[80%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
          isUser
            ? "bg-[#c53030] text-white"
            : "bg-white/5 border border-white/10 text-gray-200"
        }`}
      >
        <div className="whitespace-pre-wrap">{content}</div>
      </div>
    </div>
  );
}
