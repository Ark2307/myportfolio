"use client";

import type { ReactNode } from "react";
import { getTagHex } from "@/lib/researchAreas";

/* ──────────────────────────────────────────────────────────
   Inline animated SVG cover art — renders live in browser.
   Used when a blog post has no static cover image.

   Two rules keep these distinguishable as thumbnails, which is
   the whole point of the file:

   1. HUE — every post owns one signature hue from COVER_THEME,
      independent of its tags. Tag hues repeat (two `security`
      posts, two `databases` posts), so tag-derived covers would
      collide by construction.
   2. SILHOUETTE — every post owns a compositional archetype
      (fork-join, filmstrip, siege, tree, staircase, funnel,
      spine, bipartite). Shape alone should identify the post at
      ~380x214 with the title covered.

   Covers are always drawn on the dark canvas regardless of site
   theme — see the #0F1117 wrapper at BlogPostClient.tsx.
   ────────────────────────────────────────────────────────── */

const CANVAS = "#0F1117";
const MONO = "'Courier New',monospace";

/* Neutral label ramp, brightest to faintest. Mirrors the --cover-*
   tokens in app/globals.css; kept as literals because SVG gradient
   stops and the `${hue}14` alpha-suffix fills can't resolve var(). */
const LABEL = "#475569";
const MUTED = "#64748B";
const DIM = "#334155";
const FAINT = "#1E293B";
/* De-emphasized NODES use this, never DIM. DIM is ~1 step off the #0F1117
   canvas, which is fine for decorative annotations and invisible for anything
   with a border and a label in it. */
const NEUTRAL = "#94A3B8";

const STYLE = `
  @keyframes bca-pulse  { 0%,100%{opacity:1} 50%{opacity:0.35} }
  @keyframes bca-glow   { 0%,100%{opacity:0.6} 50%{opacity:1} }
  @keyframes bca-append { 0%,68%{opacity:0} 84%{opacity:1} 100%{opacity:0} }
  @keyframes bca-sync   { 0%{opacity:0.25} 50%{opacity:0.85} 100%{opacity:0.25} }
`;

/* ── Theme table ────────────────────────────────────────── */

type Texture = "dots" | "lines" | "hatch" | "rings";

interface CoverTheme {
  /** Dominant hue — carries roughly 70% of the strokes. */
  hue: string;
  /** Secondary, used for the one element that must read as separate. */
  alt: string;
  texture: Texture;
  /** Peak opacity of the background wash. Tints the canvas itself. */
  wash: number;
}

/* Eight signature hues spaced around the wheel (215° 187° 160° 82° 38° 350° 258° 292°).
 *
 * TWO RULES, both learned by getting them wrong:
 *
 * 1. No two covers may share the same UNORDERED {hue, alt} pair. The first
 *    version of this table gave CodeAnalysisAgent violet/blue and
 *    obervabilityService blue/violet, and AI-Blog fuchsia/rose against
 *    redTeamingOchestrator rose/fuchsia. Swapping which of two colors leads
 *    does not make two covers look different — they read as the same cover.
 *
 * 2. `alt` sits ≥90° from `hue`. A secondary that's adjacent on the wheel
 *    (blue next to cyan, violet next to fuchsia) reads as a shade of the
 *    signature rather than a second color, which wastes the only axis that
 *    separates covers sharing a hue neighbourhood.
 *
 * Eight posts over 360° means some signature hues land ~45° apart no matter
 * what. That's what `alt`, `texture` and silhouette are for.
 */
const COVER_THEME: Record<string, CoverTheme> = {
  boostingTesting: { hue: "#10B981", alt: "#F59E0B", texture: "dots", wash: 0.13 },
  kafka: { hue: "#F59E0B", alt: "#22D3EE", texture: "lines", wash: 0.11 },
  redTeamingOchestrator: { hue: "#F43F5E", alt: "#10B981", texture: "hatch", wash: 0.12 },
  CodeAnalysisAgent: { hue: "#8B5CF6", alt: "#A3E635", texture: "dots", wash: 0.12 },
  SwaggerParserAgent: { hue: "#22D3EE", alt: "#F43F5E", texture: "lines", wash: 0.11 },
  obervabilityService: { hue: "#3B82F6", alt: "#F59E0B", texture: "hatch", wash: 0.13 },
  "AI-Blog": { hue: "#D946EF", alt: "#22D3EE", texture: "rings", wash: 0.12 },
  Database: { hue: "#A3E635", alt: "#10B981", texture: "rings", wash: 0.11 },
};

/* ── Shared frame ───────────────────────────────────────── */

/**
 * Background, texture, wash, glow filter, header and corner annotations —
 * every cover repeated all of this. `id` namespaces the <defs> because the
 * blog listing renders several covers on one page.
 */
function CoverFrame({
  id,
  theme,
  header,
  footer,
  defs,
  children,
}: {
  id: string;
  theme: CoverTheme;
  header: string;
  footer: string;
  /** Extra <defs> content — motion paths, mostly. */
  defs?: ReactNode;
  children: ReactNode;
}) {
  const { hue, texture, wash } = theme;
  return (
    <svg
      viewBox="0 0 800 450"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <style>{STYLE}</style>
        {texture === "dots" && (
          <pattern id={`${id}-tex`} width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="12" cy="12" r="0.7" fill="rgba(255,255,255,0.045)" />
          </pattern>
        )}
        {texture === "lines" && (
          <pattern id={`${id}-tex`} width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M 32 0 V 32 M 0 32 H 32" stroke="rgba(255,255,255,0.035)" strokeWidth="0.6" fill="none" />
          </pattern>
        )}
        {texture === "hatch" && (
          <pattern id={`${id}-tex`} width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="14" stroke="rgba(255,255,255,0.032)" strokeWidth="0.8" />
          </pattern>
        )}
        <filter id={`${id}-glow`}>
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id={`${id}-wash`} cx="50%" cy="46%" r="62%">
          <stop offset="0%" stopColor={hue} stopOpacity={wash} />
          <stop offset="55%" stopColor={hue} stopOpacity={wash * 0.32} />
          <stop offset="100%" stopColor={hue} stopOpacity="0" />
        </radialGradient>
        {defs}
      </defs>

      <rect width="800" height="450" fill={CANVAS} />
      {texture === "rings" ? (
        <g>
          {[80, 145, 210, 275, 340, 405].map((r) => (
            <circle key={r} cx="400" cy="225" r={r} fill="none" stroke="rgba(255,255,255,0.035)" strokeWidth="0.7" />
          ))}
        </g>
      ) : (
        <rect width="800" height="450" fill={`url(#${id}-tex)`} />
      )}
      <rect width="800" height="450" fill={`url(#${id}-wash)`} />

      <text x="400" y="22" textAnchor="middle" fontFamily={MONO} fontSize="8.5" fill={DIM} letterSpacing="3">
        {header}
      </text>

      {children}

      <text x="18" y="444" fontFamily={MONO} fontSize="7.5" fill={FAINT}>
        aryan.dev
      </text>
      <text x="782" y="444" textAnchor="end" fontFamily={MONO} fontSize="7.5" fill={FAINT}>
        {footer}
      </text>
    </svg>
  );
}

