# Blog Cover Art System

Reference for creating new animated SVG cover images for blog posts.

## Where it lives

`components/blog/BlogCoverArt.tsx` — all cover components live here as plain React functions.
`BlogCard.tsx`, `BlogPostClient.tsx`, `LatestNotes.tsx` and `NextReadSuggestions.tsx` all import and use `BlogCoverArt` automatically.

## How it works

Each post cover is an inline SVG rendered as JSX, not a static image file. This is intentional — CSS `@keyframes` and SMIL `<animateMotion>` animations only work when SVG is part of the DOM. Embedding an SVG via `<img src="...">` blocks all animations.

The slug of the post determines which cover renders:

```tsx
const SLUG_MAP: Record<string, React.FC> = {
  boostingTesting: BoostingTestingCover,
  kafka: KafkaLogCover,
};
```

If no slug match is found, `GenericCover` renders as a fallback, using `getTagHex()` from `lib/researchAreas.ts` to pick a color from the post's first tag.

**Important:** do not set `coverImage` in a post's frontmatter unless you have an actual image file at that path. If `coverImage` is set, the `<Image>` component is used and `BlogCoverArt` is bypassed entirely.

---

## The two rules

These covers are viewed at ~380×214 in the blog listing, several at a time. That is the size they have to work at, so the whole file is organised around keeping them apart:

**1. Hue.** Every post owns one signature hue plus a secondary (`alt`) from `COVER_THEME`, deliberately decoupled from its tags. Tag hues repeat — there are two `security` posts and two `databases` posts — so a tag-derived cover palette would collide by construction.

| Slug | `hue` | `alt` |
|---|---|---|
| `obervabilityService` | blue `#3B82F6` | amber `#F59E0B` |
| `SwaggerParserAgent` | cyan `#22D3EE` | rose `#F43F5E` |
| `boostingTesting` | emerald `#10B981` | amber `#F59E0B` |
| `Database` | lime `#A3E635` | emerald `#10B981` |
| `kafka` | amber `#F59E0B` | cyan `#22D3EE` |
| `redTeamingOchestrator` | rose `#F43F5E` | emerald `#10B981` |
| `CodeAnalysisAgent` | violet `#8B5CF6` | lime `#A3E635` |
| `AI-Blog` | fuchsia `#D946EF` | cyan `#22D3EE` |

Two rules govern that table, both learned by getting them wrong:

- **No two covers may share the same unordered `{hue, alt}` pair.** The first version gave `CodeAnalysisAgent` violet/blue against `obervabilityService` blue/violet, and `AI-Blog` fuchsia/rose against `redTeamingOchestrator` rose/fuchsia. Swapping which of two colors leads does *not* make two covers look different — they read as the same cover, and both pairs were flagged as duplicates on sight.
- **`alt` sits ≥90° from `hue`.** A secondary adjacent on the wheel (blue beside cyan, violet beside fuchsia) reads as a shade of the signature rather than a second color, which wastes the only axis separating covers that share a hue neighbourhood.

Eight posts over 360° means some signature hues land ~45° apart regardless. That's what `alt`, `texture` and silhouette are for.

**2. Silhouette.** Every post owns a compositional archetype. Shape alone should identify the post with the title covered:

| Slug | Archetype | Reads as |
|---|---|---|
| `boostingTesting` | fork-join | narrow → two wide rows of six → narrow |
| `kafka` | filmstrip | one thick full-width band |
| `redTeamingOchestrator` | siege | circular; target centred, techniques in orbit |
| `CodeAnalysisAgent` | call tree | downward-widening triangle |
| `SwaggerParserAgent` | staircase | diagonal band, top-left to bottom-right |
| `obervabilityService` | funnel | wide V collapsing into a solid ledger |
| `AI-Blog` | spine + arc | one horizontal row with a loop above |
| `Database` | bipartite | two horizontal blocks, traces crossing |

When adding a cover, pick an unused hue **and** an unused silhouette. If you can only manage one, prefer a new silhouette — shape survives thumbnailing better than color.

---

## Adding a new cover

1. Add an entry to `COVER_THEME` with a `hue`, an `alt`, a `texture`, and a `wash`.
2. Write a function component that renders `<CoverFrame id="xx" theme={...} header=… footer=…>` and draws only its own geometry inside, using `Node` / `Trace` / `Packet` / `Banner` / `Note`.
3. Add its slug to `SLUG_MAP`.

The card and post page pick it up automatically.

---

## `CoverFrame`

Handles everything every cover shares: the `#0F1117` canvas, the background texture, the hue wash, the glow filter, the top header line, and the two corner annotations. Covers used to repeat all of this by hand — that duplication is why the file was 1,400 lines and why a palette change meant editing ~350 hex literals.

