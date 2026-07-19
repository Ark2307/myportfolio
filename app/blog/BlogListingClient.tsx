"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import { getAllPostStats } from "@/lib/db";
import type { PostMeta } from "@/lib/mdx";
import BlogCard from "@/components/blog/BlogCard";
import SectionLabel from "@/components/ui/SectionLabel";
import Link from "next/link";
import { RESEARCH_AREAS, getResearchArea, getTagLabel, type ResearchArea } from "@/lib/researchAreas";

// Fallback bucket for any tag that isn't part of the known research-area
// taxonomy, so a new/unexpected tag never silently disappears from the page.
const OTHER_AREA: ResearchArea = {
  slug: "other",
  label: "More Notes",
  description: "Additional notes that don't fit a single research area yet.",
  color: "var(--text-muted)",
  hex: "#64748B",
  icon: FileText,
};

interface AreaGroup {
  area: ResearchArea;
  posts: PostMeta[];
}

// Buckets each post under its first tag that matches a known research area
// (posts stay sorted newest-first, inherited from getAllPosts), then orders
// the resulting sections by how recently each was last written in.
function groupByArea(posts: PostMeta[]): AreaGroup[] {
  const byAreaSlug = new Map<string, PostMeta[]>();
  const other: PostMeta[] = [];

  for (const post of posts) {
    const primaryTag = post.tags.find((tag) => getResearchArea(tag));
    if (!primaryTag) {
      other.push(post);
      continue;
    }
    const list = byAreaSlug.get(primaryTag) ?? [];
    list.push(post);
    byAreaSlug.set(primaryTag, list);
  }

  const groups = RESEARCH_AREAS
    .map((area) => ({ area, posts: byAreaSlug.get(area.slug) ?? [] }))
    .filter((group) => group.posts.length > 0);

  groups.sort((a, b) => new Date(b.posts[0].date).getTime() - new Date(a.posts[0].date).getTime());

  if (other.length > 0) groups.push({ area: OTHER_AREA, posts: other });

  return groups;
}

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

  // Tag filter pills follow the canonical research-area order first, then
  // append any unrecognized tags so nothing found in content is ever hidden.
  const allTags = useMemo(() => {
    const present = new Set<string>();
    posts.forEach((p) => p.tags.forEach((t) => present.add(t)));
    const known = RESEARCH_AREAS.map((a) => a.slug).filter((slug) => present.has(slug));
    const unknown = Array.from(present).filter((t) => !known.includes(t));
    return [...known, ...unknown];
  }, [posts]);

  const filtered = activeTag ? posts.filter((p) => p.tags.includes(activeTag)) : posts;
  const groups = useMemo(() => (activeTag ? [] : groupByArea(posts)), [activeTag, posts]);

  const renderCard = (post: PostMeta) => {
    const s = statsMap[post.slug] ?? { scrollPercent: 0, isRead: false };
    return <BlogCard key={post.slug} post={post} scrollPercent={s.scrollPercent} isRead={s.isRead} />;
  };

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
        <div className="flex flex-wrap gap-2 mb-12">
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
                {getTagLabel(tag)} ({count})
              </button>
            );
          })}
        </div>

        {activeTag ? (
          /* A category is selected — collapse to a single filtered grid. */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map(renderCard)}
            {filtered.length === 0 && (
              <div className="col-span-2 py-20 text-center font-mono text-sm" style={{ color: "var(--text-muted)" }}>
                No notes in this category yet.
              </div>
            )}
          </div>
        ) : (
          /* No filter — group posts into research-area sections. */
          <div className="flex flex-col gap-14">
            {groups.map((group, i) => {
              const Icon = group.area.icon;
              return (
                <motion.section
                  key={group.area.slug}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.4, delay: Math.min(i, 3) * 0.06 }}
                >
                  <div className="flex items-center gap-3 mb-1.5">
                    <div className="p-1.5 rounded-md" style={{ background: `${group.area.color}15` }}>
                      <Icon size={16} style={{ color: group.area.color }} strokeWidth={1.5} />
                    </div>
                    <h2
                      className="text-lg font-semibold"
                      style={{ fontFamily: "var(--font-ibm)", color: "var(--text)" }}
                    >
                      {group.area.label}
                    </h2>
                    <span className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
                      {group.posts.length} {group.posts.length === 1 ? "note" : "notes"}
                    </span>
                  </div>
                  <p className="text-sm mb-5 max-w-xl" style={{ color: "var(--text-muted)" }}>
                    {group.area.description}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {group.posts.map(renderCard)}
                  </div>
                </motion.section>
              );
            })}
            {groups.length === 0 && (
              <div className="py-20 text-center font-mono text-sm" style={{ color: "var(--text-muted)" }}>
                No notes yet.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
