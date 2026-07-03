import { useState, useEffect, useRef } from "react";
import TaskCard      from "./components/TaskCard";
import ChatMessage   from "./components/ChatMessage";
import StatsBar      from "./components/StatsBar";
import AddTaskForm   from "./components/AddTaskForm";
import { scoreTask, callGeminiChat, toGeminiHistory } from "./services/gemini";
import { getTimeLeft, estimateUrgency } from "./utils/helpers";

const SEED_TASKS = [
  {
    id: 1,
    title: "Submit project proposal",
    deadline: new Date(Date.now() + 3 * 3600000).toISOString(),
    category: "Work",
    urgency: 9,
    completed: false,
    aiTip: "Start with the executive summary — it unblocks everything else.",
  },
  {
    id: 2,
    title: "Pay electricity bill",
    deadline: new Date(Date.now() + 26 * 3600000).toISOString(),
    category: "Finance",
    urgency: 6,
    completed: false,
    aiTip: "Takes 3 min online. Do it right after your next break.",
  },
  {
    id: 3,
    title: "Review presentation slides",
    deadline: new Date(Date.now() + 72 * 3600000).toISOString(),
    category: "Work",
    urgency: 3,
    completed: false,
    aiTip: "Schedule a 30-min block tomorrow morning when you're fresh.",
  },
];

const INIT_CHAT = [
  {
    role: "assistant",
    content:
      "Hey! I'm your AI productivity companion ⚡\n\nTell me about your tasks, deadlines, or ask me to help plan your day. I can prioritize your work and help you avoid last-minute panic.",
  },
];

const QUICK_PROMPTS = [
  "Prioritize my day",
  "What's most urgent?",
  "Help me beat procrastination",
  "Plan next 2 hours",
];

