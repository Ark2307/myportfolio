"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, type ComponentPropsWithoutRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeHighlight from "rehype-highlight";
import { getPostStats } from "@/lib/db";
import type { Post } from "@/lib/mdx";
import type { PostMeta } from "@/lib/mdx";
import { extractToc } from "@/lib/toc";
import ReadingProgress from "@/components/blog/ReadingProgress";
import ReadingPrompt from "@/components/blog/ReadingPrompt";
import NextReadSuggestions from "@/components/blog/NextReadSuggestions";
import BlogCoverArt from "@/components/blog/BlogCoverArt";
import EngagementBar from "@/components/blog/EngagementBar";
import CodeBlock from "@/components/blog/CodeBlock";
import { TocSidebar, TocMobile } from "@/components/blog/TableOfContents";
import { getTagColor } from "@/lib/researchAreas";

function TableWrapper(props: ComponentPropsWithoutRef<"table">) {
  return (
    <div className="prose-table-wrapper">
      <table {...props} />
    </div>
  );
}

const MARKDOWN_COMPONENTS = { pre: CodeBlock, table: TableWrapper };
const REMARK_PLUGINS = [remarkGfm];
const REHYPE_PLUGINS = [rehypeSlug, rehypeHighlight];

// Every post's body opens with a `# Title` line that duplicates the H1
// already rendered in the header above (post.title) — strip just that
// leading heading so the page ships exactly one <h1>.
function stripLeadingH1(markdown: string): string {
  const lines = markdown.split("\n");
  let i = 0;
  while (i < lines.length && lines[i].trim() === "") i++;
  if (i >= lines.length || !/^#\s+\S/.test(lines[i].trim())) return markdown;
  i++;
  while (i < lines.length && lines[i].trim() === "") i++;
  return lines.slice(i).join("\n");
}

// A couple of posts also use `# Section` as an in-body section break rather
// than a true title (e.g. SwaggerParserAgent.md) — demote any H1 left after
// the leading strip above to H2, so the rendered page never has more than
// one <h1>. Skips fenced code blocks so a `#` inside a comment/diagram isn't
// mistaken for a heading.
function normalizeHeadings(markdown: string): string {
  let inFence = false;
  return stripLeadingH1(markdown)
    .split("\n")
    .map((line) => {
      const trimmed = line.trim();
      if (/^(```|~~~)/.test(trimmed)) {
        inFence = !inFence;
        return line;
      }
      if (inFence) return line;
      return /^#\s+\S/.test(trimmed) ? line.replace(/^(\s*)#(\s+)/, "$1##$2") : line;
    })
    .join("\n");
}

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

  const body = useMemo(() => normalizeHeadings(post.content), [post.content]);
  // Derived from `body`, not the raw post — extractToc only looks for
  // `##`/`###`, so any `#` demoted to `##` by normalizeHeadings needs to be
  // in scope for the TOC to include it and for slugs to match rehype-slug's.
  const toc = useMemo(() => extractToc(body), [body]);

  return (
    <>
      <ReadingProgress postId={post.slug} initialPercent={initialPercent} />

      <article style={{ background: "var(--bg)" }}>
        {/* Hero cover — constrained to SVG native ratio so it never crops */}
        <div className="w-full overflow-hidden" style={{ background: "#0F1117" }}>
          <div className="mx-auto" style={{ maxWidth: 800, aspectRatio: "800/450", maxHeight: 420 }}>
            {post.coverImage ? (
              <Image
                src={post.coverImage}
                alt={post.title}
                width={800}
                height={450}
                className="w-full h-full object-cover"
                priority
              />
            ) : (
              <BlogCoverArt slug={post.slug} tags={post.tags} className="h-full" />
            )}
          </div>
        </div>

        {/* Article header
            Shares the same `max-w-260 mx-auto px-6` outer wrapper as the
            body section below (65rem = 48rem content + 3rem gap + 14rem TOC),
            with the text itself capped at max-w-3xl — so the title lines up
            with the reading column, not the page center, once the TOC exists. */}
        <div
          className="w-full py-8"
          style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}
        >
          <div className="max-w-260 mx-auto px-6">
            <div className="max-w-3xl">
              {/* Back button + breadcrumb */}
              <div className="flex items-center gap-3 mb-4">
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded font-mono text-xs font-medium transition-colors"
                  style={{
                    background: "var(--surface-2)",
                    color: "var(--text-muted)",
                    border: "1px solid var(--border)",
                  }}
                >
                  ← Back
                </Link>
                <span className="font-mono text-xs" style={{ color: "var(--border-strong)" }}>/</span>
                <span className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>{post.slug}</span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="tag"
                    style={{
                      background: `${getTagColor(tag)}1a`,
                      color: getTagColor(tag),
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
                    <span style={{ color: "var(--accent-text)" }}>~{minutesLeft} min left</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Article body */}
        <div className="max-w-260 mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,48rem)_14rem] lg:gap-12">
            <div className="w-full max-w-3xl">
              <TocMobile items={toc} />

              <div className="prose-blueprint">
                <ReactMarkdown
                  remarkPlugins={REMARK_PLUGINS}
                  rehypePlugins={REHYPE_PLUGINS}
                  components={MARKDOWN_COMPONENTS}
                >
                  {body}
                </ReactMarkdown>
              </div>

              <EngagementBar slug={post.slug} readingTime={post.readingTime} />

              {/* Next read suggestions */}
              <NextReadSuggestions suggestions={suggestions} />

            </div>

            <TocSidebar items={toc} />
          </div>
        </div>
      </article>

      {/* Reading engagement popup */}
      <ReadingPrompt postId={post.slug} suggestions={suggestions} />
    </>
  );
}
