"use client";

import { useEffect, useState, type MouseEvent } from "react";
import SectionLabel from "@/components/ui/SectionLabel";
import type { TocItem } from "@/lib/toc";

/**
 * Tracks which heading is currently "active" (topmost one crossing the
 * reading band) via IntersectionObserver, for scroll-spy highlighting.
 */
function useActiveHeading(items: TocItem[]): string | null {
  const [activeSlug, setActiveSlug] = useState<string | null>(items[0]?.slug ?? null);

  useEffect(() => {
    if (items.length === 0) return;

    const headingEls = items
      .map((item) => document.getElementById(item.slug))
      .filter((el): el is HTMLElement => el !== null);
    if (headingEls.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) setActiveSlug(visible[0].target.id);
      },
      // A heading counts as "active" once it crosses ~15% from the viewport
      // top, until it's within the bottom ~70% (i.e. a band near the top).
      { rootMargin: "-15% 0px -70% 0px", threshold: 0 }
    );

    headingEls.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [items]);

  return activeSlug;
}

function scrollToHeading(slug: string) {
  document.getElementById(slug)?.scrollIntoView({ behavior: "smooth" });
  history.replaceState(null, "", `#${slug}`);
}

function TocList({ items, activeSlug, onNavigate }: { items: TocItem[]; activeSlug: string | null; onNavigate?: (slug: string) => void }) {
  return (
    <ul className="flex flex-col gap-1">
      {items.map((item) => {
        const isActive = activeSlug === item.slug;
        const handleClick = (e: MouseEvent) => {
          e.preventDefault();
          scrollToHeading(item.slug);
          onNavigate?.(item.slug);
        };
        return (
          <li key={item.slug} style={{ marginLeft: item.depth === 3 ? 14 : 0 }}>
            <a
              href={`#${item.slug}`}
              onClick={handleClick}
              className="block py-1 text-sm leading-snug transition-colors"
              style={{
                borderLeft: `2px solid ${isActive ? "var(--accent)" : "transparent"}`,
                paddingLeft: 12,
                color: isActive ? "var(--accent-text)" : "var(--text-muted)",
                fontWeight: isActive ? 500 : 400,
              }}
            >
              {item.text}
            </a>
          </li>
        );
      })}
    </ul>
  );
}

interface TocProps {
  items: TocItem[];
}

/** Sticky "on this page" sidebar — desktop/large-viewport only. */
export function TocSidebar({ items }: TocProps) {
  const activeSlug = useActiveHeading(items);
  if (items.length === 0) return null;

  return (
    <aside
      className="hidden lg:block"
      style={{
        position: "sticky",
        top: "6rem",
        alignSelf: "start",
        maxHeight: "calc(100vh - 8rem)",
        overflowY: "auto",
      }}
    >
      <SectionLabel label="On This Page" />
      <TocList items={items} activeSlug={activeSlug} />
    </aside>
  );
}

/** Collapsible "on this page" dropdown — shown above the article on small viewports. */
export function TocMobile({ items }: TocProps) {
  const activeSlug = useActiveHeading(items);
  const [open, setOpen] = useState(false);
  if (items.length === 0) return null;

  return (
    <div className="lg:hidden mb-8">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between w-full px-4 py-2.5 rounded font-mono text-xs font-medium transition-colors"
        style={{ background: "var(--surface-2)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
        aria-expanded={open}
      >
        On this page
        <span style={{ display: "inline-block", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s ease" }}>
          ▾
        </span>
      </button>
      {open && (
        <div className="mt-2 p-4 rounded" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <TocList items={items} activeSlug={activeSlug} onNavigate={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
}