export default function App() {
  const [tasks,     setTasks]     = useState(SEED_TASKS);
  const [chat,      setChat]      = useState(INIT_CHAT);
  const [input,     setInput]     = useState("");
  const [loading,   setLoading]   = useState(false);
  const [showAdd,   setShowAdd]   = useState(false);
  const [activeTab, setActiveTab] = useState("tasks");
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return b.urgency - a.urgency;
  });

  const stats = {
    critical: tasks.filter((t) => !t.completed && t.urgency >= 8).length,
    urgent:   tasks.filter((t) => !t.completed && t.urgency >= 5 && t.urgency < 8).length,
    done:     tasks.filter((t) => t.completed).length,
    total:    tasks.length,
  };
  const progressPct =
    stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

  async function handleAddTask(form) {
    setShowAdd(false);
    const timeLeft  = getTimeLeft(form.deadline);
    const hoursLeft = Math.max(0, Math.floor(timeLeft.ms / 3600000));
    const taskId    = Date.now();

    setTasks((prev) => [
      ...prev,
      {
        id: taskId,
        ...form,
        urgency:   estimateUrgency(hoursLeft),
        completed: false,
        aiTip:     "Analyzing with Gemini AI…",
      },
    ]);

    try {
      const result = await scoreTask({ title: form.title, category: form.category, hoursLeft });
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? {
                ...t,
                urgency: result.urgency ?? estimateUrgency(hoursLeft),
                aiTip:   result.tip     ?? "Break it into small steps and start now.",
              }
            : t
        )
      );
    } catch (err) {
      console.error("Gemini score error:", err);
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? { ...t, aiTip: "Start with the smallest possible first step right now." }
            : t
        )
      );
    }
  }

  function toggleComplete(id) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  }

  function deleteTask(id) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input };
    const newChat = [...chat, userMsg];
    setChat(newChat);
    setInput("");
    setLoading(true);

    const taskSummary = tasks
      .map((t) => `- "${t.title}" | urgency: ${t.urgency}/10 | deadline: ${new Date(t.deadline).toLocaleString()} | ${t.completed ? "DONE" : "PENDING"}`)
      .join("\n");

    const systemPrompt = `You are LifeSaver AI, an elite productivity coach.
Help users beat deadlines, prioritize smartly, and take action NOW.
Be direct, energetic, and specific. No fluff. Use line breaks for readability.
Current user tasks:\n${taskSummary || "No tasks yet."}
Today: ${new Date().toLocaleString()}`;

    try {
      const history = toGeminiHistory(newChat);
      const reply   = await callGeminiChat(systemPrompt, history);
      setChat((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      console.error("Gemini chat error:", err);
      setChat((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I couldn't connect right now. Check your VITE_GEMINI_KEY and try again." },
      ]);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-bg text-slate-100 font-grotesk flex flex-col">

      <header className="bg-surface border-b border-border px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-[18px]"
            style={{ background: "linear-gradient(135deg, #F59E0B, #EF4444)" }}
          >
            ⚡
          </div>
          <div>
            <p className="font-bold text-base tracking-wide">LifeSaver AI</p>
            <p className="text-[11px] text-muted">Your last-minute productivity companion</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {stats.critical > 0 && (
            <div
              className="text-danger text-xs font-bold tracking-wide px-3 py-1 rounded-full border animate-pulse2"
              style={{ background: "#EF444422", borderColor: "#EF444444" }}
            >
              🔴 {stats.critical} CRITICAL
            </div>
          )}
          <span className="text-xs text-muted">{progressPct}% complete</span>
        </div>
      </header>

      <StatsBar stats={stats} progressPct={progressPct} />

      <nav className="bg-surface border-b border-border px-5 flex">
        {[["tasks", "📋 Tasks"], ["chat", "💬 AI Assistant"]].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`text-[13px] font-semibold px-4 py-2.5 border-b-2 transition-all cursor-pointer bg-transparent border-x-0 border-t-0 ${
              activeTab === key ? "text-amber border-amber" : "text-muted border-transparent hover:text-subtle"
            }`}
          >
            {label}
          </button>
        ))}
      </nav>

      <main className="flex-1 overflow-auto p-5">
        {activeTab === "tasks" && (
          <div className="max-w-2xl mx-auto">
            {!showAdd ? (
              <button
                onClick={() => setShowAdd(true)}
                className="w-full text-amber font-semibold text-sm py-3 rounded-xl mb-4 border border-dashed cursor-pointer bg-transparent hover:brightness-110 transition"
                style={{ borderColor: "#F59E0B66", background: "#F59E0B0D" }}
              >
                + Add New Task
              </button>
            ) : (
              <AddTaskForm onAdd={handleAddTask} onCancel={() => setShowAdd(false)} />
            )}

            {sortedTasks.length === 0 ? (
              <div className="text-center py-16 text-muted">
                <p className="text-4xl mb-3">🎯</p>
                <p className="font-semibold mb-1">No tasks yet</p>
                <p className="text-sm">Add your first task to get started</p>
              </div>
            ) : (
              sortedTasks.map((task) => (
                <TaskCard key={task.id} task={task} onComplete={toggleComplete} onDelete={deleteTask} />
              ))
            )}
          </div>
        )}

        {activeTab === "chat" && (
          <div className="max-w-2xl mx-auto flex flex-col" style={{ height: "calc(100vh - 220px)" }}>
            <div className="flex-1 overflow-y-auto pr-1">
              {chat.map((msg, i) => <ChatMessage key={i} msg={msg} />)}
              {loading && (
                <div className="flex items-center gap-2 text-muted text-[13px]">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[13px]"
                    style={{ background: "linear-gradient(135deg, #3B82F6, #F59E0B)" }}
                  >⚡</div>
                  <span className="animate-pulse2">Thinking…</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="flex gap-2 mb-2.5 flex-wrap pt-3">
              {QUICK_PROMPTS.map((q) => (
                <button
                  key={q}
                  onClick={() => setInput(q)}
                  className="bg-card border border-border text-subtle text-xs rounded-full px-3 py-1.5 cursor-pointer hover:border-subtle transition font-grotesk"
                >
                  {q}
                </button>
              ))}
            </div>

            <div className="flex gap-2.5">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                rows={2}
                placeholder="Ask me anything about your tasks, deadlines, or productivity…"
                className="flex-1 bg-card border border-border rounded-xl px-3.5 py-3 text-slate-100 text-[13px] resize-none leading-relaxed font-grotesk placeholder:text-muted"
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className={`px-5 rounded-xl text-lg border-0 transition cursor-pointer ${
                  loading || !input.trim() ? "bg-border text-muted cursor-not-allowed" : "bg-amber text-bg hover:brightness-110"
                }`}
              >
                ➤
              </button>
            </div>
            <p className="text-[11px] text-muted mt-1.5 text-center">
              Enter to send · Shift+Enter for new line
            </p>
          </div>
        )}
      </main>
    </div>
  );
}