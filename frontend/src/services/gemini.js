const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ─── Chat via Backend ─────────────────────────────────────────────────────────
// Backend expects: { messages: [{role, content}], tasks: [...] }
// history here is already in { role, content } form (role: "user" | "assistant")
export async function callGeminiChat(systemPrompt, history) {
  const res = await fetch(`${BASE_URL}/ai/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages: history,
      tasks: [],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || "Backend AI error");
  }

  const data = await res.json();
  return data.data?.reply || "";
}

// ─── Score Task via Backend ───────────────────────────────────────────────────
export async function scoreTask({ title, category, hoursLeft }) {
  const res = await fetch(`${BASE_URL}/ai/score`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title,
      category,
      hoursLeft,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || "Backend AI error");
  }

  const data = await res.json();
  return data.data;
}

// ─── Keep compatibility with existing App.jsx code ───────────────────────────
// App.jsx passes { role: "user"|"assistant", content } messages through this
// before calling callGeminiChat — backend already accepts that shape directly,
// so this just passes messages through unchanged.
export function toGeminiHistory(messages) {
  return messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));
}