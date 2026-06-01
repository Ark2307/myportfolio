interface SectionLabelProps {
  label: string;
  className?: string;
}

export default function SectionLabel({ label, className = "" }: SectionLabelProps) {
  return (
    <div className={`flex items-center gap-3 mb-3 ${className}`}>
      <span
        className="font-mono text-[11px] font-medium tracking-[0.15em] uppercase"
        style={{ color: "var(--accent)" }}
      >
        {label}
      </span>
      <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
    </div>
  );
}