```tsx
<CoverFrame
  id="kl"                              // namespaces all <defs> ids
  theme={COVER_THEME.kafka}
  header="KAFKA · APPEND-ONLY LOG, TWO CLOCKS"
  footer="distributed-systems · databases"
  defs={<path id="kl-append" d="…" />}  // motion paths go here
>
  {/* geometry */}
</CoverFrame>
```

`id` must be unique across covers — the blog listing renders several on one page, and duplicate `<defs>` ids would cross-wire their filters and motion paths. It also supplies the glow filter id: `` filter={`url(#${id}-glow)`} ``.

### Canvas

```
viewBox="0 0 800 450"
preserveAspectRatio="xMidYMid slice"
background: #0F1117
```

`slice` means the SVG fills its container and crops rather than letterboxing. Keep content inset to `x=26…774` — `BlogCard` applies `group-hover:scale-105`, which clips anything closer to the edge on hover.

Covers are always dark regardless of the site theme. `#0F1117` is hardcoded, and `BlogPostClient.tsx` wraps the hero in a matching background so it reads as intentional in light mode.

### Textures

Four, selected by `theme.texture`. Paired against hue so that no two posts adjacent in the date-sorted listing share both.

| Kind | Implementation |
|---|---|
| `dots` | 24px pattern, `circle r=0.7` at `rgba(255,255,255,0.045)` |
| `lines` | 32px pattern, 0.6px grid at `rgba(255,255,255,0.035)` |
| `hatch` | 14px pattern rotated 45°, 0.8px lines at `rgba(255,255,255,0.032)` |
| `rings` | not a pattern — six concentric circles centred on the canvas |

### Wash

A radial gradient in the signature hue, peaking at `theme.wash` (0.11–0.13). This is deliberately much stronger than the 0.04–0.05 vignette the covers originally used: it tints the *canvas*, so two thumbnails differ before you read anything on them. Don't drop it back down.

---

## Shared primitives

Use these rather than hand-rolling rects and text. They encode the typography scale.

### `Node` — the one visual unit these covers are built from

```tsx
<Node x={26} y={60} w={150} h={48}
      kicker="PRODUCER"      // small caps role label, optional
      name="append"          // the identity, bold, in `color`
      sub="commits manually" // optional third line; needs h ≥ 52
      color={t.hue}
      glow="kl-glow" pulse={0}  // both needed for the status dot
      nameSize={13}
      strong                 // strokeWidth 2 instead of 1.5 — use for the one focal node
/>
```

Text baselines shift automatically depending on whether `sub` is present, so a two-line and a three-line node stay optically aligned.

### `Trace` — dashed connector

```tsx
<Trace d="M 400 88 L 400 112" color={t.hue} opacity={0.35} />
```

Trace color should match its source node. Keep opacity in 0.18–0.42 so traces read as infrastructure, not foreground.

### `Packet` — dot travelling a motion path

```tsx
{/* path must be declared in the frame's `defs` prop */}
<Packet path="kl-append" color={t.hue} glow="kl-glow" dur={2.2} begin={0} />
```

- `dur` in seconds — shorter is faster
- `begin` staggers packets on the same path; `i * 0.35` is a good default
- `r` defaults to 4; use 3–3.5 for secondary flows

### `Banner` — tinted callout, for the claim the cover is making

```tsx
<Banner x={200} y={316} w={272} h={52}
        kicker="HEARTBEAT CLOCK" value="session.timeout.ms · 45s"
        color={t.hue} valueSize={11.5} />
```

### `Note` — centred monospace annotation for labelling a trace

```tsx
<Note x={430} y={76}>WRITES ONLY EVER LAND AT THE TAIL</Note>
```

---

## Keyframes

Defined once in the `STYLE` constant and injected into each SVG's `<style>` block:

```css
@keyframes bca-pulse  { 0%,100%{opacity:1}      50%{opacity:0.35} }
@keyframes bca-glow   { 0%,100%{opacity:0.6}    50%{opacity:1}    }
@keyframes bca-append { 0%,68%{opacity:0} 84%{opacity:1} 100%{opacity:0} }
@keyframes bca-sync   { 0%{opacity:0.25} 50%{opacity:0.85} 100%{opacity:0.25} }
```

`bca-append` animates **opacity on an overlay rect**, not `fill`. The previous version animated `fill` to a hardcoded blue, which made it unusable on any cover that wasn't blue. Keep new keyframes hue-agnostic for the same reason.

`bca-pulse` is also declared globally in `globals.css` for use outside SVGs (e.g. the navbar status dot).

---

## Typography

