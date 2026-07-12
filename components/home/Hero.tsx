"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import BlueprintGrid from "@/components/ui/BlueprintGrid";
import CursorSpotlight from "@/components/ui/CursorSpotlight";
import WordReveal from "@/components/ui/WordReveal";
import LiveClock from "@/components/ui/LiveClock";

export default function Hero() {
  return (
    <section
      className="relative min-h-[92vh] flex items-center overflow-hidden"
      style={{ background: "var(--bg)" }}
    >
      <CursorSpotlight />
      <BlueprintGrid showCornerMarks size="lg" />

      {/* Blueprint mechanical drawing overlay */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        aria-hidden="true"
        style={{ opacity: 0.045 }}
      >
        <line x1="0" y1="20%" x2="100%" y2="20%" stroke="var(--accent)" strokeWidth="0.5" strokeDasharray="4 8" />
        <line x1="0" y1="80%" x2="100%" y2="80%" stroke="var(--accent)" strokeWidth="0.5" strokeDasharray="4 8" />
        <line x1="15%" y1="0" x2="15%" y2="100%" stroke="var(--accent)" strokeWidth="0.5" strokeDasharray="4 8" />
        <line x1="85%" y1="0" x2="85%" y2="100%" stroke="var(--accent)" strokeWidth="0.5" strokeDasharray="4 8" />
        <line x1="5%" y1="5%" x2="20%" y2="30%" stroke="var(--accent)" strokeWidth="0.5" />
        <line x1="95%" y1="5%" x2="80%" y2="30%" stroke="var(--accent)" strokeWidth="0.5" />
      </svg>

      {/* Live system HUD */}
      <motion.div
        className="absolute top-8 left-8 hidden lg:block"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 0.4, x: 0 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        aria-hidden="true"
      >
        <span className="annotation">SYS://PORTFOLIO_v1.0</span>
      </motion.div>
      <motion.div
        className="absolute top-8 right-8 hidden lg:flex items-center gap-2"
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 0.55, x: 0 }}
        transition={{ delay: 1.4, duration: 0.6 }}
        aria-hidden="true"
      >
        <LiveClock />
        <span className="annotation" style={{ color: "var(--border-strong)" }}>—</span>
        <span className="annotation flex items-center gap-1.5">
          <span
            className="w-1 h-1 rounded-full"
            style={{ background: "var(--status-green)", animation: "bca-pulse 2s ease-in-out infinite" }}
          />
          STATUS: OPERATIONAL
        </span>
      </motion.div>

      {/* Animated border lines that draw in */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
        <motion.rect
          x="32" y="32"
          width="calc(100% - 64px)" height="calc(100% - 64px)"
          rx="4" fill="none"
          stroke="var(--accent)" strokeWidth="0.5"
          strokeDasharray="8 6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.12 }}
          transition={{ delay: 0.8, duration: 1 }}
        />
      </svg>

      {/* Main content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 w-full">
        <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-x-12 gap-y-16 items-center">
          <div className="max-w-3xl">
            {/* Role badge with typewriter shimmer */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="mb-8"
            >
              <span
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border font-mono text-xs font-medium"
                style={{
                  color: "var(--accent-text)",
                  borderColor: "rgba(59,130,246,0.3)",
                  background: "var(--accent-dim)",
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                // Software Engineer &amp; Technical Writer
              </span>
            </motion.div>

            {/* Name — word reveal, framed like a selected blueprint element */}
            <div className="relative inline-block mb-6 px-1 py-2">
              <motion.span
                className="absolute -top-3 left-0 hidden sm:inline-flex items-center font-mono text-[10px] tracking-widest uppercase px-1.5 py-0.5 rounded-sm"
                style={{ background: "var(--accent)", color: "#fff" }}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3, duration: 0.4 }}
                aria-hidden="true"
              >
                identity.core
              </motion.span>

              {/* Corner brackets */}
              {(["tl", "tr", "bl", "br"] as const).map((corner) => (
                <motion.svg
                  key={corner}
                  aria-hidden="true"
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  className={`absolute hidden sm:block ${
                    corner === "tl"
                      ? "-top-1.5 -left-1.5"
                      : corner === "tr"
                        ? "-top-1.5 -right-1.5"
                        : corner === "bl"
                          ? "-bottom-1.5 -left-1.5"
                          : "-bottom-1.5 -right-1.5"
                  }`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.45 }}
                  transition={{ delay: 1.35, duration: 0.4 }}
                >
                  {corner === "tl" && <path d="M0 6 V0 H6" stroke="var(--accent)" strokeWidth="1.5" fill="none" />}
                  {corner === "tr" && <path d="M8 0 H14 V6" stroke="var(--accent)" strokeWidth="1.5" fill="none" />}
                  {corner === "bl" && <path d="M0 8 V14 H6" stroke="var(--accent)" strokeWidth="1.5" fill="none" />}
                  {corner === "br" && <path d="M8 14 H14 V8" stroke="var(--accent)" strokeWidth="1.5" fill="none" />}
                </motion.svg>
              ))}

              <h1
                className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]"
                style={{ fontFamily: "var(--font-ibm)", color: "var(--text)" }}
              >
                <WordReveal text="Aryan" delay={0.1} stagger={0.08} />
                <br />
                <WordReveal text="Khandelwal" delay={0.25} stagger={0.06} />
              </h1>
            </div>

            {/* Mission — word reveal with blur */}
            <div
              className="text-xl sm:text-2xl leading-relaxed mb-10 max-w-2xl"
              style={{ color: "var(--text-muted)", fontFamily: "var(--font-ibm)" }}
            >
              <WordReveal
                text="Building distributed systems at scale. Writing about the architecture decisions, tradeoffs, and failures that shape how we engineer software."
                delay={0.5}
                stagger={0.025}
              />
            </div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0, ease: "easeOut" }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <Link
                href="/blog"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium text-sm transition-all hover:opacity-90 hover:-translate-y-0.5"
                style={{ background: "var(--accent)", color: "#fff" }}
              >
                View Architecture Notes
                <motion.span
                  animate={{ x: [0, 4, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                  aria-hidden="true"
                >
                  →
                </motion.span>
              </Link>
            </motion.div>

            {/* Spec strip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="mt-16 pt-8 flex flex-wrap gap-8"
              style={{ borderTop: "1px solid var(--border)" }}
            >
              {[
                ["Stack", "Go · Python · React · Postgres"],
                ["Focus", "Distributed Systems · AI Infra"],
                ["Based in", "India"],
              ].map(([key, val]) => (
                <div key={key} className="flex flex-col gap-1">
                  <span className="annotation" style={{ color: "var(--text-muted)" }}>{key}</span>
                  <span className="font-mono text-xs font-medium" style={{ color: "var(--text)" }}>{val}</span>
                </div>
              ))}
            </motion.div>
          </div>

        </div>
      </div>

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, transparent, var(--bg))" }}
        aria-hidden="true"
      />

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        aria-hidden="true"
      >
        <span className="annotation opacity-40">scroll</span>
        <motion.div
          className="w-px h-8"
          style={{ background: "var(--accent)", opacity: 0.3 }}
          animate={{ scaleY: [1, 0.3, 1] }}
          transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
        />
      </motion.div>
    </section>
  );
}
