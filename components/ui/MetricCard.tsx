import { ReactNode } from "react";

interface MetricCardProps {
  label: string;
  value: string;
  sub?: string;
  icon?: ReactNode;
  className?: string;
}

export default function MetricCard({ label, value, sub, icon, className = "" }: MetricCardProps) {
  return (
    <div
      className={`card p-4 flex flex-col gap-2 ${className}`}
      style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
    >
      <div className="flex items-center justify-between">
        <span className="annotation" style={{ color: "var(--text-muted)" }}>{label}</span>
        {icon && <span style={{ color: "var(--accent)" }}>{icon}</span>}
      </div>
      <span
        className="text-2xl font-bold tracking-tight"
        style={{ fontFamily: "var(--font-ibm)", color: "var(--text)" }}
      >
        {value}
      </span>
      {sub && (
        <span className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
          {sub}
        </span>
      )}
    </div>
  );
}