/* ── Shared primitives ──────────────────────────────────── */

/** The one visual unit these covers are built from: a labeled box. */
function Node({
  x,
  y,
  w,
  h,
  kicker,
  name,
  sub,
  color,
  glow,
  pulse,
  nameSize = 13,
  strong = false,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  kicker?: string;
  name: string;
  sub?: string;
  color: string;
  /** Frame glow filter id, e.g. `bt-glow`. Enables the status dot. */
  glow?: string;
  /** Animation delay in seconds for the status dot. */
  pulse?: number;
  nameSize?: number;
  strong?: boolean;
}) {
  const cx = x + w / 2;
  const kickerY = sub ? y + 15 : y + h / 2 - 6;
  const nameY = sub ? y + 35 : y + h / 2 + 13;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="5" fill={CANVAS} stroke={color} strokeWidth={strong ? 2 : 1.5} />
      <rect x={x} y={y} width={w} height={h} rx="5" fill={`${color}14`} />
      {kicker && (
        <text x={cx} y={kickerY} textAnchor="middle" fontFamily={MONO} fontSize="7" fill={LABEL} letterSpacing="1.8">
          {kicker}
        </text>
      )}
      <text x={cx} y={nameY} textAnchor="middle" fontFamily={MONO} fontSize={nameSize} fontWeight="700" fill={color}>
        {name}
      </text>
      {sub && (
        <text x={cx} y={y + 48} textAnchor="middle" fontFamily={MONO} fontSize="6.5" fill={MUTED}>
          {sub}
        </text>
      )}
      {glow && pulse !== undefined && (
        <circle
          cx={x + w - 9}
          cy={y + 9}
          r="3"
          fill={color}
          filter={`url(#${glow})`}
          style={{ animation: "bca-pulse 1.6s ease-in-out infinite", animationDelay: `${pulse}s` }}
        />
      )}
    </g>
  );
}

/** Dashed connector between nodes. */
function Trace({
  d,
  color,
  opacity = 0.35,
  width = 1.5,
  dash = "4 3",
}: {
  d: string;
  color: string;
  opacity?: number;
  width?: number;
  dash?: string;
}) {
  return <path d={d} stroke={color} strokeWidth={width} fill="none" strokeDasharray={dash} opacity={opacity} />;
}

/** A dot travelling a motion path declared in <defs>. */
function Packet({
  path,
  color,
  glow,
  dur,
  begin,
  r = 4,
}: {
  path: string;
  color: string;
  glow?: string;
  dur: number;
  begin: number;
  r?: number;
}) {
  return (
    <circle r={r} fill={color} filter={glow ? `url(#${glow})` : undefined}>
      <animateMotion dur={`${dur}s`} repeatCount="indefinite" begin={`${begin}s`} calcMode="linear">
        <mpath href={`#${path}`} />
      </animateMotion>
    </circle>
  );
}

/** Tinted callout strip — the claim a cover is making. */
function Banner({
  x,
  y,
  w,
  h = 50,
  kicker,
  value,
  color,
  valueSize = 13,
}: {
  x: number;
  y: number;
  w: number;
  h?: number;
  kicker: string;
  value: string;
  color: string;
  valueSize?: number;
}) {
  const cx = x + w / 2;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="6" fill={`${color}12`} stroke={`${color}33`} strokeWidth="1" />
      <text x={cx} y={y + 18} textAnchor="middle" fontFamily={MONO} fontSize="7.5" fill={LABEL} letterSpacing="2.5">
        {kicker}
      </text>
      <text x={cx} y={y + 38} textAnchor="middle" fontFamily={MONO} fontSize={valueSize} fontWeight="700" fill={color}>
        {value}
      </text>
    </g>
  );
}

/** Small monospace annotation, for labelling a trace. */
function Note({ x, y, children, color = MUTED }: { x: number; y: number; children: string; color?: string }) {
  return (
    <text x={x} y={y} textAnchor="middle" fontFamily={MONO} fontSize="7" fill={color} letterSpacing="1">
      {children}
    </text>
  );
}

/* ═══════════════════════════════════════════════════════════
   1. boostingTesting — FORK-JOIN
   Silhouette: narrow → wide (two rows of six) → narrow.
   ═══════════════════════════════════════════════════════════ */
function BoostingTestingCover() {
  const t = COVER_THEME.boostingTesting;
  const GLOW = "bt-glow";
  const LANES = 6;
  const LW = 116;
  const laneX = (i: number) => 27 + i * (LW + 10);
  const laneCX = (i: number) => laneX(i) + LW / 2;

  const P_Y = 134;
  const C_Y = 228;
  const LANE_H = 54;

  return (
    <CoverFrame
      id="bt"
      theme={t}
      header="PARALLEL CONSUMER · ONE PARTITION, MANY IN-FLIGHT"
      footer="distributed-systems · observability"
      defs={
        <>
          {Array.from({ length: LANES }, (_, i) => (
            <path key={i} id={`bt-in${i}`} d={`M 400 88 L 400 112 L ${laneCX(i)} 112 L ${laneCX(i)} ${P_Y}`} />
          ))}
          {Array.from({ length: LANES }, (_, i) => (
            <path key={i} id={`bt-mid${i}`} d={`M ${laneCX(i)} ${P_Y + LANE_H} L ${laneCX(i)} ${C_Y}`} />
          ))}
          {Array.from({ length: LANES }, (_, i) => (
            <path key={i} id={`bt-out${i}`} d={`M ${laneCX(i)} ${C_Y + LANE_H} L ${laneCX(i)} 304 L 400 304 L 400 322`} />
          ))}
        </>
      }
    >
      {/* Source */}
      <Node
        x={300}
        y={36}
        w={200}
        h={52}
        kicker="TEST BACKLOG"
        name="70,000 tests"
        color={t.hue}
        glow={GLOW}
        pulse={0}
        nameSize={14}
      />

      {/* Fan-out */}
      <Trace d="M 400 88 L 400 112" color={t.hue} />
      <Trace d={`M ${laneCX(0)} 112 L ${laneCX(LANES - 1)} 112`} color={t.hue} opacity={0.18} dash="0" width={1} />
      {Array.from({ length: LANES }, (_, i) => (
        <g key={i}>
          <Trace d={`M ${laneCX(i)} 112 L ${laneCX(i)} ${P_Y}`} color={t.hue} />
          <rect x={laneCX(i) - 3} y={109} width={6} height={6} rx="1" fill={t.hue} opacity="0.55" />
        </g>
      ))}

      {/* Work units — the Parallel Consumer's per-key queues */}
      {Array.from({ length: LANES }, (_, i) => (
        <Node
          key={i}
          x={laneX(i)}
          y={P_Y}
          w={LW}
          h={LANE_H}
          kicker="WORK UNIT"
          name={`W${i}`}
          sub="per-key queue"
          color={t.alt}
          glow={GLOW}
          pulse={i * 0.22}
          nameSize={15}
        />
      ))}

      {Array.from({ length: LANES }, (_, i) => (
        <Trace key={i} d={`M ${laneCX(i)} ${P_Y + LANE_H} L ${laneCX(i)} ${C_Y}`} color={t.hue} />
      ))}

      {/* Threads */}
      {Array.from({ length: LANES }, (_, i) => (
        <Node
          key={i}
          x={laneX(i)}
          y={C_Y}
          w={LW}
          h={LANE_H}
          kicker="THREAD"
          name={`T${i}`}
          sub="offset tracked"
          color={t.hue}
          glow={GLOW}
          pulse={0.1 + i * 0.18}
          nameSize={15}
        />
      ))}

      {/* Join */}
      {Array.from({ length: LANES }, (_, i) => (
        <Trace key={i} d={`M ${laneCX(i)} ${C_Y + LANE_H} L ${laneCX(i)} 304 L 400 304`} color={t.alt} opacity={0.28} />
      ))}
      <Trace d="M 400 304 L 400 322" color={t.alt} />

      <Banner
        x={240}
        y={322}
        w={320}
        h={56}
        kicker="COMMIT BOUNDARY"
        value="maxConcurrency(100)"
        color={t.hue}
        valueSize={15}
      />

      <Note x={400} y={402} color={MUTED}>
        ONE CONSUMER GROUP · 100 IN FLIGHT · OFFSETS SAFE ACROSS A HARD KILL
      </Note>

      {/* Packets */}
      {Array.from({ length: LANES }, (_, i) => (
        <Packet key={i} path={`bt-in${i}`} color={t.hue} glow={GLOW} dur={1.8} begin={i * 0.22} />
      ))}
      {Array.from({ length: LANES }, (_, i) => (
        <Packet key={i} path={`bt-mid${i}`} color={t.alt} glow={GLOW} dur={1.1} begin={1.0 + i * 0.2} r={3.5} />
      ))}
      {Array.from({ length: LANES }, (_, i) => (
        <Packet key={i} path={`bt-out${i}`} color={t.hue} glow={GLOW} dur={1.6} begin={2.0 + i * 0.18} r={3.5} />
      ))}
    </CoverFrame>
  );
}

