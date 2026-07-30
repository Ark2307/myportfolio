"use client";

import { motion } from "framer-motion";
import SectionLabel from "@/components/ui/SectionLabel";

const SPEC = [
  ["name",       "Aryan Khandelwal"],
  ["role",       "Software Engineer"],
  ["employer",   "Akto (akto.io)"],
  ["stack",      "Java · Python · React · LangGraph · MongoDB · Kafka · Docker · Redis"],
  ["domain",     "API Security · Distributed Systems · AI Infra"],
  ["location",   "India"],
  ["contact",    "kr.aryan2307@gmail.com"],
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

          {/* Personal note */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex items-center"
          >
            <div
              className="p-6 rounded-xl"
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
