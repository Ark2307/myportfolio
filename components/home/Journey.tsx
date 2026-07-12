"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import SectionLabel from "@/components/ui/SectionLabel";

interface JourneyEntry {
  version: string;
  year: string;
  role: string;
  tag: string;
  detail: string;
}

const JOURNEY: JourneyEntry[] = [
  {
    version: "v1.0",
    year: "2019",
    role: "Foundations",
    tag: "Systems Exploration",
    detail: "Started competitive programming and exploring how systems actually work under load.",
  },
  {
    version: "v2.0",
    year: "2021",
    role: "First Production System",
    tag: "Multi-tenant Platform",
    detail: "Shipped my first real distributed system — a multi-tenant API platform running in production.",
  },
  {
    version: "v3.0",
    year: "2022",
    role: "Joined Akto",
    tag: "API Security",
    detail: "Moved into open-source API security — automated threat detection at real scale.",
  },
  {
    version: "v4.0",
    year: "2024",
    role: "AI Infra Lead",
    tag: "Threat Detection Engine",
    detail: "Led engineering for an AI-assisted threat detection engine, from design to production.",
  },
  {
    version: "v4.1",
    year: "2026",
    role: "Today",
    tag: "Writing · Researching · Building",
    detail: "Writing about the architecture decisions and tradeoffs behind the systems I build.",
  },
];

/** Drives one row's reveal off its own position in the viewport — the row
 *  brightens and comes forward as it nears center, and recedes on either
 *  side, so the timeline visibly responds to scroll rather than firing
 *  once via a whileInView threshold. */
function useRowMotion() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const opacity = useTransform(scrollYProgress, [0, 0.35, 0.5, 0.65, 1], [0.28, 0.95, 1, 0.95, 0.28]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.95, 1, 0.95]);
  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [8, 0, -8]);
  return { ref, opacity, scale, rotateX };
}

function JourneyRowDesktop({ entry, rowIndex }: { entry: JourneyEntry; rowIndex: number }) {
  const { ref, opacity, scale, rotateX } = useRowMotion();
  const gridRow = rowIndex + 1;
  const style = { opacity, scale, rotateX };
  return (
    <>
      <motion.div style={{ ...style, gridRow, gridColumn: 1 }} className="hidden md:flex flex-col items-end text-right py-10 pr-2">
        <span className="font-semibold text-lg" style={{ fontFamily: "var(--font-ibm)", color: "var(--text)" }}>
          {entry.role}
        </span>
        <span className="font-mono text-xs mt-1" style={{ color: "var(--accent-text)" }}>
          {entry.tag}
        </span>
      </motion.div>

      {/* Anchor element the row's own scroll progress is measured against */}
      <motion.div ref={ref} style={{ ...style, gridRow, gridColumn: 2 }} className="hidden md:flex items-center px-6">
        <span
          className="text-5xl lg:text-6xl font-bold tabular-nums leading-none"
          style={{ fontFamily: "var(--font-ibm)", color: "var(--text)" }}
        >
          {entry.year}
        </span>
      </motion.div>

      <motion.div style={{ ...style, gridRow, gridColumn: 4 }} className="hidden md:flex items-center pl-2">
        <p className="text-sm leading-relaxed max-w-sm" style={{ color: "var(--text-muted)" }}>
          {entry.detail}
        </p>
      </motion.div>
    </>
  );
}

function JourneyRowMobile({ entry }: { entry: JourneyEntry }) {
  const { ref, opacity, scale } = useRowMotion();
  return (
    <motion.div ref={ref} style={{ opacity, scale }} className="md:hidden flex gap-5 py-8">
      <div className="flex flex-col items-center shrink-0 w-16">
        <span className="font-mono text-lg font-bold" style={{ color: "var(--accent-text)" }}>
          {entry.year}
        </span>
        <span
          className="mt-2 w-2.5 h-2.5 rounded-full shrink-0"
          style={{ background: "var(--surface)", border: "2px solid var(--accent)" }}
        />
      </div>
      <div>
        <div className="font-semibold" style={{ fontFamily: "var(--font-ibm)", color: "var(--text)" }}>
          {entry.role}
        </div>
        <div className="font-mono text-xs mt-1 mb-2" style={{ color: "var(--accent-text)" }}>
          {entry.tag}
        </div>
        <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
          {entry.detail}
        </p>
      </div>
    </motion.div>
  );
}

export default function Journey() {
  const railRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: railProgress } = useScroll({ target: railRef, offset: ["start center", "end center"] });
  const fillHeight = useTransform(railProgress, [0, 1], ["0%", "100%"]);
  const dotTop = useTransform(railProgress, [0, 1], ["0%", "100%"]);

  return (
    <section className="py-24 px-6" style={{ background: "var(--bg)" }}>
      <div className="max-w-6xl mx-auto">
        <SectionLabel label="Career Journey" />
        <h2 className="text-3xl font-bold mb-3" style={{ fontFamily: "var(--font-ibm)", color: "var(--text)" }}>
          How I Got Here
        </h2>
        <p className="mb-8 max-w-xl" style={{ color: "var(--text-muted)" }}>
          Scroll through the versions — each one shipped something that changed how I build.
        </p>

        {/* Desktop: rail-anchored 4-column grid, one shared timeline */}
        <div
          ref={railRef}
          className="hidden md:grid relative"
          style={{ gridTemplateColumns: "1fr auto 2px 1fr", perspective: 1200 }}
        >
          <div
            className="relative"
            style={{ gridColumn: 3, gridRow: `1 / ${JOURNEY.length + 1}`, width: 3, background: "var(--border)" }}
          >
            <motion.div
              className="absolute top-0 left-0 w-full"
              style={{ height: fillHeight, background: "linear-gradient(to bottom, var(--accent), transparent)" }}
            />
            <motion.div
              className="absolute left-1/2 w-4 h-4 rounded-full -translate-x-1/2 -translate-y-1/2"
              style={{
                top: dotTop,
                background: "radial-gradient(circle at 35% 30%, #fff, var(--accent) 65%)",
                boxShadow:
                  "0 0 0 6px var(--accent-dim), 0 0 22px 6px var(--accent), 0 0 44px 12px color-mix(in srgb, var(--accent) 55%, transparent)",
              }}
            />
          </div>

          {JOURNEY.map((entry, i) => (
            <JourneyRowDesktop key={entry.version} entry={entry} rowIndex={i} />
          ))}
        </div>

        {/* Mobile: simple stacked timeline */}
        <div className="md:hidden">
          {JOURNEY.map((entry) => (
            <JourneyRowMobile key={entry.version} entry={entry} />
          ))}
        </div>
      </div>
    </section>
  );
}