/* ═══════════════════════════════════════════════════════════
   2. kafka — FILMSTRIP
   Silhouette: one thick full-width band.
   ═══════════════════════════════════════════════════════════ */
function KafkaLogCover() {
  const t = COVER_THEME.kafka;
  const GLOW = "kl-glow";
  const SEGS = 8;
  const SW = 84;
  const SH = 96;
  const SY = 164;
  const segX = (i: number) => 43 + i * (SW + 6);
  const segCX = (i: number) => segX(i) + SW / 2;

  const COMMITTED = 2;
  const TAIL = SEGS - 1;

  return (
    <CoverFrame
      id="kl"
      theme={t}
      header="KAFKA · APPEND-ONLY LOG, TWO CLOCKS"
      footer="distributed-systems · databases"
      defs={
        <>
          <path id="kl-append" d={`M 176 84 L ${segCX(TAIL)} 84 L ${segCX(TAIL)} ${SY}`} />
          <path id="kl-read" d={`M ${segCX(COMMITTED)} ${SY + SH} L ${segCX(COMMITTED)} 342 L 176 342`} />
        </>
      }
    >
      <Node
        x={26}
        y={60}
        w={150}
        h={48}
        kicker="PRODUCER"
        name="append"
        color={t.hue}
        glow={GLOW}
        pulse={0}
        nameSize={13}
      />

      {/* The long reach to the tail is the point: writes only ever land at the end */}
      <Trace d={`M 176 84 L ${segCX(TAIL)} 84`} color={t.hue} opacity={0.3} />
      <Trace d={`M ${segCX(TAIL)} 84 L ${segCX(TAIL)} ${SY}`} color={t.hue} />
      <Note x={430} y={76} color={MUTED}>
        WRITES ONLY EVER LAND AT THE TAIL
      </Note>

      <text x="400" y={SY - 14} textAnchor="middle" fontFamily={MONO} fontSize="9" fill={LABEL} letterSpacing="2">
        PARTITION 0 · SEGMENT FILES ON DISK
      </text>

      {/* The band */}
      {Array.from({ length: SEGS }, (_, i) => {
        const isTail = i === TAIL;
        const isCommitted = i === COMMITTED;
        const color = isTail ? t.alt : t.hue;
        return (
          <g key={i}>
            <rect
              x={segX(i)}
              y={SY}
              width={SW}
              height={SH}
              rx="4"
              fill={CANVAS}
              stroke={color}
              strokeWidth={isTail ? 1.8 : 1}
              opacity={isTail ? 1 : 0.75}
            />
            <rect x={segX(i)} y={SY} width={SW} height={SH} rx="4" fill={`${color}10`} />
            {isTail && (
              <rect
                x={segX(i)}
                y={SY}
                width={SW}
                height={SH}
                rx="4"
                fill={`${t.alt}38`}
                style={{ animation: "bca-append 3s ease-in-out infinite" }}
              />
            )}
            <text x={segCX(i)} y={SY + 22} textAnchor="middle" fontFamily={MONO} fontSize="7" fill={LABEL} letterSpacing="1.5">
              SEGMENT
            </text>
            <text x={segCX(i)} y={SY + 52} textAnchor="middle" fontFamily={MONO} fontSize="20" fontWeight="700" fill={color}>
              S{i}
            </text>
            <text x={segCX(i)} y={SY + 72} textAnchor="middle" fontFamily={MONO} fontSize="7" fill={MUTED}>
              off {i * 100}+
            </text>
            {isCommitted && (
              <text x={segCX(i)} y={SY + 87} textAnchor="middle" fontFamily={MONO} fontSize="6.5" fill={t.alt}>
                committed
              </text>
            )}
            {isTail && (
              <text x={segCX(i)} y={SY + 87} textAnchor="middle" fontFamily={MONO} fontSize="6.5" fill={t.alt}>
                log end
              </text>
            )}
          </g>
        );
      })}

      {/* Consumer trails the tail — the gap is lag */}
      <Trace d={`M ${segCX(COMMITTED)} ${SY + SH} L ${segCX(COMMITTED)} 342 L 176 342`} color={t.alt} />
      <Node
        x={26}
        y={316}
        w={150}
        h={52}
        kicker="CONSUMER"
        name="read"
        sub="commits manually"
        color={t.alt}
        glow={GLOW}
        pulse={0.4}
        nameSize={13}
      />

      {/* The scar: two timeouts people conflate */}
      <Banner
        x={200}
        y={316}
        w={272}
        h={52}
        kicker="HEARTBEAT CLOCK"
        value="session.timeout.ms · 45s"
        color={t.hue}
        valueSize={11.5}
      />
      <Banner
        x={490}
        y={316}
        w={284}
        h={52}
        kicker="PROCESSING CLOCK"
        value="max.poll.interval.ms · 5m"
        color={t.alt}
        valueSize={11.5}
      />

      <Note x={400} y={396} color={MUTED}>
        A CONSUMER CAN HEARTBEAT PERFECTLY AND STILL BE EVICTED FOR SLOW PROCESSING
      </Note>

      <Packet path="kl-append" color={t.hue} glow={GLOW} dur={2.2} begin={0} />
      <Packet path="kl-append" color={t.hue} glow={GLOW} dur={2.2} begin={1.1} />
      <Packet path="kl-read" color={t.alt} glow={GLOW} dur={1.6} begin={0.6} r={3.5} />
    </CoverFrame>
  );
}

