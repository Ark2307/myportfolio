# Blog Cover Art System

Reference for creating new animated SVG cover images for blog posts.

## Where it lives

`components/blog/BlogCoverArt.tsx` — all cover components live here as plain React functions.  
`BlogCard.tsx` and `BlogPostClient.tsx` both import and use `BlogCoverArt` automatically.

## How it works

Each post cover is an inline SVG rendered as JSX, not a static image file. This is intentional — CSS `@keyframes` and SMIL `<animateMotion>` animations only work when SVG is part of the DOM. Embedding an SVG via `<img src="...">` blocks all animations.

The slug of the post determines which cover renders:

```tsx
const SLUG_MAP: Record<string, React.FC> = {
  boostingTesting: BoostingTestingCover,
  kafka: KafkaLogCover,
};
```

If no slug match is found, `GenericCover` renders as a fallback using the post's first tag to pick a color.

**Important:** do not set `coverImage` in a post's frontmatter unless you have an actual image file at that path. If `coverImage` is set, the `<Image>` component is used and `BlogCoverArt` is bypassed entirely.

---

## Adding a new cover

1. Write a new function component in `BlogCoverArt.tsx` (e.g. `function MyPostCover() { ... }`).
2. Add its slug to `SLUG_MAP`.
3. That's it — the card and post page pick it up automatically.

---

## Canvas

Every cover uses the same canvas:

```
viewBox="0 0 800 450"
preserveAspectRatio="xMidYMid slice"
background: #0F1117
```

The `slice` value means the SVG fills its container and crops rather than letterboxing. Keep important content away from the edges.

---

## Color palette

Matches the design system tokens:

| Role | Value | Usage |
|---|---|---|
| Blue | `#3B82F6` | Producers, load generators, primary flow |
| Purple | `#8B5CF6` | Kafka internals, partitions, queues |
| Green | `#10B981` | Consumers, output, success state |
| Dark bg | `#0F1117` | Canvas background |
| Label text | `#475569` | Small uppercase monospace labels |
| Muted text | `#334155` | Header/footer annotations |
| Inactive | `#1E293B` | Offset labels, very dim decorative text |

All fills use these colors with opacity for depth:
- Box fill: `rgba(color, 0.07–0.10)`
- Box stroke: full color at `strokeWidth 1–1.5`

---

## Shared keyframes

Defined once in the `STYLE` constant and injected into each SVG's `<style>` block:

```css
@keyframes bca-pulse   { 0%,100%{opacity:1}    50%{opacity:0.35} }
@keyframes bca-glow    { 0%,100%{opacity:0.6}  50%{opacity:1}    }
@keyframes bca-newseg  { 0%,75%{fill:rgba(59,130,246,0.07)} 88%{fill:rgba(59,130,246,0.22)} 100%{fill:rgba(59,130,246,0.07)} }
@keyframes bca-isrsync { 0%{opacity:0.25} 50%{opacity:0.85} 100%{opacity:0.25} }
```

`bca-pulse` is also declared globally in `globals.css` for use outside SVGs (e.g. the navbar status dot).

---

## Dot grid background pattern

Every cover uses this pattern for the subtle dot grid:

```tsx
<pattern id="UNIQUE-dots" width="24" height="24" patternUnits="userSpaceOnUse">
  <circle cx="12" cy="12" r="0.7" fill="rgba(255,255,255,0.045)" />
</pattern>
// ...
<rect width="800" height="450" fill="url(#UNIQUE-dots)" />
```

Pattern IDs must be unique across all SVGs on the page — prefix with the cover's short name (e.g. `bt-dots`, `kl-dots`).

---

## Glow filter

Attach to animated nodes for a soft glow effect:

```tsx
<filter id="UNIQUE-glow">
  <feGaussianBlur stdDeviation="3" result="b" />
  <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
</filter>
// usage:
<circle r="4" fill="#3B82F6" filter="url(#UNIQUE-glow)" />
```

Use `stdDeviation="2.5–3"` for packets, smaller for status dots.

---

## Animated data packets

Packets travel along a declared path using SMIL `<animateMotion>` + `<mpath>`:

```tsx
<defs>
  {/* Invisible path that the packet follows */}
  <path id="my-path" d="M 100 200 L 400 200" />
</defs>

{/* The packet */}
<circle r="4" fill="#3B82F6" filter="url(#my-glow)">
  <animateMotion dur="1.8s" repeatCount="indefinite" begin="0.3s" calcMode="linear">
    <mpath href="#my-path" />
  </animateMotion>
</circle>
```

