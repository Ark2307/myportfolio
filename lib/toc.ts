import GithubSlugger from "github-slugger";

export interface TocItem {
  depth: 2 | 3;
  text: string;
  slug: string;
}

const HEADING_RE = /^(#{2,3})\s+(.+?)\s*$/;
const FENCE_RE = /^(```|~~~)/;

/**
 * Extracts h2/h3 headings from raw post markdown for the sticky TOC sidebar.
 * Slugs are generated with `github-slugger` — the same library rehype-slug
 * uses internally to id-tag rendered headings — so `#slug` links here match
 * the actual anchors in the DOM. Lines inside fenced code blocks are
 * skipped so a `##` inside an ASCII diagram isn't read as a heading.
 */
export function extractToc(markdown: string): TocItem[] {
  const slugger = new GithubSlugger();
  const items: TocItem[] = [];
  let inFence = false;

  for (const line of markdown.split("\n")) {
    if (FENCE_RE.test(line.trim())) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const match = HEADING_RE.exec(line);
    if (!match) continue;

    const text = match[2].trim();
    if (!text) continue;

    items.push({
      depth: match[1].length as 2 | 3,
      text,
      slug: slugger.slug(text),
    });
  }

  return items;
}
