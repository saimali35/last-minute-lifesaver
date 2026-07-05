

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

// ─── POST /api/ai/score ───────────────────────────────────────────────────────
export async function scoreTask({ title, category, hoursLeft }) {
  const res = await fetch(`${API_BASE_URL}/ai/score`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, category, hoursLeft }),
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data?.message || "Failed to score task");
  }

  return data.data; // { urgency, tip }
}

// ─── POST /api/ai/chat ────────────────────────────────────────────────────────
// history: array of { role: "user" | "assistant", content: string }
// tasks: optional array of task objects for context
export async function chatWithAI(history, tasks = []) {
  const res = await fetch(`${API_BASE_URL}/ai/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: history, tasks }),
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data?.message || "Failed to get AI reply");
  }

  return data.data.reply; // string
}