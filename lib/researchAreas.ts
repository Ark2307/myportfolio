import { Network, Brain, Database, Activity, Shield, type LucideIcon } from "lucide-react";

/**
 * Single source of truth for the research-area/tag taxonomy used across the
 * blog: tag pills (BlogCard, BlogPostClient), tag filters (BlogListingClient),
 * and the homepage's ResearchAreas grid. Previously each of those files kept
 * its own copy of the label/color maps — this replaces all of them.
 */
export interface ResearchArea {
  slug: string;
  label: string;
  description: string;
  /** CSS custom property, e.g. "var(--tag-distributed)" — for use in the DOM/browser. */
  color: string;
  /**
   * Literal hex matching `color`'s CSS variable in app/globals.css. Needed
   * anywhere that can't resolve CSS custom properties at all — namely the
   * OG-image route, rendered by satori (next/og), which isn't a browser and
   * errors on `var(...)` in inline styles.
   */
  hex: string;
  icon: LucideIcon;
}

export const RESEARCH_AREAS: ResearchArea[] = [
  {
    slug: "distributed-systems",
    label: "Distributed Systems",
    description: "Consensus, replication, consistency models, and failure modes in large-scale systems.",
    color: "var(--tag-distributed)",
    hex: "#8B5CF6",
    icon: Network,
  },
  {
    slug: "ai-infrastructure",
    label: "AI Infrastructure",
    description: "MLOps, vector databases, embedding pipelines, and serving large language models.",
    color: "var(--tag-ai)",
    hex: "#3B82F6",
    icon: Brain,
  },
  {
    slug: "databases",
    label: "Databases",
    description: "Storage engines, query planners, indexing strategies, and schema evolution.",
    color: "var(--tag-database)",
    hex: "#10B981",
    icon: Database,
  },
  {
    slug: "observability",
    label: "Observability",
    description: "Structured events, SLO-driven alerting, distributed tracing, and continuous profiling.",
    color: "var(--tag-observability)",
    hex: "#F59E0B",
    icon: Activity,
  },
  {
    slug: "security",
    label: "Security",
    description: "API security, threat modeling, supply chain integrity, and zero-trust architectures.",
    color: "var(--tag-security)",
    hex: "#EF4444",
    icon: Shield,
  },
];

const RESEARCH_AREA_MAP: Record<string, ResearchArea> = Object.fromEntries(
  RESEARCH_AREAS.map((area) => [area.slug, area])
);

export function getResearchArea(tag: string): ResearchArea | undefined {
  return RESEARCH_AREA_MAP[tag];
}

export function getTagColor(tag: string): string {
  return RESEARCH_AREA_MAP[tag]?.color ?? "var(--accent-text)";
}

/** Literal hex fallback for rendering contexts that can't use CSS variables (e.g. satori/next-og). */
export function getTagHex(tag: string): string {
  return RESEARCH_AREA_MAP[tag]?.hex ?? "#2563EB";
}

export function getTagLabel(tag: string): string {
  return RESEARCH_AREA_MAP[tag]?.label ?? tag;
}