/* ═══════════════════════════════════════════════════════════
   3. redTeamingOchestrator — SIEGE
   Silhouette: circular. Target at centre, techniques in orbit.
   ═══════════════════════════════════════════════════════════ */
function RedTeamOrchestratorCover() {
  const t = COVER_THEME.redTeamingOchestrator;
  const GLOW = "rt-glow";
  const CX = 400;
  /* Orbit sits high and flat so the y=+90° node clears the badge row at y=366. */
  const CY = 194;
  const RX = 300;
  const RY = 126;
  const NW = 138;
  const NH = 46;
  const TARGET_R = 58;

  /* Techniques from the attack library, placed on the outer orbit. */
  const ATTACKS = [
    "Crescendo",
    "Tree Jailbreak",
    "Bad Likert",
    "ROT13",
    "Base64",
    "<raw_prompt>",
  ] as const;

  const at = (i: number) => {
    const a = ((i * 60 - 90) * Math.PI) / 180;
    return { x: CX + RX * Math.cos(a), y: CY + RY * Math.sin(a), a };
  };

  /* Inward trace, stopped short of the target so it reads as a strike. */
  const strike = (i: number) => {
    const { x, y } = at(i);
    const dx = CX - x;
    const dy = CY - y;
    const len = Math.hypot(dx, dy);
    const stop = TARGET_R + 8;
    return `M ${x.toFixed(1)} ${y.toFixed(1)} L ${(x + (dx / len) * (len - stop)).toFixed(1)} ${(
      y +
      (dy / len) * (len - stop)
    ).toFixed(1)}`;
  };

  const orbit = `M ${CX} ${CY - RY} A ${RX} ${RY} 0 1 1 ${CX} ${CY + RY} A ${RX} ${RY} 0 1 1 ${CX} ${CY - RY}`;

  return (
    <CoverFrame
      id="rt"
      theme={t}
      header="RED TEAM ORCHESTRATOR · MULTI-TURN, ADAPTIVE"
      footer="security · ai-infrastructure"
      defs={<path id="rt-orbit" d={orbit} />}
    >
      {/* Orbits — innermost stays outside the target disc so it stays visible */}
      {[
        [RX, RY, 0.16],
        [RX * 0.76, RY * 0.76, 0.12],
        [RX * 0.54, RY * 0.54, 0.09],
      ].map(([rx, ry, op]) => (
        <ellipse key={rx} cx={CX} cy={CY} rx={rx} ry={ry} fill="none" stroke={t.hue} strokeWidth="1" strokeDasharray="5 6" opacity={op} />
      ))}

      {/* Strikes inward */}
      {ATTACKS.map((name, i) => (
        <Trace key={name} d={strike(i)} color={i % 2 ? t.alt : t.hue} opacity={0.42} dash="4 4" />
      ))}

      {/* Target */}
      <circle cx={CX} cy={CY} r={TARGET_R + 20} fill="none" stroke={t.hue} strokeWidth="0.8" opacity="0.12" style={{ animation: "bca-pulse 2.4s ease-in-out infinite" }} />
      <circle cx={CX} cy={CY} r={TARGET_R + 38} fill="none" stroke={t.hue} strokeWidth="0.6" opacity="0.07" style={{ animation: "bca-pulse 2.4s ease-in-out infinite", animationDelay: "0.8s" }} />
      <circle cx={CX} cy={CY} r={TARGET_R} fill={CANVAS} stroke={t.hue} strokeWidth="2" />
      <circle cx={CX} cy={CY} r={TARGET_R} fill={`${t.hue}18`} />
      <text x={CX} y={CY - 18} textAnchor="middle" fontFamily={MONO} fontSize="7" fill={LABEL} letterSpacing="2">
        TARGET
      </text>
      <text x={CX} y={CY + 2} textAnchor="middle" fontFamily={MONO} fontSize="14" fontWeight="700" fill={t.hue}>
        AI Agent
      </text>
      <text x={CX} y={CY + 18} textAnchor="middle" fontFamily={MONO} fontSize="7.5" fill={MUTED}>
        + MCP server
      </text>
      <text x={CX} y={CY + 33} textAnchor="middle" fontFamily={MONO} fontSize="6.5" fill={t.alt}>
        tool calls visible
      </text>

      {/* Techniques in orbit */}
      {ATTACKS.map((name, i) => {
        const { x, y } = at(i);
        return (
          <Node
            key={name}
            x={x - NW / 2}
            y={y - NH / 2}
            w={NW}
            h={NH}
            name={name}
            color={i % 2 ? t.alt : t.hue}
            glow={GLOW}
            pulse={i * 0.3}
            nameSize={11.5}
          />
        );
      })}

      {/* Guards */}
      <Banner x={26} y={366} w={228} h={50} kicker="BUDGET GUARD" value="per-run mutex" color={t.hue} valueSize={12} />
      <Banner x={286} y={366} w={228} h={50} kicker="VALIDATION" value="last turn only" color={t.alt} valueSize={12} />
      <Banner x={546} y={366} w={228} h={50} kicker="HISTORY WINDOW" value="last 10 messages" color={t.hue} valueSize={12} />

      <Packet path="rt-orbit" color={t.alt} glow={GLOW} dur={6} begin={0} r={3.5} />
      <Packet path="rt-orbit" color={t.hue} glow={GLOW} dur={6} begin={2} r={3.5} />
      <Packet path="rt-orbit" color={t.alt} glow={GLOW} dur={6} begin={4} r={3.5} />
    </CoverFrame>
  );
}

/* ═══════════════════════════════════════════════════════════
   4. CodeAnalysisAgent — CALL TREE
   Silhouette: downward-widening triangle.
   ═══════════════════════════════════════════════════════════ */
