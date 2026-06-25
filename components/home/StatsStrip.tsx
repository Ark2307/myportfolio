"use client";

import { motion } from "framer-motion";
import AnimatedCounter from "@/components/ui/AnimatedCounter";

const STATS = [
  { value: 70000, suffix: "+", label: "Security tests per run", sublabel: "At Akto" },
  { value: 100, suffix: "x", label: "Throughput improvement", sublabel: "Kafka optimization" },
  { value: 6, suffix: "→ min", label: "Hours → minutes", sublabel: "Execution time" },
  { value: 4000, suffix: "+", label: "Security test templates", sublabel: "Open source" },
];

export default function StatsStrip() {
  return (
    <section
      className="py-12 border-y"
      style={{
        background: "var(--surface)",
        borderColor: "var(--border)",
      }}
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="flex flex-col gap-1"
            >
              <div
                className="text-3xl font-bold tabular-nums"
                style={{ fontFamily: "var(--font-ibm)", color: "var(--text)" }}
              >
                <AnimatedCounter
                  value={stat.value}
                  suffix={stat.suffix}
                  duration={1600}
                />
              </div>
              <span className="text-sm font-medium" style={{ color: "var(--text)" }}>
                {stat.label}
              </span>
              <span className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
                {stat.sublabel}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
