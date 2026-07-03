// Returns Tailwind text color class based on urgency score
export function getUrgencyColorClass(score) {
  if (score >= 8) return "text-danger";
  if (score >= 5) return "text-amber";
  return "text-success";
}

// Returns hex color for SVG usage (Tailwind can't set SVG stroke dynamically)
export function getUrgencyHex(score) {
  if (score >= 8) return "#EF4444";
  if (score >= 5) return "#F59E0B";
  return "#10B981";
}

export function getUrgencyLabel(score) {
  if (score >= 8) return "CRITICAL";
  if (score >= 5) return "URGENT";
  return "ON TRACK";
}

export function getTimeLeft(deadline) {
  const now = new Date();
  const due = new Date(deadline);
  const diff = due - now;
  if (diff < 0) return { label: "OVERDUE", ms: diff };
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(hours / 24);
  if (days > 0) return { label: `${days}d ${hours % 24}h left`, ms: diff };
  if (hours > 0) return { label: `${hours}h left`, ms: diff };
  const mins = Math.floor(diff / 60000);
  return { label: `${mins}m left`, ms: diff };
}

// Estimate urgency locally before AI responds
export function estimateUrgency(hoursLeft) {
  if (hoursLeft < 2)  return 10;
  if (hoursLeft < 6)  return 9;
  if (hoursLeft < 24) return 7;
  if (hoursLeft < 48) return 5;
  return 3;
}