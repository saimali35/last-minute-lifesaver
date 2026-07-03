const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY;

const BASE_URL = "https://api.groq.com/openai/v1/chat/completions";

async function callGroq(systemPrompt, userPrompt) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err?.error?.message || "Groq API error");
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

export async function callGeminiChat(systemPrompt, history) {
  const messages = [
    {
      role: "system",
      content: systemPrompt,
    },
    ...history.map((m) => ({
      role: m.role === "model" ? "assistant" : "user",
      content: m.parts?.[0]?.text || "",
    })),
  ];

  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages,
      temperature: 0.8,
      max_tokens: 1000,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err?.error?.message || "Groq API error");
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

export async function scoreTask({ title, category, hoursLeft }) {
  const system = `You are a productivity AI. Given a task, return ONLY a valid JSON object with:
- urgency: integer 1-10 based on deadline and task type
- tip: one actionable sentence under 15 words to start the task immediately
No markdown, no backticks, no explanation. Just raw JSON.`;

  const prompt = `Task: "${title}", Category: ${category}, Hours until deadline: ${hoursLeft}`;

  const text = await callGroq(system, prompt);
  const cleaned = text.replace(/```json|```/g, "").trim();

  return JSON.parse(cleaned);
}

export function toGeminiHistory(messages) {
  return messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
}