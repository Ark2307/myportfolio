"use client";

import { useEffect, useState } from "react";

function format(date: Date) {
  const time = date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const day = date
    .toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    .toUpperCase()
    .replace(/,/g, "");
  return `${time} IST · ${day}`;
}

interface LiveClockProps {
  className?: string;
}

/** Ticking mono status readout. Renders a static placeholder until mounted
 *  so server and first client paint match (no hydration mismatch). */
export default function LiveClock({ className = "" }: LiveClockProps) {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => setLabel(format(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className={`annotation tabular-nums ${className}`}>
      {label ?? "--:--:-- IST · --- -- ----"}
    </span>
  );
}
