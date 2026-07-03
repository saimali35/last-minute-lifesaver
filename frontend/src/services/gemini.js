const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ─── Chat via Backend ─────────────────────────────────────────────────────────
export async function callGeminiChat(systemPrompt, history) {
  const res = await fetch(`${BASE_URL}/api/ai/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      systemPrompt,
      history,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err?.error || "Backend AI error");
  }

  const data = await res.json();
  return data.data?.reply || data.reply || "";
}

// ─── Score Task via Backend ───────────────────────────────────────────────────
export async function scoreTask({ title, category, hoursLeft }) {
  const res = await fetch(`${BASE_URL}/api/ai/score`, {
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
    const err = await res.json();
    throw new Error(err?.error || "Backend AI error");
  }

  const data = await res.json();
  return data.data;
}

// ─── Keep compatibility with existing code ───────────────────────────────────
export function toGeminiHistory(messages) {
  return messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
}