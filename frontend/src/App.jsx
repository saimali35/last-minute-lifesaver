import { useState, useEffect, useRef } from "react";
import TaskCard from "./components/TaskCard";
import ChatMessage from "./components/ChatMessage";
import StatsBar from "./components/StatsBar";
import AddTaskForm from "./components/AddTaskForm";
import {
  fetchTasks,
  createTask as apiCreateTask,
  updateTaskRemote,
  deleteTaskRemote,
  scoreTask,
  chatWithAI,
} from "./services/api";
import { getTimeLeft, estimateUrgency } from "./utils/helpers";

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

function normalizeTask(t) {
  return { ...t, id: t._id };
}

export default function App() {
  const [tasks,        setTasks]        = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [tasksError,   setTasksError]   = useState("");
  const [chat,         setChat]         = useState(INIT_CHAT);
  const [input,        setInput]        = useState("");
  const [loading,      setLoading]      = useState(false);
  const [showAdd,      setShowAdd]      = useState(false);
  const [activeTab,    setActiveTab]    = useState("tasks");
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  useEffect(() => {
    (async () => {
      try {
        const remoteTasks = await fetchTasks();
        setTasks(remoteTasks.map(normalizeTask));
      } catch (err) {
        console.error("Fetch tasks error:", err);
        setTasksError("Couldn't load your tasks. Try refreshing the page.");
      } finally {
        setTasksLoading(false);
      }
    })();
  }, []);

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

    try {
      const created = normalizeTask(
        await apiCreateTask({
          title:    form.title,
          deadline: form.deadline,
          category: form.category,
          urgency:  estimateUrgency(hoursLeft),
          aiTip:    "Analyzing with Gemini AI…",
        })
      );
      setTasks((prev) => [...prev, created]);

      try {
        const result = await scoreTask({ title: form.title, category: form.category, hoursLeft });
        const updated = normalizeTask(
          await updateTaskRemote(created.id, {
            urgency: result.urgency ?? created.urgency,
            aiTip:   result.tip ?? "Break it into small steps and start now.",
          })
        );
        setTasks((prev) => prev.map((t) => (t.id === created.id ? updated : t)));
      } catch (err) {
        console.error("Score error:", err);
        const fallback = normalizeTask(
          await updateTaskRemote(created.id, {
            aiTip: "Start with the smallest possible first step right now.",
          })
        );
        setTasks((prev) => prev.map((t) => (t.id === created.id ? fallback : t)));
      }
    } catch (err) {
      console.error("Create task error:", err);
      setTasksError("Couldn't save that task. Please try again.");
    }
  }

  async function toggleComplete(id) {
    const target = tasks.find((t) => t.id === id);
    if (!target) return;
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
    try {
      await updateTaskRemote(id, { completed: !target.completed });
    } catch (err) {
      console.error("Toggle error:", err);
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, completed: target.completed } : t))
      );
    }
  }

  async function deleteTask(id) {
    const prevTasks = tasks;
    setTasks((prev) => prev.filter((t) => t.id !== id));
    try {
      await deleteTaskRemote(id);
    } catch (err) {
      console.error("Delete error:", err);
      setTasks(prevTasks);
    }
  }

  async function editTask(id, updates) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
    try {
      await updateTaskRemote(id, updates);
    } catch (err) {
      console.error("Edit error:", err);
    }
  }

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input };
    const newChat = [...chat, userMsg];
    setChat(newChat);
    setInput("");
    setLoading(true);

    try {
      const reply = await chatWithAI(newChat, tasks);
      setChat((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      console.error("Chat error:", err);
      setChat((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I couldn't connect right now. Please try again in a moment." },
      ]);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-bg text-slate-100 font-grotesk flex flex-col">

      <header className="bg-surface border-b border-border pl-5 pr-24 py-3.5 flex items-center justify-between">
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
            {tasksError && (
              <p className="text-danger text-sm mb-4 bg-[#EF444411] px-3 py-2 rounded-lg">
                {tasksError}
              </p>
            )}

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

            {tasksLoading ? (
              <div className="text-center py-16 text-muted">
                <p className="text-sm">Loading your tasks…</p>
              </div>
            ) : sortedTasks.length === 0 ? (
              <div className="text-center py-16 text-muted">
                <p className="text-4xl mb-3">🎯</p>
                <p className="font-semibold mb-1">No tasks yet</p>
                <p className="text-sm">Add your first task to get started</p>
              </div>
            ) : (
              sortedTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onComplete={toggleComplete}
                  onDelete={deleteTask}
                  onEdit={editTask}
                />
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