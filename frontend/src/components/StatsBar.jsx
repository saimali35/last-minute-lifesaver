const STATS = [
  { key: "critical", label: "Critical",   color: "#EF4444" },
  { key: "urgent",   label: "Urgent",     color: "#F59E0B" },
  { key: "done",     label: "Completed",  color: "#10B981" },
  { key: "total",    label: "Total",      color: "#3B82F6" },
];

export default function StatsBar({ stats, progressPct }) {
  return (
    <div className="bg-surface border-b border-border px-5 py-2.5 flex items-center gap-5 flex-wrap">
      {STATS.map(({ key, label, color }) => (
        <div key={key} className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: color }}
          />
          <span className="text-[13px] text-muted">{label}:</span>
          <span className="text-[13px] font-bold" style={{ color }}>
            {stats[key]}
          </span>
        </div>
      ))}

      {/* Progress bar */}
      <div className="flex-1 min-w-[80px]">
        <div className="h-1 bg-border rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width:      `${progressPct}%`,
              background: "linear-gradient(90deg, #3B82F6, #10B981)",
            }}
          />
        </div>
      </div>
    </div>
  );
}