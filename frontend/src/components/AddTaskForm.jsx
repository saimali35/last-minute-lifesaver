import { useState } from "react";

const CATEGORIES = ["Work", "Study", "Finance", "Health", "Personal"];

export default function AddTaskForm({ onAdd, onCancel }) {
  const [form, setForm] = useState({ title: "", deadline: "", category: "Work" });

  function handleSubmit() {
    if (!form.title.trim() || !form.deadline) return;
    onAdd(form);
    setForm({ title: "", deadline: "", category: "Work" });
  }

  return (
    <div className="bg-card border border-border rounded-xl p-4 mb-4 font-grotesk">
      <p className="text-[13px] font-semibold text-amber mb-3">
        ⚡ New Task — Gemini AI will score urgency automatically
      </p>

      {/* Title */}
      <input
        value={form.title}
        onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
        placeholder="What needs to get done?"
        className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-slate-100 text-sm mb-2.5 font-grotesk placeholder:text-muted"
      />

      {/* Deadline + Category */}
      <div className="flex gap-2.5 mb-3">
        <input
          type="datetime-local"
          value={form.deadline}
          onChange={(e) => setForm((p) => ({ ...p, deadline: e.target.value }))}
          className="flex-[2] bg-surface border border-border rounded-lg px-3 py-2.5 text-slate-100 text-[13px] font-grotesk"
        />
        <select
          value={form.category}
          onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
          className="flex-1 bg-surface border border-border rounded-lg px-3 py-2.5 text-slate-100 text-[13px] font-grotesk"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          className="flex-1 bg-amber text-bg font-bold text-sm py-2.5 rounded-lg hover:brightness-110 transition cursor-pointer border-0"
        >
          ⚡ Add Task & Get AI Tip
        </button>
        <button
          onClick={onCancel}
          className="px-4 bg-transparent border border-border text-muted text-sm rounded-lg hover:border-subtle transition cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}