function CodeAnalysisAgentCover() {
  const t = COVER_THEME.CodeAnalysisAgent;
  const GLOW = "ca-glow";

  const L2 = [176, 476];
  const L3 = [42, 231, 421, 610];
  const L4 = [27, 153, 279, 405, 531, 657];
  const L4W = 116;
  const SINK = 4;

  const c = (x: number, w: number) => x + w / 2;

  return (
    <CoverFrame
      id="ca"
      theme={t}
      header="AI CODE ANALYSIS · EXECUTION PATHS, NOT FILE TREES"
      footer="security · ai-infrastructure"
      defs={
        <>
          <path id="ca-root" d="M 400 82 L 400 96 L 250 96 L 250 112" />
          <path id="ca-sink" d={`M ${c(L4[SINK], L4W)} 322 L ${c(L4[SINK], L4W)} 350`} />
          <path id="ca-replan" d="M 740 292 C 776 292 776 158 740 158" />
        </>
      }
    >
      {/* Root */}
      <Node x={326} y={34} w={148} h={48} kicker="ENTRY" name="route handler" color={t.hue} glow={GLOW} pulse={0} nameSize={12} />

      {/* Root → L2 */}
      {L2.map((x) => (
        <Trace key={x} d={`M 400 82 L 400 96 L ${c(x, 148)} 96 L ${c(x, 148)} 112`} color={t.hue} />
      ))}
      {L2.map((x) => (
        <Node
          key={x}
          x={x}
          y={112}
          w={148}
          h={48}
          kicker="MIDDLEWARE"
          name={x === 176 ? "authn" : "authz"}
          color={t.hue}
          glow={GLOW}
          pulse={x === 176 ? 0.3 : 0.5}
          nameSize={12}
        />
      ))}

      {/* L2 → L3 */}
      {L3.map((x, i) => (
        <Trace
          key={x}
          d={`M ${c(L2[i < 2 ? 0 : 1], 148)} 160 L ${c(L2[i < 2 ? 0 : 1], 148)} 176 L ${c(x, 148)} 176 L ${c(x, 148)} 190`}
          color={t.hue}
          opacity={0.3}
        />
      ))}
      {/* Violet is traversal, slate is ignored, and alt is reserved for the one
          thing being looked for — so the sink below is the only alt node. */}
      {L3.map((x, i) => (
        <Node
          key={x}
          x={x}
          y={190}
          w={148}
          h={48}
          kicker="CALL"
          name={["resolve()", "loadUser()", "buildQuery()", "render()"][i]}
          color={t.hue}
          glow={GLOW}
          pulse={0.2 * i}
          nameSize={11}
        />
      ))}

      {/* L3 → L4 */}
      {[0, 0, 1, 2, 3, 3].map((parent, i) => (
        <Trace
          key={i}
          d={`M ${c(L3[parent], 148)} 238 L ${c(L3[parent], 148)} 254 L ${c(L4[i], L4W)} 254 L ${c(L4[i], L4W)} 268`}
          color={i === SINK ? t.alt : NEUTRAL}
          opacity={i === SINK ? 0.55 : 0.2}
        />
      ))}
      {L4.map((x, i) => (
        <Node
          key={x}
          x={x}
          y={268}
          w={L4W}
          h={54}
          kicker={i === SINK ? "SINK" : "LEAF"}
          name={i === SINK ? "raw SQL" : `f${i}`}
          sub={i === SINK ? "tainted param" : "clean"}
          color={i === SINK ? t.alt : NEUTRAL}
          glow={i === SINK ? GLOW : undefined}
          pulse={i === SINK ? 0 : undefined}
          nameSize={12}
          strong={i === SINK}
        />
      ))}

      {/* Only the tainted path goes to the model */}
      <Trace d={`M ${c(L4[SINK], L4W)} 322 L ${c(L4[SINK], L4W)} 350`} color={t.alt} opacity={0.6} />

      <Banner
        x={200}
        y={350}
        w={400}
        h={50}
        kicker="WHAT THE MODEL IS ASKED"
        value="one path, not one repo"
        color={t.alt}
        valueSize={14}
      />

      {/* Re-plan arc — the agent widening its own search */}
      <path d="M 740 292 C 776 292 776 158 740 158" stroke={t.alt} strokeWidth="1" fill="none" strokeDasharray="3 4" opacity="0.4" />
      <text x={756} y={228} textAnchor="middle" fontFamily={MONO} fontSize="6.5" fill={t.alt} opacity="0.7" transform="rotate(90 756 228)">
        re-plan
      </text>

      <Packet path="ca-root" color={t.hue} glow={GLOW} dur={1.2} begin={0} />
      <Packet path="ca-sink" color={t.hue} glow={GLOW} dur={0.9} begin={1.4} />
      <Packet path="ca-sink" color={t.hue} glow={GLOW} dur={0.9} begin={2.2} />
      <Packet path="ca-replan" color={t.alt} glow={GLOW} dur={2} begin={2.6} r={3} />
    </CoverFrame>
  );
}

/* ═══════════════════════════════════════════════════════════
   5. SwaggerParserAgent — STAIRCASE
   Silhouette: diagonal band, top-left to bottom-right.
   ═══════════════════════════════════════════════════════════ */
function SwaggerParserAgentCover() {
  const t = COVER_THEME.SwaggerParserAgent;
  const GLOW = "sp-glow";
  const SW = 150;
  const SH = 54;

  /* [x, y, kicker, name, sub] — each step unlocks the next */
  const STEPS = [
    [26, 34, "OPENAPI SPEC", "400–500 endpoints", "no ordering given"],
    [174, 100, "STEP 1", "POST /users", "→ userId"],
    [322, 166, "STEP 2", "POST /subscriptions", "→ subscriptionId"],
    [470, 232, "STEP 3", "PATCH /subscription", "change_option=end_of_term"],
    [618, 298, "UNLOCKED", "422 → 200", "workflow satisfied"],
  ] as const;

  const cy = (i: number) => STEPS[i][1] + SH / 2;

  return (
    <CoverFrame
      id="sp"
      theme={t}
      header="OPENAPI DEPENDENCY GRAPH · EXECUTION ORDER IS THE PRODUCT"
      footer="security · ai-infrastructure"
      defs={
        <>
          {STEPS.slice(0, -1).map(([x], i) => (
            <path
              key={i}
              id={`sp-s${i}`}
              d={`M ${x + SW} ${cy(i)} L ${STEPS[i + 1][0] + SW / 2} ${cy(i)} L ${STEPS[i + 1][0] + SW / 2} ${STEPS[i + 1][1]}`}
            />
          ))}
        </>
      }
    >
      {/* Risers */}
      {STEPS.slice(0, -1).map(([x], i) => (
        <Trace
          key={i}
          d={`M ${x + SW} ${cy(i)} L ${STEPS[i + 1][0] + SW / 2} ${cy(i)} L ${STEPS[i + 1][0] + SW / 2} ${STEPS[i + 1][1]}`}
          color={t.hue}
          opacity={0.38}
        />
      ))}

      {STEPS.map(([x, y, kicker, name, sub], i) => (
        <Node
          key={name}
          x={x}
          y={y}
          w={SW}
          h={SH}
          kicker={kicker}
          name={name}
          sub={sub}
          color={i === STEPS.length - 1 ? t.hue : i === 3 ? t.alt : t.hue}
          glow={GLOW}
          pulse={i * 0.25}
          nameSize={i === 3 ? 10.5 : 11.5}
          strong={i === 3}
        />
      ))}

      {/* Cycle guard — the back-edge that must not be walked twice */}
      <path
        d={`M 470 ${cy(3)} C 400 ${cy(3)} 400 ${cy(1)} 322 ${cy(1)}`}
        stroke={t.alt}
        strokeWidth="1"
        fill="none"
        strokeDasharray="3 4"
        opacity="0.35"
      />
      <Note x={396} y={186} color={t.alt}>
        cycle guard
      </Note>

      {/* The rejected approach, named */}
      <Banner
        x={26}
        y={366}
        w={352}
        h={48}
        kicker="REJECTED"
        value="more string matching"
        color={NEUTRAL}
        valueSize={12}
      />
      <Banner x={422} y={366} w={352} h={48} kicker="KEPT" value="deterministic first, AI at edges" color={t.hue} valueSize={11} />

      {STEPS.slice(0, -1).map((_, i) => (
        <Packet key={i} path={`sp-s${i}`} color={t.hue} glow={GLOW} dur={1.1} begin={i * 0.5} r={3.5} />
      ))}
    </CoverFrame>
  );
}

