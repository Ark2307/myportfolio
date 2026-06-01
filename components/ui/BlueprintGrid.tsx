"use client";

interface BlueprintGridProps {
  className?: string;
  size?: "sm" | "lg";
  showCornerMarks?: boolean;
}

export default function BlueprintGrid({
  className = "",
  size = "sm",
  showCornerMarks = false,
}: BlueprintGridProps) {
  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <div className={`absolute inset-0 ${size === "lg" ? "blueprint-grid-lg" : "blueprint-grid"} opacity-60`} />

      {showCornerMarks && (
        <>
          {/* Corner crosshair marks */}
          <svg className="absolute top-6 left-6 opacity-30" width="20" height="20" viewBox="0 0 20 20">
            <line x1="10" y1="0" x2="10" y2="8" stroke="var(--accent)" strokeWidth="1" />
            <line x1="10" y1="12" x2="10" y2="20" stroke="var(--accent)" strokeWidth="1" />
            <line x1="0" y1="10" x2="8" y2="10" stroke="var(--accent)" strokeWidth="1" />
            <line x1="12" y1="10" x2="20" y2="10" stroke="var(--accent)" strokeWidth="1" />
            <circle cx="10" cy="10" r="1.5" fill="var(--accent)" />
          </svg>
          <svg className="absolute top-6 right-6 opacity-30" width="20" height="20" viewBox="0 0 20 20">
            <line x1="10" y1="0" x2="10" y2="8" stroke="var(--accent)" strokeWidth="1" />
            <line x1="10" y1="12" x2="10" y2="20" stroke="var(--accent)" strokeWidth="1" />
            <line x1="0" y1="10" x2="8" y2="10" stroke="var(--accent)" strokeWidth="1" />
            <line x1="12" y1="10" x2="20" y2="10" stroke="var(--accent)" strokeWidth="1" />
            <circle cx="10" cy="10" r="1.5" fill="var(--accent)" />
          </svg>
          <svg className="absolute bottom-6 left-6 opacity-30" width="20" height="20" viewBox="0 0 20 20">
            <line x1="10" y1="0" x2="10" y2="8" stroke="var(--accent)" strokeWidth="1" />
            <line x1="10" y1="12" x2="10" y2="20" stroke="var(--accent)" strokeWidth="1" />
            <line x1="0" y1="10" x2="8" y2="10" stroke="var(--accent)" strokeWidth="1" />
            <line x1="12" y1="10" x2="20" y2="10" stroke="var(--accent)" strokeWidth="1" />
            <circle cx="10" cy="10" r="1.5" fill="var(--accent)" />
          </svg>
          <svg className="absolute bottom-6 right-6 opacity-30" width="20" height="20" viewBox="0 0 20 20">
            <line x1="10" y1="0" x2="10" y2="8" stroke="var(--accent)" strokeWidth="1" />
            <line x1="10" y1="12" x2="10" y2="20" stroke="var(--accent)" strokeWidth="1" />
            <line x1="0" y1="10" x2="8" y2="10" stroke="var(--accent)" strokeWidth="1" />
            <line x1="12" y1="10" x2="20" y2="10" stroke="var(--accent)" strokeWidth="1" />
            <circle cx="10" cy="10" r="1.5" fill="var(--accent)" />
          </svg>
        </>
      )}
    </div>
  );
}
