const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

function authHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ─── GET /api/tasks ───────────────────────────────────────────────────────────
export async function fetchTasks() {
  const res = await fetch(`${API_BASE_URL}/tasks`, {
    headers: authHeaders(),
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data?.message || "Failed to fetch tasks");
  }

  return data.data; // array of tasks
}

// ─── POST /api/tasks ──────────────────────────────────────────────────────────
export async function createTask(task) {
  const res = await fetch(`${API_BASE_URL}/tasks`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(task),
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data?.message || "Failed to create task");
  }

  return data.data; // created task
}

// ─── PUT /api/tasks/:id ───────────────────────────────────────────────────────
export async function updateTaskRemote(id, updates) {
  const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(updates),
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data?.message || "Failed to update task");
  }

  return data.data; // updated task
}

// ─── DELETE /api/tasks/:id ────────────────────────────────────────────────────
export async function deleteTaskRemote(id) {
  const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data?.message || "Failed to delete task");
  }

  return true;
}

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