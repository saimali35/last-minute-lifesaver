import { useState } from "react";
import UrgencyRing from "./UrgencyRing";
import { getTimeLeft, getUrgencyLabel, getUrgencyHex } from "../utils/helpers";

const CATEGORIES = ["Work", "Study", "Finance", "Health", "Personal"];

export default function TaskCard({ task, onComplete, onDelete, onEdit }) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    title:    task.title,
    deadline: task.deadline.slice(0, 16),
    category: task.category,
  });

  const timeLeft     = getTimeLeft(task.deadline);
  const isOverdue    = timeLeft.ms < 0;
  const urgencyColor = isOverdue ? "#EF4444" : getUrgencyHex(task.urgency);
  const label        = isOverdue ? "OVERDUE" : getUrgencyLabel(task.urgency);

  function handleSave() {
    if (!form.title.trim() || !form.deadline) return;
    onEdit(task.id, form);
    setIsEditing(false);
  }

  // ── Edit mode ──────────────────────────────────────────────────────────────
  if (isEditing) {
    return (
      <div
        className="rounded-xl p-4 mb-3 font-grotesk"
        style={{
          background: "#1A2235",
          border:     `1px solid ${urgencyColor}55`,
          borderLeft: `3px solid ${urgencyColor}`,
        }}
      >
        <p className="text-[12px] font-semibold text-amber mb-3">✏️ Editing Task</p>

        {/* Title */}
        <input
          value={form.title}
          onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
          placeholder="Task title"
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

        {/* Save / Cancel */}
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="flex-1 bg-amber text-bg font-bold text-sm py-2 rounded-lg hover:brightness-110 transition cursor-pointer border-0"
          >
            ✓ Save Changes
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className="px-4 bg-transparent border border-border text-muted text-sm rounded-lg hover:border-subtle transition cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // ── Normal view ────────────────────────────────────────────────────────────
  return (
    <div
      className="rounded-xl p-4 mb-3 transition-all duration-200 font-grotesk"
      style={{
        background: "#1A2235",
        border:     `1px solid ${urgencyColor}33`,
        borderLeft: `3px solid ${urgencyColor}`,
        boxShadow:  `0 0 12px ${urgencyColor}11`,
        opacity:    task.completed ? 0.5 : 1,
      }}
    >
      <div className="flex items-start gap-3">
        <UrgencyRing score={task.urgency} size={44} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`text-sm font-semibold ${task.completed ? "line-through text-muted" : "text-slate-100"}`}>
              {task.title}
            </span>
            <span
              className="text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded"
              style={{ color: urgencyColor, background: `${urgencyColor}1A` }}
            >
              {label}
            </span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs" style={{ color: isOverdue ? "#EF4444" : "#64748B" }}>
              ⏰ {timeLeft.label}
            </span>
            {task.category && (
              <span className="text-[11px] text-subtle bg-border px-2 py-0.5 rounded-full">
                {task.category}
              </span>
            )}
          </div>

          {task.aiTip && (
            <div className="mt-2 text-xs text-subtle leading-relaxed pl-2 border-l-2 border-info">
              💡 {task.aiTip}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-1.5 flex-shrink-0">
          {!task.completed && (
            <button
              onClick={() => onComplete(task.id)}
              className="bg-[#064E3B] text-success text-xs font-semibold px-2.5 py-1 rounded-md hover:bg-success hover:text-bg transition-colors cursor-pointer border-0"
            >
              ✓ Done
            </button>
          )}
          <button
            onClick={() => setIsEditing(true)}
            className="bg-transparent text-info text-xs px-2.5 py-1 rounded-md border border-border hover:border-info transition-colors cursor-pointer"
          >
            ✏️ Edit
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="bg-transparent text-muted text-xs px-2.5 py-1 rounded-md border border-border hover:border-danger hover:text-danger transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}