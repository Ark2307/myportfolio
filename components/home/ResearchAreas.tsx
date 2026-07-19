"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import SectionLabel from "@/components/ui/SectionLabel";
import type { PostMeta } from "@/lib/mdx";
import { RESEARCH_AREAS } from "@/lib/researchAreas";

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
          {RESEARCH_AREAS.map((area, i) => {
            const Icon = area.icon;
            const count = countByTag(area.slug);

            return (
              <motion.div
                key={area.slug}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
              <Link
                href={`/blog?tag=${area.slug}`}
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
                  {area.description}
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
