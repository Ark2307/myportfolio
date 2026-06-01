"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import BlueprintGrid from "@/components/ui/BlueprintGrid";

const NAME = "Aryan Khandelwal";

export default function Hero() {
  return (
    <section
      className="relative min-h-[92vh] flex items-center overflow-hidden"
      style={{ background: "var(--bg)" }}
    >
      <BlueprintGrid showCornerMarks size="lg" />

      {/* Blueprint mechanical drawing overlay — subtle SVG lines */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        aria-hidden="true"
        style={{ opacity: 0.04 }}
      >
        {/* Horizontal guide lines */}
        <line x1="0" y1="20%" x2="100%" y2="20%" stroke="var(--accent)" strokeWidth="0.5" strokeDasharray="4 8" />
        <line x1="0" y1="80%" x2="100%" y2="80%" stroke="var(--accent)" strokeWidth="0.5" strokeDasharray="4 8" />
        {/* Vertical guide lines */}
        <line x1="15%" y1="0" x2="15%" y2="100%" stroke="var(--accent)" strokeWidth="0.5" strokeDasharray="4 8" />
        <line x1="85%" y1="0" x2="85%" y2="100%" stroke="var(--accent)" strokeWidth="0.5" strokeDasharray="4 8" />
        {/* Diagonal annotation lines */}
        <line x1="5%" y1="5%" x2="20%" y2="30%" stroke="var(--accent)" strokeWidth="0.5" />
        <line x1="95%" y1="5%" x2="80%" y2="30%" stroke="var(--accent)" strokeWidth="0.5" />
      </svg>

      {/* Annotation labels */}
      <div className="absolute top-8 left-8 hidden lg:block" aria-hidden="true">
        <span className="annotation opacity-40">SYS://PORTFOLIO_v1.0</span>
      </div>
      <div className="absolute top-8 right-8 hidden lg:block" aria-hidden="true">
        <span className="annotation opacity-40">STATUS: OPERATIONAL</span>
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        <div className="max-w-3xl">
          {/* Role badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mb-6"
          >
            <span
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border font-mono text-xs font-medium"
              style={{
                color: "var(--accent)",
                borderColor: "var(--accent-dim)",
                background: "var(--accent-dim)",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              // Software Engineer &amp; Technical Writer
            </span>
          </motion.div>

          {/* Name */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] mb-6"
            style={{ fontFamily: "var(--font-ibm)", color: "var(--text)" }}
          >
            {NAME}
          </motion.h1>

          {/* Mission statement */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="text-xl sm:text-2xl leading-relaxed mb-10 max-w-2xl"
            style={{ color: "var(--text-muted)", fontFamily: "var(--font-ibm)" }}
          >
            Building distributed systems at scale. Writing about the architecture decisions,
            tradeoffs, and failures that shape how we engineer software.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <Link
              href="/blog"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium text-sm transition-all"
              style={{
                background: "var(--accent)",
                color: "#fff",
              }}
            >
              View Architecture Notes
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              href="/#projects"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium text-sm transition-all"
              style={{
                background: "var(--surface)",
                color: "var(--text)",
                border: "1px solid var(--border)",
              }}
            >
              Explore Systems
            </Link>
          </motion.div>

          {/* Spec strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-16 pt-8 flex flex-wrap gap-6"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            {[
              ["Stack", "Go · Python · React · Postgres"],
              ["Focus", "Distributed Systems · AI Infra"],
              ["Based in", "India"],
            ].map(([key, val]) => (
              <div key={key} className="flex flex-col gap-0.5">
                <span className="annotation" style={{ color: "var(--text-muted)" }}>{key}</span>
                <span className="font-mono text-xs" style={{ color: "var(--text)" }}>{val}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, transparent, var(--bg))" }}
        aria-hidden="true"
      />
    </section>
  );
}