/* ═══════════════════════════════════════════════════════════
   6. obervabilityService — FUNNEL
   Silhouette: wide V collapsing into a solid wide ledger.
   ═══════════════════════════════════════════════════════════ */
function ObservabilityDashboardCover() {
  const t = COVER_THEME.obervabilityService;
  const GLOW = "od-glow";

  /* The three identity strategies are the actual finding of the post. */
  const AGENTS = [
    ["Claude", "BORROW"],
    ["Cursor", "TRUST"],
    ["Copilot", "INVENT"],
    ["Codex", "INVENT"],
    ["Gemini", "INVENT"],
    ["LangChain", "INVENT"],
  ] as const;
  const AW = 118;
  const AH = 50;
  const AY = 32;
  const agentX = (i: number) => 26 + i * (AW + 8);
  const agentCX = (i: number) => agentX(i) + AW / 2;

  const APEX_Y = 128;

  /* Reconstructed conversation — what the ledger is for */
  const ROWS = [
    ["msg_01H8…", "prompt", "borrowed id"],
    ["msg_01H8…", "tool_call", "same session"],
    ["msg_01H9…", "response", "ordered by seq"],
  ] as const;

  return (
    <CoverFrame
      id="od"
      theme={t}
      header="AI AGENT OBSERVABILITY · SIX SOURCES, ONE SPAN SHAPE"
      footer="ai-infrastructure · observability"
      defs={
        <>
          {AGENTS.map(([name], i) => (
            <path key={name} id={`od-${i}`} d={`M ${agentCX(i)} ${AY + AH} L 400 ${APEX_Y}`} />
          ))}
          <path id="od-spine" d="M 400 174 L 400 322" />
        </>
      }
    >
      {AGENTS.map(([name, strategy], i) => (
        <Node
          key={name}
          x={agentX(i)}
          y={AY}
          w={AW}
          h={AH}
          kicker={strategy}
          name={name}
          color={strategy === "TRUST" ? t.hue : strategy === "BORROW" ? t.alt : NEUTRAL}
          glow={GLOW}
          pulse={i * 0.2}
          nameSize={12}
        />
      ))}

      {/* True funnel — every source converges on one point. Trace color follows
          its source node so the three identity strategies stay legible. */}
      {AGENTS.map(([name, strategy], i) => (
        <Trace
          key={name}
          d={`M ${agentCX(i)} ${AY + AH} L 400 ${APEX_Y}`}
          color={strategy === "TRUST" ? t.hue : strategy === "BORROW" ? t.alt : NEUTRAL}
          opacity={0.3}
        />
      ))}
      <circle cx={400} cy={APEX_Y} r="4" fill={t.hue} filter={`url(#${GLOW})`} />

      <Node
        x={280}
        y={APEX_Y + 2}
        w={240}
        h={44}
        kicker="NORMALIZED"
        name="one span shape"
        color={t.hue}
        glow={GLOW}
        pulse={0}
        nameSize={13}
      />

      <Trace d="M 400 174 L 400 200" color={t.alt} />
      <Node x={300} y={200} w={200} h={42} kicker="QUEUE" name="Kafka" color={t.alt} glow={GLOW} pulse={0.3} nameSize={14} />
      <Note x={578} y={225} color={MUTED}>
        partitioned by tenant
      </Note>

      <Trace d="M 400 242 L 400 264" color={t.alt} />
      <Node x={310} y={264} w={180} h={42} kicker="ASYNC WRITERS" name="consumers" color={t.hue} glow={GLOW} pulse={0.6} nameSize={12} />
      <Note x={572} y={289} color={MUTED}>
        flush · 5s or 100 events
      </Note>

      <Trace d="M 400 306 L 400 322" color={t.hue} />

      {/* The ledger — solid, full width, the visual payoff */}
      <rect x={26} y={322} width={748} height={92} rx="5" fill={CANVAS} stroke={t.hue} strokeWidth="1.5" />
      <rect x={26} y={322} width={748} height={92} rx="5" fill={`${t.hue}0E`} />
      <text x={40} y={340} fontFamily={MONO} fontSize="7" fill={LABEL} letterSpacing="2.5">
        RECONSTRUCTED CONVERSATION · QUERY TIME
      </text>
      <line x1={26} y1={346} x2={774} y2={346} stroke={t.hue} strokeWidth="0.6" opacity="0.3" />
      {ROWS.map(([id, kind, note], i) => (
        <g key={id + kind}>
          {i % 2 === 1 && <rect x={27} y={346 + i * 22} width={746} height={22} fill={`${t.hue}08`} />}
          <text x={40} y={361 + i * 22} fontFamily={MONO} fontSize="8.5" fill={MUTED}>
            {id}
          </text>
          <text x={200} y={361 + i * 22} fontFamily={MONO} fontSize="8.5" fontWeight="700" fill={t.hue}>
            {kind}
          </text>
          <text x={360} y={361 + i * 22} fontFamily={MONO} fontSize="8" fill={t.alt} opacity="0.8">
            {note}
          </text>
          <text x={760} y={361 + i * 22} textAnchor="end" fontFamily={MONO} fontSize="8" fill={DIM}>
            append-only
          </text>
        </g>
      ))}

      {AGENTS.map((_, i) => (
        <Packet key={i} path={`od-${i}`} color={t.hue} glow={GLOW} dur={1.6} begin={i * 0.26} r={3.5} />
      ))}
      <Packet path="od-spine" color={t.alt} glow={GLOW} dur={2} begin={1.6} r={3.5} />
      <Packet path="od-spine" color={t.alt} glow={GLOW} dur={2} begin={2.6} r={3.5} />
    </CoverFrame>
  );
}

