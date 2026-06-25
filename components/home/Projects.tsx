"use client";

import { motion } from "framer-motion";
import { ExternalLink, GitBranch } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import SectionLabel from "@/components/ui/SectionLabel";
import MagneticCard from "@/components/ui/MagneticCard";

const PROJECTS = [
  {
    name: "Akto API Security",
    status: "deployed" as const,
    version: "v2.8.0",
    desc: "Open-source API security platform. Automated threat detection, custom test templates, and CI/CD integration for 4000+ security tests.",
    stack: ["Go", "React", "Kafka", "Mongo", "Docker"],
    github: "https://github.com/akto-api-security/akto",
    live: "https://www.akto.io",
    metric: "4K+ security tests",
  },
  {
    name: "Distributed Tracer",
    status: "active" as const,
    version: "v1.2.0",
    desc: "Lightweight distributed tracing library with OpenTelemetry compatibility, designed for Go microservices with minimal overhead.",
    stack: ["Go", "OpenTelemetry", "gRPC", "Postgres"],
    github: "https://github.com/Ark2307",
    live: null,
    metric: "<1% CPU overhead",
  },
  {
    name: "Portfolio System",
    status: "deployed" as const,
    version: "v1.0.0",
    desc: "This very site — a living system design document built with Next.js, MDX, and IndexedDB for client-side reading analytics.",
    stack: ["Next.js", "TypeScript", "Tailwind", "Dexie"],
    github: "https://github.com/Ark2307/myportfolio",
    live: null,
    metric: "Static · 0 backend",
  },
];

export default function Projects() {
  return (
    <section id="projects" className="py-24 px-6" style={{ background: "var(--bg)" }}>
      <div className="max-w-6xl mx-auto">
        <SectionLabel label="Deployed Systems" />
        <h2
          className="text-3xl font-bold mb-3"
          style={{ fontFamily: "var(--font-ibm)", color: "var(--text)" }}
        >
          Projects
        </h2>
        <p className="mb-12 max-w-xl" style={{ color: "var(--text-muted)" }}>
          Production systems and engineering tools I&apos;ve built or contributed to.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PROJECTS.map((project, i) => (
            <motion.div
              key={project.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
            <MagneticCard intensity={6} className="card p-6 flex flex-col gap-4 h-full">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3
                    className="font-bold text-lg leading-tight"
                    style={{ fontFamily: "var(--font-mono)", color: "var(--text)" }}
                  >
                    {project.name}
                  </h3>
                  <span className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
                    {project.version}
                  </span>
                </div>
                <StatusBadge status={project.status} />
              </div>

              {/* Description */}
              <p className="text-sm leading-relaxed flex-1" style={{ color: "var(--text-muted)" }}>
                {project.desc}
              </p>

              {/* Metric */}
              <div
                className="px-3 py-2 rounded-md"
                style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
              >
                <span className="font-mono text-xs font-medium" style={{ color: "var(--accent)" }}>
                  {project.metric}
                </span>
              </div>

              {/* Stack tags */}
              <div className="flex flex-wrap gap-1.5">
                {project.stack.map((tech) => (
                  <span
                    key={tech}
                    className="px-2 py-0.5 rounded font-mono text-[11px]"
                    style={{
                      background: "var(--accent-dim)",
                      color: "var(--accent)",
                    }}
                  >
                    {tech}
                  </span>
                ))}
              </div>

              {/* Links */}
              <div className="flex gap-3 pt-1" style={{ borderTop: "1px solid var(--border)" }}>
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium transition-colors hover:underline"
                  style={{ color: "var(--text-muted)" }}
                >
                  <GitBranch size={13} />
                  Source
                </a>
                {project.live && (
                  <a
                    href={project.live}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium transition-colors hover:underline"
                    style={{ color: "var(--accent)" }}
                  >
                    <ExternalLink size={13} />
                    Live
                  </a>
                )}
              </div>
            </MagneticCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
