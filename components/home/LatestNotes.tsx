"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { PostMeta } from "@/lib/mdx";
import { getAllPostStats } from "@/lib/db";
import SectionLabel from "@/components/ui/SectionLabel";

const TAG_COLORS: Record<string, string> = {
  "distributed-systems": "var(--tag-distributed)",
  "ai-infrastructure":   "var(--tag-ai)",
  "databases":           "var(--tag-database)",
  "observability":       "var(--tag-observability)",
  "security":            "var(--tag-security)",
};

interface LatestNotesProps {
  posts: PostMeta[];
}

export default function LatestNotes({ posts }: LatestNotesProps) {
  const [readMap, setReadMap] = useState<Record<string, number>>({});

  useEffect(() => {
    getAllPostStats().then((stats) => {
      const map: Record<string, number> = {};
      stats.forEach((s) => { map[s.postId] = s.scrollPercent; });
      setReadMap(map);
    });
  }, []);

  return (
    <section className="py-24 px-6" style={{ background: "var(--bg)" }}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-end justify-between mb-10">
          <div>
            <SectionLabel label="Architecture Notes" />
            <h2
              className="text-3xl font-bold"
              style={{ fontFamily: "var(--font-ibm)", color: "var(--text)" }}
            >
              Latest Technical Writing
            </h2>
          </div>
          <Link
            href="/blog"
            className="hidden sm:inline-flex items-center gap-1 text-sm font-medium transition-colors hover:underline"
            style={{ color: "var(--accent)" }}
          >
            View all notes →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post, i) => {
            const progress = readMap[post.slug] ?? 0;
            const isRead = progress >= 80;

            return (
              <motion.div
                key={post.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <Link href={`/blog/${post.slug}`} className="block group card h-full" style={{ textDecoration: "none" }}>
                  {/* Cover image */}
                  <div className="relative aspect-video overflow-hidden rounded-t-lg">
                    {post.coverImage ? (
                      <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    ) : (
                      <BlueprintPlaceholder tag={post.tags[0]} />
                    )}
                    {isRead && (
                      <span
                        className="absolute top-2 right-2 px-2 py-0.5 rounded font-mono text-[10px] font-medium"
                        style={{ background: "var(--surface)", color: "var(--status-green)", border: "1px solid var(--border)" }}
                      >
                        ✓ READ
                      </span>
                    )}
                  </div>

                  {/* Card body */}
                  <div className="p-5 flex flex-col gap-3">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {post.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="tag"
                          style={{
                            background: `${TAG_COLORS[tag] ?? "var(--accent)"}1a`,
                            color: TAG_COLORS[tag] ?? "var(--accent)",
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Title */}
                    <h3
                      className="text-base font-semibold leading-snug line-clamp-2"
                      style={{ color: "var(--text)", fontFamily: "var(--font-ibm)" }}
                    >
                      {post.title}
                    </h3>

                    {/* Meta row */}
                    <div className="flex items-center gap-3 mt-auto">
                      <span className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
                        {new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                      <span className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
                        · {post.readingTime} min
                      </span>
                    </div>

                    {/* Progress bar */}
                    {progress > 0 && (
                      <div>
                        <div
                          className="h-1 rounded-full overflow-hidden"
                          style={{ background: "var(--border)" }}
                        >
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${progress}%`, background: "var(--accent)" }}
                          />
                        </div>
                        <span className="font-mono text-[10px]" style={{ color: "var(--text-muted)" }}>
                          {progress}% read
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-8 sm:hidden">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1 text-sm font-medium"
            style={{ color: "var(--accent)" }}
          >
            View all notes →
          </Link>
        </div>
      </div>
    </section>
  );
}

function BlueprintPlaceholder({ tag }: { tag?: string }) {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center blueprint-grid"
      style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
    >
      <span
        className="font-mono text-xs font-bold tracking-widest uppercase opacity-30"
        style={{ color: "var(--accent)" }}
      >
        {tag ?? "NOTE"}
      </span>
    </div>
  );
}