/* ═══════════════════════════════════════════════════════════
   7. AI-Blog — SPINE + RETURN ARC
   Silhouette: one horizontal row of five with a loop above.
   ═══════════════════════════════════════════════════════════ */
function AIPromptJourneyCover() {
  const t = COVER_THEME["AI-Blog"];
  const GLOW = "pj-glow";
  const NW = 140;
  const NH = 64;
  /* Spine sits high; the return arc occupies the space above it. */
  const NY = 148;
  const ARC_Y = 76;
  const nodeX = (i: number) => 26 + i * (NW + 12);
  const nodeCX = (i: number) => nodeX(i) + NW / 2;

  const STAGES = [
    ["SCOPE", "prompt", "narrow the space"],
    ["RETRIEVE", "top-N", "no reranker"],
    ["PLAN", "decompose", "steps up front"],
    ["ReAct", "step", "reason · act"],
    ["TOOL", "observe", "back into state"],
  ] as const;

  /* The real tuning surface: recursion caps differ per agent. */
  const CAPS = [
    ["MIDDLEWARE AGENT", "cap 8"],
    ["PATH RESOLVER", "cap 27"],
    ["DEEP LOOKUP", "cap ~100"],
  ] as const;

  return (
    <CoverFrame
      id="pj"
      theme={t}
      header="AGENT LOOPS · THE LIMIT IS THE HYPERPARAMETER"
      footer="ai-infrastructure"
      defs={
        <>
          {STAGES.slice(0, -1).map((_, i) => (
            <path key={i} id={`pj-s${i}`} d={`M ${nodeX(i) + NW} ${NY + NH / 2} L ${nodeX(i + 1)} ${NY + NH / 2}`} />
          ))}
          <path id="pj-loop" d={`M ${nodeCX(4)} ${NY} C ${nodeCX(4)} ${ARC_Y} ${nodeCX(3)} ${ARC_Y} ${nodeCX(3)} ${NY}`} />
        </>
      }
    >
      {/* Spine */}
      {STAGES.slice(0, -1).map((_, i) => (
        <Trace key={i} d={`M ${nodeX(i) + NW} ${NY + NH / 2} L ${nodeX(i + 1)} ${NY + NH / 2}`} color={t.hue} opacity={0.4} />
      ))}
      {STAGES.map(([kicker, name, sub], i) => (
        <Node
          key={name}
          x={nodeX(i)}
          y={NY}
          w={NW}
          h={NH}
          kicker={kicker}
          name={name}
          sub={sub}
          color={i >= 3 ? t.alt : t.hue}
          glow={GLOW}
          pulse={i * 0.25}
          nameSize={13}
        />
      ))}

      {/* The loop that has to be bounded */}
      <path
        d={`M ${nodeCX(4)} ${NY} C ${nodeCX(4)} ${ARC_Y} ${nodeCX(3)} ${ARC_Y} ${nodeCX(3)} ${NY}`}
        stroke={t.alt}
        strokeWidth="1.2"
        fill="none"
        strokeDasharray="4 4"
        opacity="0.55"
      />
      <Note x={(nodeCX(3) + nodeCX(4)) / 2} y={ARC_Y - 6} color={t.alt}>
        observe → re-act, unbounded by default
      </Note>

      {/* Per-agent caps */}
      {CAPS.map(([kicker, value], i) => (
        <Banner key={kicker} x={26 + i * 256} y={248} w={236} h={54} kicker={kicker} value={value} color={t.hue} valueSize={14} />
      ))}

      {/* The thing that went wrong and stayed wrong */}
      <rect x={26} y={324} width={748} height={56} rx="6" fill={`${t.alt}12`} stroke={`${t.alt}38`} strokeWidth="1" />
      <text x={400} y={344} textAnchor="middle" fontFamily={MONO} fontSize="7.5" fill={LABEL} letterSpacing="2.5">
        SUMMARIZE-ON-LIMIT FALLBACK
      </text>
      <text x={400} y={366} textAnchor="middle" fontFamily={MONO} fontSize="14" fontWeight="700" fill={t.alt}>
        present in 1 of 6 agents · the other 5 return empty
      </text>
      <Note x={400} y={404} color={MUTED}>
        BOUNDING THE LOOP IS HALF THE JOB · THE OTHER HALF IS WHAT HAPPENS AT THE CEILING
      </Note>

      {STAGES.slice(0, -1).map((_, i) => (
        <Packet key={i} path={`pj-s${i}`} color={t.hue} glow={GLOW} dur={0.9} begin={i * 0.45} r={3.5} />
      ))}
      <Packet path="pj-loop" color={t.alt} glow={GLOW} dur={1.6} begin={1.8} r={3.5} />
      <Packet path="pj-loop" color={t.alt} glow={GLOW} dur={1.6} begin={2.8} r={3.5} />
    </CoverFrame>
  );
}

/* ═══════════════════════════════════════════════════════════
   8. Database — BIPARTITE MAPPING
   Silhouette: two horizontal blocks, traces crossing between.
   Six engines carry six distinct hues because the grouping is
   the information — which engine each database actually runs on.
   ═══════════════════════════════════════════════════════════ */