All text uses `fontFamily="'Courier New',monospace"`. The neutral ramp mirrors the `--cover-*` tokens in `globals.css`, kept as literals because SVG gradient stops and `${hue}14` alpha-suffix fills can't resolve `var()`.

| Role | fontSize | fill | letterSpacing |
|---|---|---|---|
| Page header | 8.5 | `DIM` `#334155` | 3 |
| Section label | 9 | `LABEL` `#475569` | 2 |
| Node kicker | 7 | `LABEL` `#475569` | 1.8 |
| Node identity | 10.5–20 | signature hue | — |
| Node sub-label | 6.5 | `MUTED` `#64748B` | — |
| `Note` annotation | 7 | `MUTED` `#64748B` | 1 |
| Corner annotation | 7.5 | `FAINT` `#1E293B` | — |
| De-emphasized **node** | — | `NEUTRAL` `#94A3B8` | — |

**Never use `DIM` or `FAINT` as a node or banner color.** They sit roughly one step off the `#0F1117` canvas, which is correct for decorative annotation and invisible for anything with a border and a label inside it. `obervabilityService`'s four `INVENT` agents and `CodeAnalysisAgent`'s five clean leaves were originally drawn in `DIM` and were effectively not on the page. De-emphasis that still has to be read is `NEUTRAL`.

---

## What the covers may claim

A cover is published content. Every number on one has to be true and has to match the post it belongs to — the old `boostingTesting` banner read `1 hour → 36 seconds · 100× throughput` while the post itself said `~6 Hours → Minutes`, which is the kind of thing a reader notices before anything else.

Prefer a claim about the design over an unverifiable ratio: `maxConcurrency(100)`, `present in 1 of 6 agents`, `execution paths, not file trees`. Those are checkable against the post and they're more interesting than a speedup multiple.

---

## Existing covers

### `boostingTesting` — fork-join, emerald
Backlog of 70,000 tests fans out to six per-key work units, then six threads, then rejoins at a single commit boundary (`maxConcurrency(100)`). The narrow-wide-narrow shape *is* the argument: one partition, many in flight, offsets still safe across a hard kill.

### `kafka` — filmstrip, amber
One eight-segment band spanning the full width. A producer reaches all the way right to append at the tail; a consumer trails at the committed offset, and the gap between them is lag. Below: the two timeouts people conflate — `session.timeout.ms` (heartbeat, 45s) against `max.poll.interval.ms` (processing, 5m).

### `redTeamingOchestrator` — siege, rose
Target agent centred with pulsing scan rings; six real techniques from the attack library (Crescendo, Tree Jailbreak, Bad Likert, ROT13, Base64, `<raw_prompt>`) sit on an elliptical orbit and strike inward. Packets circle the orbit rather than crossing the canvas. Three guard badges along the bottom: per-run budget mutex, last-turn-only validation, ten-message history window.

### `CodeAnalysisAgent` — call tree, violet (lime = the finding)
Route handler at the root widening through middleware and call levels to six leaves, of which exactly one is a tainted sink. Only the tainted path continues downward to the model — the point being that the model is asked about one execution path, not one repository. A re-plan arc on the right edge shows the agent widening its own search.

### `SwaggerParserAgent` — staircase, cyan
Five steps descending left to right, each unlocking the next, ending in the real `change_option=end_of_term` detail that turns a 422 into a 200. A back-edge arc marks the cycle guard. Bottom row names the rejected approach (more string matching) beside the kept one (deterministic first, AI at the edges).

### `obervabilityService` — funnel, blue
Six agent sources labelled by identity strategy (`TRUST` / `BORROW` / `INVENT`) converge on a single apex, through a narrow Kafka-and-writers stack, into a full-width ledger showing a reconstructed conversation. The wide solid block at the bottom is the silhouette's signature.

### `AI-Blog` — spine + arc, fuchsia
Five pipeline stages in one horizontal row with a dashed return arc above the last two — the ReAct loop, unbounded by default. Below: the three real per-agent recursion caps (8, 27, ~100), and the admission that the summarize-on-limit fallback exists in one agent of six.

### `Database` — bipartite, lime
Two-tier mapping rather than a pipeline. Row 1: the seven databases you pick, each labelled with its use case and what it gives up. Row 2: the six storage engines underneath, each showing its mechanism and where it pays. Every database bends through a shared row at `y=160` into its engine; MongoDB and PostgreSQL converge on the same B-Tree box.

This is the one cover that is intentionally multi-hue: engine identity is the information, so each of the six engines carries its own color (B-Tree lime, Inverted Idx emerald, Hash Slots rose, Time Series amber, Column Store cyan, LSM-Tree violet). Lime leads because B-Tree covers two of the seven databases.
