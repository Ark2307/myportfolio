import { ImageResponse } from "next/og";
import { getPostBySlug } from "@/lib/mdx";
import { getTagHex, getTagLabel } from "@/lib/researchAreas";

export const alt = "Post cover image";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Dynamic OG/Twitter card for posts without a static `coverImage`. Deliberately
 * simpler than the hand-animated <BlogCoverArt/> SVGs used on-site — satori
 * (the renderer behind ImageResponse) only supports a flexbox CSS subset, no
 * keyframe animations or gradients, so this reuses just the accent color and
 * dark "blueprint" background rather than the component itself.
 */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  const title = post?.title ?? slug.replace(/-/g, " ");
  const primaryTag = post?.tags[0];
  const accent = primaryTag ? getTagHex(primaryTag) : "#3B82F6";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#0F1117",
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", width: 56, height: 6, background: accent, borderRadius: 3, marginBottom: 40 }} />

        {primaryTag && (
          <div
            style={{
              display: "flex",
              fontSize: 22,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: accent,
              marginBottom: 24,
            }}
          >
            {getTagLabel(primaryTag)}
          </div>
        )}

        <div
          style={{
            display: "flex",
            fontSize: 56,
            fontWeight: 700,
            lineHeight: 1.25,
            color: "#E2E8F0",
            maxWidth: 980,
          }}
        >
          {title}
        </div>

        <div style={{ display: "flex", marginTop: "auto", fontSize: 24, color: "#64748B" }}>
          Aryan Khandelwal — Architecture Notes
        </div>
      </div>
    ),
    { ...size }
  );
}
