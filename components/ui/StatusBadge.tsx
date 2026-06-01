interface StatusBadgeProps {
  status: "operational" | "deployed" | "active" | "building" | "archived" | "deprecated";
  className?: string;
}

const STATUS_CONFIG = {
  operational: { label: "OPERATIONAL", color: "var(--status-green)" },
  deployed:    { label: "DEPLOYED",    color: "var(--status-green)" },
  active:      { label: "ACTIVE",      color: "var(--status-green)" },
  building:    { label: "BUILDING",    color: "var(--status-amber)" },
  archived:    { label: "ARCHIVED",    color: "var(--text-muted)" },
  deprecated:  { label: "DEPRECATED",  color: "var(--status-red)" },
};

export default function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const { label, color } = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono text-[11px] font-medium tracking-widest uppercase ${className}`}
      style={{ color: "var(--text-muted)" }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full animate-pulse"
        style={{ background: color, flexShrink: 0, animationDuration: status === "building" ? "1s" : "3s" }}
        aria-hidden="true"
      />
      {label}
    </span>
  );
}
