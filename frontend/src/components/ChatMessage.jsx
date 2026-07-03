export default function ChatMessage({ msg }) {
  const isUser = msg.role === "user";

  return (
    <div className={`flex mb-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {/* AI avatar */}
      {!isUser && (
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[13px] mr-2 mt-0.5 flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #3B82F6, #F59E0B)" }}
        >
          ⚡
        </div>
      )}

      <div
        className={`max-w-[78%] text-[13px] text-slate-100 leading-relaxed whitespace-pre-wrap px-3.5 py-2.5 font-grotesk ${
          isUser
            ? "rounded-[14px_14px_4px_14px]"
            : "rounded-[14px_14px_14px_4px]"
        }`}
        style={{
          background: isUser ? "#3B82F622" : "#1A2235",
          border:     `1px solid ${isUser ? "#3B82F644" : "#242E42"}`,
        }}
      >
        {msg.content}
        {msg.isStreaming && (
          <span className="opacity-50 animate-blink">▌</span>
        )}
      </div>
    </div>
  );
}