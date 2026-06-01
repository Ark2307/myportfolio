"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { getPostStats } from "@/lib/db";
import type { Post } from "@/lib/mdx";
import type { PostMeta } from "@/lib/mdx";
import ReadingProgress from "@/components/blog/ReadingProgress";
import ReadingPrompt from "@/components/blog/ReadingPrompt";
import NextReadSuggestions from "@/components/blog/NextReadSuggestions";

const TAG_COLORS: Record<string, string> = {
  "distributed-systems": "var(--tag-distributed)",
  "ai-infrastructure":   "var(--tag-ai)",
  "databases":           "var(--tag-database)",
  "observability":       "var(--tag-observability)",
  "security":            "var(--tag-security)",
};

interface BlogPostClientProps {
  post: Post;
  suggestions: PostMeta[];
}

export default function BlogPostClient({ post, suggestions }: BlogPostClientProps) {
  const [initialPercent, setInitialPercent] = useState(0);
  const [activeSeconds, setActiveSeconds] = useState(0);

  useEffect(() => {
    getPostStats(post.slug).then((stats) => {
      if (stats) {
        setInitialPercent(stats.scrollPercent);
        setActiveSeconds(stats.totalActiveSeconds);
      }
    });
  }, [post.slug]);

  const minutesLeft = Math.max(
    0,
    post.readingTime - Math.round(activeSeconds / 60)
  );

  return (
    <>
      <ReadingProgress postId={post.slug} initialPercent={initialPercent} />

      <article style={{ background: "var(--bg)" }}>
        {/* Hero image */}
        {post.coverImage && (
          <div className="w-full" style={{ maxHeight: 480, overflow: "hidden" }}>
            <Image
              src={post.coverImage}
              alt={post.title}
              width={1200}
              height={480}
              className="w-full object-cover"
              priority
              style={{ maxHeight: 480 }}
            />
          </div>
        )}

        {/* Article header */}
        <div
          className="w-full py-8 px-6"
          style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}
        >
          <div className="max-w-3xl mx-auto">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 mb-4 font-mono text-xs" style={{ color: "var(--text-muted)" }}>
              <Link href="/blog" className="hover:underline" style={{ color: "var(--accent)" }}>
                ← Notes
              </Link>
              <span>/</span>
              <span>{post.slug}</span>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag) => (
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
            <h1
              className="text-3xl sm:text-4xl font-bold leading-tight mb-4"
              style={{ fontFamily: "var(--font-ibm)", color: "var(--text)" }}
            >
              {post.title}
            </h1>

            {/* Meta strip */}
            <div className="flex flex-wrap items-center gap-4 font-mono text-xs" style={{ color: "var(--text-muted)" }}>
              <span>
                {new Date(post.date).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <span>·</span>
              <span>{post.readingTime} min read</span>
              {minutesLeft > 0 && activeSeconds > 30 && (
                <>
                  <span>·</span>
                  <span style={{ color: "var(--accent)" }}>~{minutesLeft} min left</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Article body */}
        <div className="max-w-3xl mx-auto px-6 py-12">
          <div className="prose-blueprint">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>

          {/* Next read suggestions */}
          <NextReadSuggestions suggestions={suggestions} />
        </div>
      </article>

      {/* Reading engagement popup */}
      <ReadingPrompt postId={post.slug} suggestions={suggestions} />
    </>
  );
}
