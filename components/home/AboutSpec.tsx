"use client";

import { motion } from "framer-motion";
import SectionLabel from "@/components/ui/SectionLabel";

const SPEC = [
  ["name",       "Aryan Khandelwal"],
  ["role",       "Software Engineer, Technical Writer"],
  ["employer",   "Akto (akto.io)"],
  ["stack",      "Go · Python · React · Postgres · Kafka · Docker"],
  ["domain",     "API Security · Distributed Systems · AI Infra"],
  ["status",     "● AVAILABLE_FOR_COLLABORATION"],
  ["location",   "India"],
  ["contact",    "aryan@akto.io"],
];

const TIMELINE = [
  { version: "v1.0", year: "2019", label: "Started competitive programming and systems exploration" },
  { version: "v2.0", year: "2021", label: "First production distributed system — multi-tenant API platform" },
  { version: "v3.0", year: "2022", label: "Joined Akto — open-source API security" },
  { version: "v4.0", year: "2024", label: "Led engineering for AI-assisted threat detection engine" },
  { version: "v4.1", year: "2026", label: "Writing, researching, building at scale" },
];

export default function AboutSpec() {
  return (
    <section id="about" className="py-24 px-6" style={{ background: "var(--surface)" }}>
      <div className="max-w-6xl mx-auto">
        <SectionLabel label="Engineer Specification" />
        <h2
          className="text-3xl font-bold mb-12"
          style={{ fontFamily: "var(--font-ibm)", color: "var(--text)" }}
        >
          About
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Spec table */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div
              className="rounded-xl overflow-hidden"
              style={{ border: "1px solid var(--border)" }}
            >
              {/* Header */}
              <div
                className="px-5 py-3 flex items-center gap-2"
                style={{ background: "var(--surface-2)", borderBottom: "1px solid var(--border)" }}
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--status-red)" }} />
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--status-amber)" }} />
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--status-green)" }} />
                <span className="ml-2 font-mono text-xs" style={{ color: "var(--text-muted)" }}>
                  engineer.spec
                </span>
              </div>

              {/* Spec rows */}
              <div className="p-5 space-y-3">
                {SPEC.map(([key, val]) => (
                  <div key={key} className="flex gap-4 font-mono text-sm">
                    <span
                      className="shrink-0 w-20 text-right"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {key}
                    </span>
                    <span style={{ color: key === "status" ? "var(--status-green)" : "var(--text)" }}>
                      {val}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Changelog / Timeline */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="annotation block mb-6" style={{ color: "var(--text-muted)" }}>
              CHANGELOG
            </span>
            <div className="relative">
              {/* Timeline line */}
              <div
                className="absolute left-[52px] top-2 bottom-2 w-px"
                style={{ background: "var(--border)" }}
              />

              <div className="space-y-6">
                {TIMELINE.map((entry, i) => (
                  <motion.div
                    key={entry.version}
                    initial={{ opacity: 0, x: 10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-start gap-4"
                  >
                    {/* Version badge */}
                    <div className="flex flex-col items-end shrink-0 w-12">
                      <span className="font-mono text-[11px] font-bold" style={{ color: "var(--accent)" }}>
                        {entry.version}
                      </span>
                      <span className="font-mono text-[10px]" style={{ color: "var(--text-muted)" }}>
                        {entry.year}
                      </span>
                    </div>

                    {/* Dot */}
                    <div
                      className="mt-1.5 w-2.5 h-2.5 rounded-full shrink-0 z-10"
                      style={{ background: "var(--surface)", border: "2px solid var(--accent)" }}
                    />

                    {/* Description */}
                    <p className="text-sm leading-snug pt-0.5" style={{ color: "var(--text-muted)" }}>
                      {entry.label}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Personal note */}
            <div
              className="mt-10 p-5 rounded-xl"
              style={{ background: "var(--accent-dim)", border: "1px solid rgba(59,130,246,0.3)" }}
            >
              <p className="text-sm leading-relaxed" style={{ color: "var(--text)" }}>
                I care deeply about writing systems that other engineers can understand, debug, and extend.
                My technical writing is an extension of that — turning complex systems into clear mental models.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
