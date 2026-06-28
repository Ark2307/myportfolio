"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Network, Brain, Database, Activity, Shield } from "lucide-react";
import SectionLabel from "@/components/ui/SectionLabel";
import type { PostMeta } from "@/lib/mdx";

const AREAS = [
  {
    id: "distributed-systems",
    label: "Distributed Systems",
    desc: "Consensus, replication, consistency models, and failure modes in large-scale systems.",
    icon: Network,
    color: "var(--tag-distributed)",
  },
  {
    id: "ai-infrastructure",
    label: "AI Infrastructure",
    desc: "MLOps, vector databases, embedding pipelines, and serving large language models.",
    icon: Brain,
    color: "var(--tag-ai)",
  },
  {
    id: "databases",
    label: "Databases",
    desc: "Storage engines, query planners, indexing strategies, and schema evolution.",
    icon: Database,
    color: "var(--tag-database)",
  },
  {
    id: "observability",
    label: "Observability",
    desc: "Structured events, SLO-driven alerting, distributed tracing, and continuous profiling.",
    icon: Activity,
    color: "var(--tag-observability)",
  },
  {
    id: "security",
    label: "Security",
    desc: "API security, threat modeling, supply chain integrity, and zero-trust architectures.",
    icon: Shield,
    color: "var(--tag-security)",
  },
];

interface ResearchAreasProps {
  posts: PostMeta[];
}

export default function ResearchAreas({ posts }: ResearchAreasProps) {
  const countByTag = (tagId: string) => posts.filter((p) => p.tags.includes(tagId)).length;

  return (
    <section className="py-24 px-6" style={{ background: "var(--surface)" }}>
      <div className="max-w-6xl mx-auto">
        <SectionLabel label="Research Areas" />
        <h2
          className="text-3xl font-bold mb-3"
          style={{ fontFamily: "var(--font-ibm)", color: "var(--text)" }}
        >
          Domains of Expertise
        </h2>
        <p className="mb-12 max-w-xl" style={{ color: "var(--text-muted)" }}>
          The technical areas I write about and build systems in professionally.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {AREAS.map((area, i) => {
            const Icon = area.icon;
            const count = countByTag(area.id);

            return (
              <motion.div
                key={area.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
              <Link
                href={`/blog?tag=${area.id}`}
                className="card group p-6 block"
                style={{ borderLeft: `3px solid ${area.color}`, textDecoration: "none" }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="p-2 rounded-lg"
                    style={{ background: `${area.color}15` }}
                  >
                    <Icon size={18} style={{ color: area.color }} strokeWidth={1.5} />
                  </div>
                  {count > 0 && (
                    <span
                      className="font-mono text-xs px-2 py-0.5 rounded"
                      style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}
                    >
                      {count} {count === 1 ? "note" : "notes"}
                    </span>
                  )}
                </div>

                <h3
                  className="font-semibold text-base mb-2"
                  style={{ color: "var(--text)", fontFamily: "var(--font-ibm)" }}
                >
                  {area.label}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                  {area.desc}
                </p>
              </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
