// ─── Gemini API (Google) ─────────────────────────────────────────────────────
// Get your key at: https://aistudio.google.com/apikey

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

// ─── Helper: convert OpenAI-style messages -> Gemini format ─────────────────
// Gemini wants: { systemInstruction, contents: [{ role: "user"|"model", parts: [{text}] }] }
// Any "system" message is pulled out into systemInstruction. "assistant" -> "model".
function toGeminiPayload(messages, temperature) {
  const systemMsg = messages.find((m) => m.role === "system");
  const rest = messages.filter((m) => m.role !== "system");

  const contents = rest.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const payload = {
    contents,
    generationConfig: {
      temperature,
      maxOutputTokens: 1000,
    },
  };

  if (systemMsg) {
    payload.systemInstruction = { parts: [{ text: systemMsg.content }] };
  }

  return payload;
}

// ─── Helper: call Gemini ─────────────────────────────────────────────────────
async function callGemini(messages, temperature = 0.7) {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set in environment variables");
  }

  const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(toGeminiPayload(messages, temperature)),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || "Gemini API error");
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

// ─── POST /api/ai/score ───────────────────────────────────────────────────────
// Score a task's urgency and return an AI tip
const scoreTask = async (req, res) => {
  try {
    const { title, category, hoursLeft } = req.body;

    if (!title || hoursLeft === undefined) {
      return res.status(400).json({ success: false, message: "title and hoursLeft are required" });
    }

    const messages = [
      {
        role: "system",
        content: `You are a productivity AI. Given a task, return ONLY a valid JSON object with:
- urgency: integer 1-10 based on deadline proximity and task type
- tip: one actionable sentence under 15 words to start the task immediately
No markdown, no backticks, no explanation. Just raw JSON.`,
      },
      {
        role: "user",
        content: `Task: "${title}", Category: ${category}, Hours until deadline: ${hoursLeft}`,
      },
    ];

    const text = await callGemini(messages, 0.5);
    const cleaned = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    res.json({ success: true, data: parsed });
  } catch (error) {
    console.error("Score task error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── POST /api/ai/chat ────────────────────────────────────────────────────────
// Multi-turn chat with Gemini as productivity coach
const chat = async (req, res) => {
  try {
    const { messages, tasks } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ success: false, message: "messages array is required" });
    }

    const taskSummary = tasks?.length
      ? tasks.map((t) =>
          `- "${t.title}" | urgency: ${t.urgency}/10 | deadline: ${new Date(t.deadline).toLocaleString()} | ${t.completed ? "DONE" : "PENDING"}`
        ).join("\n")
      : "No tasks yet.";

    const systemMessage = {
      role: "system",
      content: `You are LifeSaver AI, an elite productivity coach powered by Gemini.
Help users beat deadlines, prioritize smartly, and take action NOW.
Be direct, energetic, and specific. No fluff. Use line breaks for readability.
Current user tasks:
${taskSummary}
Today: ${new Date().toLocaleString()}`,
    };

    const allMessages = [systemMessage, ...messages];
    const reply = await callGemini(allMessages, 0.8);

    res.json({ success: true, data: { reply } });
  } catch (error) {
    console.error("Chat error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { scoreTask, chat };