- `dur` controls speed — shorter = faster
- `begin` staggers multiple packets on the same path so they don't stack
- `calcMode="linear"` keeps constant velocity; use `"paced"` for curved paths
- `r="4"` for main packets, `r="3"` for secondary/ISR sync dots
- Stagger formula: `begin={`${index * 0.45}s`}` for evenly spaced packets

---

## Node boxes

Standard pattern for a labeled system component (producer, consumer, partition, etc.):

```tsx
{/* Dark fill + colored border */}
<rect x={x} y={y} width={w} height={h} rx="5" fill="#0F1117" stroke="#3B82F6" strokeWidth="1.5" />
{/* Tinted overlay */}
<rect x={x} y={y} width={w} height={h} rx="5" fill="rgba(59,130,246,0.07)" />
{/* Role label — small, muted, spaced */}
<text x={cx} y={y+18} textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="8" fill="#475569" letterSpacing="2.5">LABEL</text>
{/* Identity — large, colored */}
<text x={cx} y={y+38} textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="16" fontWeight="700" fill="#3B82F6">P0</text>
{/* Status dot — top right corner of the box */}
<circle cx={x+w-8} cy={y+8} r="3" fill="#3B82F6"
  style={{ animation: "bca-pulse 1.4s ease-in-out infinite", animationDelay: "0.2s" }}
  filter="url(#my-glow)" />
```

---

## Connection traces

Dashed lines between nodes:

```tsx
{/* Vertical */}
<path d="M 400 88 L 400 148" stroke="#8B5CF6" strokeWidth="1.5" fill="none" strokeDasharray="4 3" opacity="0.35" />

{/* Horizontal bus */}
<path d="M 160 112 L 640 112" stroke="#8B5CF6" strokeWidth="1" fill="none" opacity="0.18" />

{/* Junction square at branch point */}
<rect x={cx-3} y={y-3} width={6} height={6} rx="1" fill="#8B5CF6" opacity="0.55" />
```

Trace color should match the source node color. Keep opacity low (0.18–0.35) so they read as infrastructure, not foreground.

---

## Typography conventions

All text uses `fontFamily="'Courier New',monospace"`.

| Role | fontSize | fill | letterSpacing | notes |
|---|---|---|---|---|
| Page header | 8.5 | `#334155` | 3 | all caps, top center |
| Section label | 9 | `#475569` | 2 | e.g. "PARTITION 0 · COMMIT LOG" |
| Node role | 8 | `#475569` | 2.5 | e.g. "PRODUCER", "CONSUMER" |
| Node identity | 14–18 | color | — | bold, e.g. "P0", "write" |
| Offset/sub-label | 7 | `#1E3A5F` | — | very dim |
| Corner annotation | 7.5 | `#1E293B` | — | bottom-left: site name, bottom-right: tags |

---

## Result/metric banner

A summary callout at the bottom of a cover:

```tsx
<rect x="215" y="366" width="370" height="50" rx="6"
  fill="rgba(59,130,246,0.07)" stroke="rgba(59,130,246,0.2)" strokeWidth="1" />
<text x="400" y="383" textAnchor="middle" fontFamily="'Courier New',monospace"
  fontSize="8" fill="#475569" letterSpacing="3">RESULT</text>
<text x="400" y="404" textAnchor="middle" fontFamily="'Courier New',monospace"
  fontSize="15" fontWeight="700" fill="#3B82F6">1 hour → 36 seconds · 100× throughput</text>
```

---

## Corner annotations

Always include in the bottom corners:

```tsx
<text x="18"  y="444" fontFamily="'Courier New',monospace" fontSize="7.5" fill="#1E293B">aryan.dev</text>
<text x="782" y="444" textAnchor="end" fontFamily="'Courier New',monospace" fontSize="7.5" fill="#1E293B">tag1 · tag2</text>
```

---

## Existing covers

### `boostingTesting` — `BoostingTestingCover`
Topic: parallel Kafka consumer architecture, load testing throughput improvement.  
Layout (top → bottom): Load Generator → horizontal bus → P0 / P1 / P2 partitions → C0 / C1 / C2 consumers → metric banner.  
Colors: blue (generator), purple (partitions), green (consumers).  
Packets: blue gen→partition, purple partition→consumer.

### `kafka` — `KafkaLogCover`
Topic: Kafka internals, commit log, ISR replication.  
Layout: Producer → S0–S4 log segments (S4 pulses as "new") → Consumer; ISR LEADER / FOLLOWER A / FOLLOWER B below.  
Colors: blue (producer, active segment), purple (older segments, followers), green (consumer).  
Packets: blue producer→log, green log→consumer, purple ISR sync dots.
