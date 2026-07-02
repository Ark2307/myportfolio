"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { getAllPostStats } from "@/lib/db";
import type { PostMeta } from "@/lib/mdx";
import BlogCard from "@/components/blog/BlogCard";
import SectionLabel from "@/components/ui/SectionLabel";
import Link from "next/link";

const TAG_LABELS: Record<string, string> = {
  "distributed-systems": "Distributed Systems",
  "ai-infrastructure":   "AI Infrastructure",
  "databases":           "Databases",
  "observability":       "Observability",
  "security":            "Security",
};

interface BlogListingClientProps {
  posts: PostMeta[];
  initialTag: string | null;
}

export default function BlogListingClient({ posts, initialTag }: BlogListingClientProps) {
  const [statsMap, setStatsMap] = useState<Record<string, { scrollPercent: number; isRead: boolean }>>({});
  const [activeTag, setActiveTag] = useState<string | null>(initialTag);
  const [totalRead, setTotalRead] = useState(0);
  const [totalMinutes, setTotalMinutes] = useState(0);

  useEffect(() => {
    getAllPostStats().then((stats) => {
      const map: Record<string, { scrollPercent: number; isRead: boolean }> = {};
      let read = 0;
      let secs = 0;
      stats.forEach((s) => {
        map[s.postId] = { scrollPercent: s.scrollPercent, isRead: s.isRead };
        if (s.isRead) read++;
        secs += s.totalActiveSeconds;
      });
      setStatsMap(map);
      setTotalRead(read);
      setTotalMinutes(Math.round(secs / 60));
    });
  }, []);

  const handleTagClick = useCallback((tag: string | null) => {
    setActiveTag(tag);
    const url = tag
      ? `${window.location.pathname}?tag=${encodeURIComponent(tag)}`
      : window.location.pathname;
    history.replaceState(null, "", url);
  }, []);

  const allTags = useMemo(() => {
    const seen = new Set<string>();
    posts.forEach((p) => p.tags.forEach((t) => seen.add(t)));
    return Array.from(seen);
  }, [posts]);

  const filtered = activeTag ? posts.filter((p) => p.tags.includes(activeTag)) : posts;

  return (
    <div>
      {/* Reading stats bar */}
      <div
        className="w-full py-3"
        style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}
      >
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "var(--status-green)" }} />
            <span className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
              Reading tracker active
            </span>
          </div>
          <span className="font-mono text-xs" style={{ color: "var(--text)" }}>
            {totalRead} / {posts.length} read
          </span>
          {totalMinutes > 0 && (
            <span className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
              · {totalMinutes} min total
            </span>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <div className="w-32 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: posts.length > 0 ? `${(totalRead / posts.length) * 100}%` : "0%",
                  background: "var(--accent)",
                }}
              />
            </div>
            <span className="font-mono text-[10px]" style={{ color: "var(--text-muted)" }}>
              {posts.length > 0 ? Math.round((totalRead / posts.length) * 100) : 0}%
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded font-mono text-xs font-medium transition-colors mb-10"
          style={{
            background: "var(--surface-2)",
            color: "var(--text-muted)",
            border: "1px solid var(--border)",
          }}
        >
          ← Home
        </Link>
        <SectionLabel label="Architecture Notes" />
        <h1
          className="text-4xl font-bold mb-3"
          style={{ fontFamily: "var(--font-ibm)", color: "var(--text)" }}
        >
          Technical Writing
        </h1>
        <p className="mb-10 max-w-xl" style={{ color: "var(--text-muted)" }}>
          Notes on distributed systems, AI infrastructure, databases, and observability.
          Written for engineers who want depth, not surface-level takes.
        </p>

        {/* Tag filters */}
        <div className="flex flex-wrap gap-2 mb-10">
          <button
            onClick={() => handleTagClick(null)}
            className="tag cursor-pointer transition-colors"
            style={{
              background: !activeTag ? "var(--accent)" : "var(--surface-2)",
              color: !activeTag ? "#fff" : "var(--text-muted)",
            }}
          >
            All ({posts.length})
          </button>
          {allTags.map((tag) => {
            const count = posts.filter((p) => p.tags.includes(tag)).length;
            return (
              <button
                key={tag}
                onClick={() => handleTagClick(activeTag === tag ? null : tag)}
                className="tag cursor-pointer transition-colors"
                style={{
                  background: activeTag === tag ? "var(--accent)" : "var(--surface-2)",
                  color: activeTag === tag ? "#fff" : "var(--text-muted)",
                }}
              >
                {TAG_LABELS[tag] ?? tag} ({count})
              </button>
            );
          })}
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((post) => {
            const s = statsMap[post.slug] ?? { scrollPercent: 0, isRead: false };
            return (
              <BlogCard
                key={post.slug}
                post={post}
                scrollPercent={s.scrollPercent}
                isRead={s.isRead}
              />
            );
          })}
          {filtered.length === 0 && (
            <div className="col-span-2 py-20 text-center font-mono text-sm" style={{ color: "var(--text-muted)" }}>
              No notes in this category yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