function DatabaseTradeoffsCover() {
  const t = COVER_THEME.Database;
  const GLOW = "db-glow";

  const DB_W = 100;
  const DB_Y = 48;
  const DB_H = 62;
  const dbX = (i: number) => 26 + i * (DB_W + 8);
  const dbCX = (i: number) => dbX(i) + DB_W / 2;

  const EN_W = 116;
  const EN_Y = 196;
  const EN_H = 76;
  const enX = (i: number) => 27 + i * (EN_W + 10);
  const enCX = (i: number) => enX(i) + EN_W / 2;

  /* Bus row where a database's trace bends into its engine */
  const BUS_Y = 160;

  /* [name, use case, sacrifice, engine index] */
  const DBS = [
    ["MongoDB", "APP DATA", "trades joins", 0],
    ["PostgreSQL", "RELATIONAL", "trades scale-out", 0],
    ["Elasticsearch", "SEARCH", "trades freshness", 1],
    ["Redis", "CACHE", "trades durability", 2],
    ["Prometheus", "METRICS", "trades detail", 3],
    ["ClickHouse", "ANALYTICS", "trades updates", 4],
    ["Cassandra", "WRITES", "trades reads", 5],
  ] as const;

  /* [structure, mechanism, where the cost lands, color] */
  const ENGINES = [
    ["B-Tree", "sorted · balanced", "pays on write", "#A3E635"],
    ["Inverted Idx", "word → docs", "pays on merge", "#10B981"],
    ["Hash Slots", "16,384 · in-mem", "pays on durability", "#F43F5E"],
    ["Time Series", "scrape · compress", "pays on cardinality", "#F59E0B"],
    ["Column Store", "MergeTree · sparse", "pays on updates", "#22D3EE"],
    ["LSM-Tree", "memtable → SSTable", "pays on read", "#8B5CF6"],
  ] as const;

  const traceD = (dbIndex: number, engineIndex: number) =>
    `M ${dbCX(dbIndex)} ${DB_Y + DB_H} L ${dbCX(dbIndex)} ${BUS_Y} L ${enCX(engineIndex)} ${BUS_Y} L ${enCX(engineIndex)} ${EN_Y}`;

  return (
    <CoverFrame
      id="db"
      theme={t}
      header="SEVEN DATABASES · SIX STORAGE ENGINES · ONE COST EACH"
      footer="databases · distributed-systems"
      defs={
        <>
          {DBS.map(([name, , , engineIndex], i) => (
            <path key={name} id={`db-t${i}`} d={traceD(i, engineIndex)} />
          ))}
        </>
      }
    >
      {/* Row 1: what you pick */}
      {DBS.map(([name, useCase, sacrifice, engineIndex], i) => {
        const color = ENGINES[engineIndex][3];
        return (
          <g key={name}>
            <Node
              x={dbX(i)}
              y={DB_Y}
              w={DB_W}
              h={DB_H}
              kicker={useCase}
              name={name}
              sub={sacrifice}
              color={color}
              glow={GLOW}
              pulse={i * 0.22}
              nameSize={10.5}
            />
          </g>
        );
      })}

      {/* Traces: database → the engine it actually runs on */}
      {DBS.map(([name, , , engineIndex], i) => (
        <Trace key={name} d={traceD(i, engineIndex)} color={ENGINES[engineIndex][3]} />
      ))}
      {ENGINES.map(([structure, , , color], i) => (
        <rect key={structure} x={enCX(i) - 3} y={BUS_Y - 3} width={6} height={6} rx="1" fill={color} opacity="0.55" />
      ))}

      {/* Row 2: what you're actually choosing */}
      {ENGINES.map(([structure, mechanism, cost, color], i) => (
        <g key={structure}>
          <rect x={enX(i)} y={EN_Y} width={EN_W} height={EN_H} rx="5" fill={CANVAS} stroke={color} strokeWidth="1.5" />
          <rect x={enX(i)} y={EN_Y} width={EN_W} height={EN_H} rx="5" fill={`${color}14`} />
          <text x={enCX(i)} y={212} textAnchor="middle" fontFamily={MONO} fontSize="6.5" fill={LABEL} letterSpacing="2">
            ENGINE
          </text>
          <text x={enCX(i)} y={234} textAnchor="middle" fontFamily={MONO} fontSize="11.5" fontWeight="700" fill={color}>
            {structure}
          </text>
          <text x={enCX(i)} y={250} textAnchor="middle" fontFamily={MONO} fontSize="6.5" fill={MUTED}>
            {mechanism}
          </text>
          <text x={enCX(i)} y={264} textAnchor="middle" fontFamily={MONO} fontSize="7" fill={color} opacity="0.7">
            {cost}
          </text>
        </g>
      ))}

      {/* DynamoDB rides the same engine as Cassandra */}
      <text x={enCX(5)} y={286} textAnchor="middle" fontFamily={MONO} fontSize="7" fill={DIM}>
        + DynamoDB
      </text>

      <Note x={400} y={306} color={MUTED}>
        EVERY ENGINE PAYS SOMEWHERE — AT WRITE TIME, AT READ TIME, OR IN HOW BYTES SIT ON DISK
      </Note>

      <Banner x={26} y={352} w={190} h={54} kicker="THE THREE COSTS" value="write · read · layout" color={t.alt} valueSize={10.5} />
      <Banner
        x={232}
        y={352}
        w={336}
        h={54}
        kicker="THE ACTUAL QUESTION"
        value="what is it refusing to be good at"
        color={t.hue}
        valueSize={11.5}
      />
      <Banner x={584} y={352} w={190} h={54} kicker="FAILURE MODES" value="hot keys · cardinality" color="#F59E0B" valueSize={10.5} />

      {DBS.map(([name, , , engineIndex], i) => (
        <Packet key={name} path={`db-t${i}`} color={ENGINES[engineIndex][3]} glow={GLOW} dur={1.6} begin={i * 0.35} />
      ))}
    </CoverFrame>
  );
}

/* ═══════════════════════════════════════════════════════════
   Fallback — tag-derived, for posts with no bespoke cover.
   ═══════════════════════════════════════════════════════════ */
function GenericCover({ tags }: { tags: string[] }) {
  const primary = tags[0] ?? "distributed-systems";
  /* Reuses the taxonomy in lib/researchAreas.ts rather than keeping a
     second copy of the tag→hex map. */
  const color = getTagHex(primary);
  const theme: CoverTheme = { hue: color, alt: color, texture: "dots", wash: 0.12 };

  return (
    <CoverFrame id="gen" theme={theme} header="ARYAN KHANDELWAL · ENGINEERING NOTES" footer={tags.join(" · ")}>
      <text x="400" y="248" textAnchor="middle" fontFamily={MONO} fontSize="48" fontWeight="700" fill={color} opacity="0.12">
        {primary.toUpperCase()}
      </text>
      <circle cx="400" cy="228" r="62" fill="none" stroke={color} strokeWidth="1" opacity="0.16" />
      <circle cx="400" cy="228" r="42" fill="none" stroke={color} strokeWidth="1" opacity="0.11" />
      <circle
        cx="400"
        cy="228"
        r="20"
        fill={`${color}22`}
        stroke={color}
        strokeWidth="1.5"
        opacity="0.55"
        style={{ animation: "bca-pulse 2.5s ease-in-out infinite" }}
      />
      <text x="400" y="340" textAnchor="middle" fontFamily={MONO} fontSize="11" fill={color} opacity="0.7" letterSpacing="3">
        {primary.replace(/-/g, " ").toUpperCase()}
      </text>
    </CoverFrame>
  );
}

/* ── Public API ─────────────────────────────────────────── */

interface BlogCoverArtProps {
  slug: string;
  tags: string[];
  className?: string;
}

/* Keys are post slugs — filename minus extension, per lib/mdx.ts. The two
   misspellings are load-bearing: they're the real filenames, so the real URLs. */
const SLUG_MAP: Record<string, React.FC> = {
  boostingTesting: BoostingTestingCover,
  kafka: KafkaLogCover,
  redTeamingOchestrator: RedTeamOrchestratorCover,
  CodeAnalysisAgent: CodeAnalysisAgentCover,
  SwaggerParserAgent: SwaggerParserAgentCover,
  obervabilityService: ObservabilityDashboardCover,
  "AI-Blog": AIPromptJourneyCover,
  Database: DatabaseTradeoffsCover,
};

export default function BlogCoverArt({ slug, tags, className = "" }: BlogCoverArtProps) {
  const Cover = SLUG_MAP[slug];
  if (Cover)
    return (
      <div className={`w-full h-full ${className}`}>
        <Cover />
      </div>
    );
  return (
    <div className={`w-full h-full ${className}`}>
      <GenericCover tags={tags} />
    </div>
  );
}
