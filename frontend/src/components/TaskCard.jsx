import UrgencyRing from "./UrgencyRing";
import { getTimeLeft, getUrgencyLabel, getUrgencyHex } from "../utils/helpers";

export default function TaskCard({ task, onComplete, onDelete }) {
  const timeLeft     = getTimeLeft(task.deadline);
  const isOverdue    = timeLeft.ms < 0;
  const urgencyColor = isOverdue ? "#EF4444" : getUrgencyHex(task.urgency);
  const label        = isOverdue ? "OVERDUE" : getUrgencyLabel(task.urgency);

  return (
    <div
      className="rounded-xl p-4 mb-3 transition-all duration-200 font-grotesk"
      style={{
        background:   "#1A2235",
        border:       `1px solid ${urgencyColor}33`,
        borderLeft:   `3px solid ${urgencyColor}`,
        boxShadow:    `0 0 12px ${urgencyColor}11`,
        opacity:      task.completed ? 0.5 : 1,
      }}
    >
      <div className="flex items-start gap-3">
        {/* Urgency ring */}
        <UrgencyRing score={task.urgency} size={44} />

        {/* Task info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span
              className={`text-sm font-semibold ${
                task.completed ? "line-through text-muted" : "text-slate-100"
              }`}
            >
              {task.title}
            </span>
            <span
              className="text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded"
              style={{
                color:      urgencyColor,
                background: `${urgencyColor}1A`,
              }}
            >
              {label}
            </span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <span
              className="text-xs"
              style={{ color: isOverdue ? "#EF4444" : "#64748B" }}
            >
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