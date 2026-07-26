"use client";

/* ──────────────────────────────────────────────────────────
   Inline animated SVG cover art — renders live in browser.
   Used when a blog post has no static cover image.
   ────────────────────────────────────────────────────────── */

const STYLE = `
  @keyframes bca-pulse { 0%,100%{opacity:1} 50%{opacity:0.35} }
  @keyframes bca-glow  { 0%,100%{opacity:0.6} 50%{opacity:1} }
  @keyframes bca-newseg { 0%,75%{fill:rgba(59,130,246,0.07)} 88%{fill:rgba(59,130,246,0.22)} 100%{fill:rgba(59,130,246,0.07)} }
  @keyframes bca-isrsync { 0%{opacity:0.25} 50%{opacity:0.85} 100%{opacity:0.25} }
`;

/* ── BoostingTesting: parallel consumer flow ───────────── */
function BoostingTestingCover() {
  return (
    <svg
      viewBox="0 0 800 450"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <style>{STYLE}</style>
        <pattern id="bt-dots" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="12" cy="12" r="0.7" fill="rgba(255,255,255,0.045)" />
        </pattern>
        <filter id="bt-gb">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="bt-gp">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="bt-gg">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <radialGradient id="bt-bg" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
        </radialGradient>
        {/* Motion paths */}
        <path id="bt-g0" d="M 400 88 L 400 112 L 160 112 L 160 148" />
        <path id="bt-g1" d="M 400 88 L 400 148" />
        <path id="bt-g2" d="M 400 88 L 400 112 L 640 112 L 640 148" />
        <path id="bt-p0" d="M 160 204 L 160 288" />
        <path id="bt-p1" d="M 400 204 L 400 288" />
        <path id="bt-p2" d="M 640 204 L 640 288" />
      </defs>

      {/* Background */}
      <rect width="800" height="450" fill="#0F1117" />
      <rect width="800" height="450" fill="url(#bt-dots)" />
      <ellipse cx="400" cy="220" rx="380" ry="210" fill="url(#bt-bg)" />

      {/* Header */}
      <text x="400" y="22" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="8.5" fill="#334155" letterSpacing="3">
        SYSTEM IMPROVEMENT STUDY · KAFKA CONSUMER RE-ARCHITECTURE
      </text>

      {/* ── LOAD GENERATOR ── */}
      <rect x="300" y="36" width="200" height="52" rx="5" fill="#0F1117" stroke="#3B82F6" strokeWidth="1.5" />
      <rect x="300" y="36" width="200" height="52" rx="5" fill="rgba(59,130,246,0.07)" />
      <text x="400" y="54" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="8" fill="#475569" letterSpacing="2.5">LOAD GENERATOR</text>
      <text x="400" y="74" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="14" fontWeight="700" fill="#3B82F6">k6 · JMeter</text>
      <circle cx="491" cy="44" r="3.5" fill="#3B82F6" style={{ animation: "bca-pulse 1.4s ease-in-out infinite" }} filter="url(#bt-gb)" />

      {/* Traces: generator → bus → partitions */}
      <path d="M 400 88 L 400 112" stroke="#8B5CF6" strokeWidth="1.5" fill="none" strokeDasharray="4 3" opacity="0.35" />
      <path d="M 160 112 L 640 112" stroke="#8B5CF6" strokeWidth="1" fill="none" opacity="0.18" />
      <path d="M 160 112 L 160 148" stroke="#8B5CF6" strokeWidth="1.5" fill="none" strokeDasharray="4 3" opacity="0.35" />
      <path d="M 400 112 L 400 148" stroke="#8B5CF6" strokeWidth="1.5" fill="none" strokeDasharray="4 3" opacity="0.35" />
      <path d="M 640 112 L 640 148" stroke="#8B5CF6" strokeWidth="1.5" fill="none" strokeDasharray="4 3" opacity="0.35" />
      {/* Junction squares */}
      {[160, 400, 640].map((cx) => (
        <rect key={cx} x={cx - 3} y={109} width={6} height={6} rx="1" fill="#8B5CF6" opacity="0.55" />
      ))}

      {/* ── PARTITIONS ── */}
      {([["P0", 70, 160, "0s"], ["P1", 310, 400, "0.3s"], ["P2", 550, 640, "0.6s"]] as const).map(
        ([id, x, cx, delay]) => (
          <g key={id}>
            <rect x={x} y={148} width={180} height={56} rx="5" fill="#0F1117" stroke="#8B5CF6" strokeWidth="1.5" />
            <rect x={x} y={148} width={180} height={56} rx="5" fill="rgba(139,92,246,0.08)" />
            <text x={cx} y={166} textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="8" fill="#64748B" letterSpacing="2.5">KAFKA PARTITION</text>
            <text x={cx} y={186} textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="16" fontWeight="700" fill="#8B5CF6">{id}</text>
            <circle cx={x + 170} cy={156} r="3" fill="#8B5CF6" style={{ animation: `bca-pulse 2s ease-in-out infinite`, animationDelay: delay }} filter="url(#bt-gp)" />
          </g>
        )
      )}

      {/* Traces: partitions → consumers */}
      {[160, 400, 640].map((cx) => (
        <path key={cx} d={`M ${cx} 204 L ${cx} 288`} stroke="#10B981" strokeWidth="1.5" fill="none" strokeDasharray="4 3" opacity="0.35" />
      ))}

      {/* ── CONSUMERS ── */}
      {([["C0", 70, 160, "0.1s"], ["C1", 310, 400, "0.5s"], ["C2", 550, 640, "0.9s"]] as const).map(
        ([id, x, cx, delay]) => (
          <g key={id}>
            <rect x={x} y={288} width={180} height={56} rx="5" fill="#0F1117" stroke="#10B981" strokeWidth="1.5" />
            <rect x={x} y={288} width={180} height={56} rx="5" fill="rgba(16,185,129,0.08)" />
            <text x={cx} y={306} textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="8" fill="#64748B" letterSpacing="2.5">CONSUMER</text>
            <text x={cx} y={326} textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="16" fontWeight="700" fill="#10B981">{id}</text>
            <circle cx={x + 170} cy={296} r="3" fill="#10B981" style={{ animation: `bca-pulse 1.8s ease-in-out infinite`, animationDelay: delay }} filter="url(#bt-gg)" />
          </g>
        )
      )}

      {/* ── ANIMATED DATA PACKETS ── */}
      {/* gen → partitions */}
      {(["bt-g0", "bt-g1", "bt-g2"] as const).map((pid, i) => (
        <circle key={pid} r="4" fill="#3B82F6" filter="url(#bt-gb)">
          <animateMotion dur="1.8s" repeatCount="indefinite" begin={`${i * 0.45}s`} calcMode="linear">
            <mpath href={`#${pid}`} />
          </animateMotion>
        </circle>
      ))}
      {/* partitions → consumers */}
      {(["bt-p0", "bt-p1", "bt-p2"] as const).map((pid, i) => (
        <circle key={pid} r="4" fill="#8B5CF6" filter="url(#bt-gp)">
          <animateMotion dur="1.4s" repeatCount="indefinite" begin={`${1.0 + i * 0.5}s`} calcMode="linear">
            <mpath href={`#${pid}`} />
          </animateMotion>
        </circle>
      ))}

      {/* ── RESULT METRIC ── */}
      <rect x="215" y="366" width="370" height="50" rx="6" fill="rgba(59,130,246,0.07)" stroke="rgba(59,130,246,0.2)" strokeWidth="1" />
      <text x="400" y="383" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="8" fill="#475569" letterSpacing="3">RESULT</text>
      <text x="400" y="404" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="15" fontWeight="700" fill="#3B82F6">1 hour → 36 seconds · 100× throughput</text>

      {/* Corner annotations */}
      <text x="18" y="444" fontFamily="'Courier New',monospace" fontSize="7.5" fill="#1E293B">aryan.dev</text>
      <text x="782" y="444" textAnchor="end" fontFamily="'Courier New',monospace" fontSize="7.5" fill="#1E293B">distributed-systems · observability</text>
    </svg>
  );
}

/* ── Kafka Internals: commit log architecture ──────────── */
function KafkaLogCover() {
  const segs = ["S0", "S1", "S2", "S3", "S4"];
  const SW = 82;
  const SH = 64;
  const SY = 168;
  const SX0 = 152;
  const GAP = 8;
  const segCX = (i: number) => SX0 + i * (SW + GAP) + SW / 2;
  const segX = (i: number) => SX0 + i * (SW + GAP);

  return (
    <svg
      viewBox="0 0 800 450"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <style>{STYLE}</style>
        <pattern id="kl-dots" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="12" cy="12" r="0.7" fill="rgba(255,255,255,0.045)" />
        </pattern>
        <filter id="kl-gb">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="kl-gg">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="kl-gp">
          <feGaussianBlur stdDeviation="2.5" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <radialGradient id="kl-bg" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.04" />
          <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
        </radialGradient>
        {/* Motion paths */}
        <path id="kl-prod" d="M 128 200 L 152 200" />
        <path id="kl-cons" d="M 584 200 L 630 200" />
        <path id="kl-isr0" d="M 193 232 L 240 318" />
        <path id="kl-isr1" d="M 357 232 L 390 318" />
        <path id="kl-isr2" d="M 561 232 L 530 318" />
      </defs>

      {/* Background */}
      <rect width="800" height="450" fill="#0F1117" />
      <rect width="800" height="450" fill="url(#kl-dots)" />
      <ellipse cx="400" cy="220" rx="370" ry="200" fill="url(#kl-bg)" />

      {/* Header */}
      <text x="400" y="22" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="8.5" fill="#334155" letterSpacing="3">
        KAFKA INTERNALS · COMMIT LOG ARCHITECTURE
      </text>

      {/* Log label */}
      <text x="400" y="152" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="9" fill="#475569" letterSpacing="2">
        PARTITION 0 · APPEND-ONLY COMMIT LOG
      </text>

      {/* ── LOG SEGMENTS ── */}
      {segs.map((seg, i) => {
        const isLast = i === segs.length - 1;
        const x = segX(i);
        const cx = segCX(i);
        return (
          <g key={seg}>
            <rect
              x={x} y={SY} width={SW} height={SH} rx="4"
              fill={isLast ? "rgba(59,130,246,0.1)" : "rgba(26,29,39,0.95)"}
              stroke={isLast ? "#3B82F6" : "#8B5CF6"}
              strokeWidth={isLast ? 1.5 : 1}
              style={isLast ? { animation: "bca-newseg 3s ease-in-out infinite" } : undefined}
            />
            <text x={cx} y={SY + 20} textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="7.5" fill="#475569" letterSpacing="1">SEGMENT</text>
            <text x={cx} y={SY + 43} textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="18" fontWeight="700" fill={isLast ? "#3B82F6" : "#8B5CF6"}>{seg}</text>
            <text x={cx} y={SY + SH + 14} textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="7" fill="#1E3A5F">
              off {i * 100}+
            </text>
          </g>
        );
      })}

      {/* → new indicator */}
      <text
        x={segX(segs.length) + 4} y={SY + SH / 2 + 6}
        fontFamily="'Courier New',monospace" fontSize="14" fill="#3B82F6"
        style={{ animation: "bca-pulse 1.5s ease-in-out infinite" }}
      >→</text>

      {/* ── PRODUCER ── */}
      <rect x="18" y="184" width="110" height="48" rx="5" fill="#0F1117" stroke="#3B82F6" strokeWidth="1.5" />
      <rect x="18" y="184" width="110" height="48" rx="5" fill="rgba(59,130,246,0.07)" />
      <text x="73" y="203" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="8" fill="#475569" letterSpacing="1.5">PRODUCER</text>
      <text x="73" y="222" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="13" fontWeight="600" fill="#3B82F6">write</text>
      <circle cx="120" cy="192" r="3" fill="#3B82F6" style={{ animation: "bca-pulse 1.2s ease-in-out infinite" }} filter="url(#kl-gb)" />
      <path d="M 128 208 L 152 208" stroke="#3B82F6" strokeWidth="1" fill="none" strokeDasharray="3 2" opacity="0.35" />

      {/* ── CONSUMER ── */}
      <rect x="648" y="184" width="110" height="48" rx="5" fill="#0F1117" stroke="#10B981" strokeWidth="1.5" />
      <rect x="648" y="184" width="110" height="48" rx="5" fill="rgba(16,185,129,0.07)" />
      <text x="703" y="203" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="8" fill="#475569" letterSpacing="1.5">CONSUMER</text>
      <text x="703" y="222" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="13" fontWeight="600" fill="#10B981">read</text>
      <circle cx="658" cy="192" r="3" fill="#10B981" style={{ animation: "bca-pulse 1.8s ease-in-out infinite" }} filter="url(#kl-gg)" />
      <path d="M 584 208 L 648 208" stroke="#10B981" strokeWidth="1" fill="none" strokeDasharray="3 2" opacity="0.35" />

      {/* Animated data packets */}
      {[0, 0.55].map((delay) => (
        <circle key={delay} r="4" fill="#3B82F6" filter="url(#kl-gb)">
          <animateMotion dur="1.1s" repeatCount="indefinite" begin={`${delay}s`} calcMode="linear">
            <mpath href="#kl-prod" />
          </animateMotion>
        </circle>
      ))}
      {[0.25, 0.9].map((delay) => (
        <circle key={delay} r="4" fill="#10B981" filter="url(#kl-gg)">
          <animateMotion dur="1.2s" repeatCount="indefinite" begin={`${delay}s`} calcMode="linear">
            <mpath href="#kl-cons" />
          </animateMotion>
        </circle>
      ))}

      {/* ── ISR REPLICAS ── */}
      <text x="400" y="308" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="8" fill="#334155" letterSpacing="2">
        IN-SYNC REPLICAS (ISR)
      </text>

      {(
        [
          ["LEADER", 180, 240, "#3B82F6"],
          ["FOLLOWER A", 330, 390, "#8B5CF6"],
          ["FOLLOWER B", 470, 530, "#8B5CF6"],
        ] as const
      ).map(([label, x, cx, color]) => (
        <g key={label}>
          <rect x={x} y={318} width={120} height={44} rx="4" fill="#0F1117" stroke={color} strokeWidth="1" />
          <rect x={x} y={318} width={120} height={44} rx="4" fill={`${color}10`} />
          <text x={cx} y={335} textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="7.5" fill="#475569" letterSpacing="1.5">{label}</text>
          <circle cx={cx} cy={350} r="5.5" fill="none" stroke={color} strokeWidth="1.5" style={{ animation: "bca-isrsync 2.2s ease-in-out infinite" }} filter="url(#kl-gp)" />
          <circle cx={cx} cy={350} r="2.5" fill={color} style={{ animation: "bca-isrsync 2.2s ease-in-out infinite" }} />
        </g>
      ))}

      {/* ISR sync lines + packets */}
      {(
        [
          ["kl-isr0", "#3B82F6", "M 193 232 L 240 318"],
          ["kl-isr1", "#8B5CF6", "M 357 232 L 390 318"],
          ["kl-isr2", "#8B5CF6", "M 561 232 L 530 318"],
        ] as const
      ).map(([pid, color, d], i) => (
        <g key={pid}>
          <path d={d} stroke={color} strokeWidth="1" strokeDasharray="3 3" opacity="0.22" fill="none" />
          <circle r="3" fill={color} filter="url(#kl-gp)">
            <animateMotion dur="1.6s" repeatCount="indefinite" begin={`${i * 0.55}s`} calcMode="linear">
              <mpath href={`#${pid}`} />
            </animateMotion>
          </circle>
        </g>
      ))}

      {/* Corner annotations */}
      <text x="18" y="444" fontFamily="'Courier New',monospace" fontSize="7.5" fill="#1E293B">aryan.dev</text>
      <text x="782" y="444" textAnchor="end" fontFamily="'Courier New',monospace" fontSize="7.5" fill="#1E293B">distributed-systems · databases</text>
    </svg>
  );
}

/* ── Red Team Orchestrator: multi-agent attack pipeline ── */
function RedTeamOrchestratorCover() {
  return (
    <svg
      viewBox="0 0 800 450"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <style>{STYLE}</style>
        <pattern id="rt-dots" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="12" cy="12" r="0.7" fill="rgba(255,255,255,0.045)" />
        </pattern>
        <filter id="rt-gr">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="rt-gp">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="rt-gg">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <radialGradient id="rt-bg" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="#EF4444" stopOpacity="0.04" />
          <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
        </radialGradient>
        {/* Motion paths (invisible, referenced by animateMotion) */}
        <path id="rt-p1" d="M 158 90 L 185 90" />
        <path id="rt-p2" d="M 315 90 L 345 90" />
        <path id="rt-p3" d="M 475 90 L 590 90" />
        <path id="rt-p4" d="M 675 140 L 675 192 L 610 192 L 610 235" />
        <path id="rt-p5" d="M 545 265 L 505 265" />
        <path id="rt-p6" d="M 375 265 L 335 265" />
        <path id="rt-p7" d="M 270 295 L 270 355" />
      </defs>

      {/* Background */}
      <rect width="800" height="450" fill="#0F1117" />
      <rect width="800" height="450" fill="url(#rt-dots)" />
      <ellipse cx="420" cy="200" rx="380" ry="200" fill="url(#rt-bg)" />

      {/* Header */}
      <text x="400" y="22" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="8.5" fill="#334155" letterSpacing="3">
        RED TEAM ORCHESTRATOR · AI AGENT SECURITY TESTING
      </text>

      {/* ── ROW 1: Attack pipeline (left → right) ── */}

      {/* ORCHESTRATOR */}
      <rect x="18" y="58" width="140" height="64" rx="5" fill="#0F1117" stroke="#EF4444" strokeWidth="1.5" />
      <rect x="18" y="58" width="140" height="64" rx="5" fill="rgba(239,68,68,0.08)" />
      <text x="88" y="76" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="7" fill="#475569" letterSpacing="2">ORCHESTRATOR</text>
      <text x="88" y="98" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="13" fontWeight="700" fill="#EF4444">Red Team</text>
      <circle cx="149" cy="67" r="3.5" fill="#EF4444" style={{ animation: "bca-pulse 1.2s ease-in-out infinite" }} filter="url(#rt-gr)" />

      {/* Trace: orch → a&e */}
      <path d="M 158 90 L 185 90" stroke="#8B5CF6" strokeWidth="1.5" fill="none" strokeDasharray="4 3" opacity="0.4" />

      {/* ANALYSE & ENHANCE */}
      <rect x="185" y="58" width="130" height="64" rx="5" fill="#0F1117" stroke="#8B5CF6" strokeWidth="1.5" />
      <rect x="185" y="58" width="130" height="64" rx="5" fill="rgba(139,92,246,0.08)" />
      <text x="250" y="76" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="6.5" fill="#475569" letterSpacing="1.5">ANALYSE + ENHANCE</text>
      <text x="250" y="98" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="12" fontWeight="700" fill="#8B5CF6">A&E Agent</text>
      <circle cx="306" cy="67" r="3" fill="#8B5CF6" style={{ animation: "bca-pulse 1.6s ease-in-out infinite", animationDelay: "0.3s" }} filter="url(#rt-gp)" />

      {/* Trace: a&e → req builder */}
      <path d="M 315 90 L 345 90" stroke="#3B82F6" strokeWidth="1.5" fill="none" strokeDasharray="4 3" opacity="0.4" />

      {/* REQUEST BUILDER */}
      <rect x="345" y="58" width="130" height="64" rx="5" fill="#0F1117" stroke="#3B82F6" strokeWidth="1.5" />
      <rect x="345" y="58" width="130" height="64" rx="5" fill="rgba(59,130,246,0.08)" />
      <text x="410" y="76" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="6.5" fill="#475569" letterSpacing="1.5">REQUEST BUILDER</text>
      <text x="410" y="98" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="12" fontWeight="700" fill="#3B82F6">Req Builder</text>
      <circle cx="466" cy="67" r="3" fill="#3B82F6" style={{ animation: "bca-pulse 1.4s ease-in-out infinite", animationDelay: "0.6s" }} filter="url(#rt-gg)" />

      {/* Attack trace: req → target */}
      <path d="M 475 90 L 590 90" stroke="#EF4444" strokeWidth="1.5" fill="none" strokeDasharray="4 3" opacity="0.5" />

      {/* TARGET AI AGENT (prominent, with scan rings) */}
      <circle cx="675" cy="90" r="68" fill="none" stroke="#EF4444" strokeWidth="0.7" opacity="0.1" style={{ animation: "bca-pulse 2.4s ease-in-out infinite" }} />
      <circle cx="675" cy="90" r="85" fill="none" stroke="#EF4444" strokeWidth="0.5" opacity="0.06" style={{ animation: "bca-pulse 2.4s ease-in-out infinite", animationDelay: "0.7s" }} />
      <rect x="590" y="40" width="170" height="100" rx="5" fill="#0F1117" stroke="#EF4444" strokeWidth="2" />
      <rect x="590" y="40" width="170" height="100" rx="5" fill="rgba(239,68,68,0.07)" />
      <text x="675" y="64" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="7.5" fill="#475569" letterSpacing="2">TARGET</text>
      <text x="675" y="86" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="13" fontWeight="700" fill="#EF4444">AI Agent</text>
      <text x="675" y="106" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="8" fill="#64748B">/ MCP Server</text>

      {/* L-shaped trace: target bottom → bend → parser top */}
      <path d="M 675 140 L 675 192 L 610 192 L 610 235" stroke="#8B5CF6" strokeWidth="1.5" fill="none" strokeDasharray="4 3" opacity="0.4" />
      {/* Junction dots at L-bend */}
      <rect x="672" y="189" width="6" height="6" rx="1" fill="#8B5CF6" opacity="0.5" />
      <rect x="607" y="189" width="6" height="6" rx="1" fill="#8B5CF6" opacity="0.5" />
      <text x="700" y="170" fontFamily="'Courier New',monospace" fontSize="7" fill="#334155">response</text>

      {/* ── ROW 2: Analysis pipeline (right → left) ── */}

      {/* RESPONSE PARSER */}
      <rect x="545" y="235" width="130" height="60" rx="5" fill="#0F1117" stroke="#8B5CF6" strokeWidth="1.5" />
      <rect x="545" y="235" width="130" height="60" rx="5" fill="rgba(139,92,246,0.08)" />
      <text x="610" y="253" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="6.5" fill="#475569" letterSpacing="1.5">RESP PARSER</text>
      <text x="610" y="275" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="12" fontWeight="700" fill="#8B5CF6">Parser</text>

      {/* Trace: parser → validation */}
      <path d="M 545 265 L 505 265" stroke="#10B981" strokeWidth="1.5" fill="none" strokeDasharray="4 3" opacity="0.4" />

      {/* VALIDATION AGENT */}
      <rect x="375" y="235" width="130" height="60" rx="5" fill="#0F1117" stroke="#10B981" strokeWidth="1.5" />
      <rect x="375" y="235" width="130" height="60" rx="5" fill="rgba(16,185,129,0.08)" />
      <text x="440" y="253" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="6.5" fill="#475569" letterSpacing="1.5">VALIDATION</text>
      <text x="440" y="275" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="12" fontWeight="700" fill="#10B981">Validator</text>
      <circle cx="496" cy="244" r="3" fill="#10B981" style={{ animation: "bca-pulse 1.8s ease-in-out infinite" }} filter="url(#rt-gg)" />

      {/* Trace: validation → remediation */}
      <path d="M 375 265 L 335 265" stroke="#10B981" strokeWidth="1.5" fill="none" strokeDasharray="4 3" opacity="0.4" />

      {/* REMEDIATION AGENT */}
      <rect x="205" y="235" width="130" height="60" rx="5" fill="#0F1117" stroke="#10B981" strokeWidth="1.5" />
      <rect x="205" y="235" width="130" height="60" rx="5" fill="rgba(16,185,129,0.08)" />
      <text x="270" y="253" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="6.5" fill="#475569" letterSpacing="1.5">REMEDIATION</text>
      <text x="270" y="275" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="12" fontWeight="700" fill="#10B981">Remediate</text>

      {/* Trace: remediation → dashboard */}
      <path d="M 270 295 L 270 355" stroke="#3B82F6" strokeWidth="1.5" fill="none" strokeDasharray="4 3" opacity="0.35" />

      {/* Feedback loop: validation top → curve up → orchestrator bottom */}
      <path d="M 440 235 Q 264 148 88 122" stroke="#EF4444" strokeWidth="1" fill="none" strokeDasharray="3 4" opacity="0.2" />
      <text x="244" y="170" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="7" fill="#334155" letterSpacing="1">next turn</text>

      {/* ── BOTTOM ROW ── */}

      {/* Budget guard badge */}
      <rect x="18" y="355" width="148" height="52" rx="5" fill="rgba(239,68,68,0.06)" stroke="rgba(239,68,68,0.18)" strokeWidth="1" />
      <text x="92" y="374" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="7" fill="#475569" letterSpacing="2">BUDGET GUARD</text>
      <text x="92" y="395" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="11" fontWeight="700" fill="#EF4444">per-run mutex</text>

      {/* Dashboard */}
      <rect x="188" y="355" width="162" height="52" rx="5" fill="#0F1117" stroke="#3B82F6" strokeWidth="1" />
      <rect x="188" y="355" width="162" height="52" rx="5" fill="rgba(59,130,246,0.06)" />
      <text x="269" y="374" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="7" fill="#475569" letterSpacing="2">DASHBOARD</text>
      <text x="269" y="395" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="12" fontWeight="600" fill="#3B82F6">Findings</text>

      {/* Confidence badge */}
      <rect x="530" y="355" width="240" height="52" rx="5" fill="rgba(16,185,129,0.06)" stroke="rgba(16,185,129,0.18)" strokeWidth="1" />
      <text x="650" y="374" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="7" fill="#475569" letterSpacing="2">HIGH CONFIDENCE ONLY</text>
      <text x="650" y="395" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="12" fontWeight="700" fill="#10B981">multi-turn · adaptive</text>

      {/* ── ANIMATED DATA PACKETS ── */}
      <circle r="3.5" fill="#EF4444" filter="url(#rt-gr)">
        <animateMotion dur="0.8s" repeatCount="indefinite" begin="0s" calcMode="linear"><mpath href="#rt-p1" /></animateMotion>
      </circle>
      <circle r="3.5" fill="#8B5CF6" filter="url(#rt-gp)">
        <animateMotion dur="0.8s" repeatCount="indefinite" begin="0.4s" calcMode="linear"><mpath href="#rt-p2" /></animateMotion>
      </circle>
      <circle r="3.5" fill="#3B82F6" filter="url(#rt-gg)">
        <animateMotion dur="1.6s" repeatCount="indefinite" begin="0.8s" calcMode="linear"><mpath href="#rt-p3" /></animateMotion>
      </circle>
      {[0, 0.7].map((delay) => (
        <circle key={delay} r="3.5" fill="#EF4444" filter="url(#rt-gr)">
          <animateMotion dur="1.6s" repeatCount="indefinite" begin={`${1.2 + delay}s`} calcMode="linear"><mpath href="#rt-p4" /></animateMotion>
        </circle>
      ))}
      <circle r="3.5" fill="#8B5CF6" filter="url(#rt-gp)">
        <animateMotion dur="0.7s" repeatCount="indefinite" begin="1.8s" calcMode="linear"><mpath href="#rt-p5" /></animateMotion>
      </circle>
      <circle r="3.5" fill="#10B981" filter="url(#rt-gg)">
        <animateMotion dur="0.7s" repeatCount="indefinite" begin="2.2s" calcMode="linear"><mpath href="#rt-p6" /></animateMotion>
      </circle>
      <circle r="3" fill="#3B82F6" filter="url(#rt-gg)">
        <animateMotion dur="1.0s" repeatCount="indefinite" begin="2.6s" calcMode="linear"><mpath href="#rt-p7" /></animateMotion>
      </circle>

      {/* Corner annotations */}
      <text x="18" y="444" fontFamily="'Courier New',monospace" fontSize="7.5" fill="#1E293B">aryan.dev</text>
      <text x="782" y="444" textAnchor="end" fontFamily="'Courier New',monospace" fontSize="7.5" fill="#1E293B">security · ai-infrastructure</text>
    </svg>
  );
}

/* ── Code Analysis Agent: hybrid static+semantic+LLM ──── */
function CodeAnalysisAgentCover() {
  return (
    <svg
      viewBox="0 0 800 450"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <style>{STYLE}</style>
        <pattern id="ca-dots" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="12" cy="12" r="0.7" fill="rgba(255,255,255,0.045)" />
        </pattern>
        <filter id="ca-gb">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="ca-gp">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="ca-gg">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <radialGradient id="ca-bg" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.04" />
          <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
        </radialGradient>
        {/* Motion paths */}
        <path id="ca-p1" d="M 125 120 L 270 170" />
        <path id="ca-p2" d="M 400 120 L 400 170" />
        <path id="ca-p3" d="M 675 120 L 530 170" />
        <path id="ca-p4" d="M 400 245 L 400 280" />
        <path id="ca-loop" d="M 575 312 C 680 312 680 207 610 207" />
      </defs>

      {/* Background */}
      <rect width="800" height="450" fill="#0F1117" />
      <rect width="800" height="450" fill="url(#ca-dots)" />
      <ellipse cx="400" cy="220" rx="380" ry="210" fill="url(#ca-bg)" />

      {/* Header */}
      <text x="400" y="22" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="8.5" fill="#334155" letterSpacing="3">
        AI CODE ANALYSIS · STATIC + SEMANTIC + LLM HYBRID
      </text>

      {/* ── THREE SYSTEM BOXES ── */}

      {/* STATIC ANALYSIS (blue) */}
      <rect x="30" y="36" width="190" height="84" rx="5" fill="#0F1117" stroke="#3B82F6" strokeWidth="1.5" />
      <rect x="30" y="36" width="190" height="84" rx="5" fill="rgba(59,130,246,0.08)" />
      <text x="125" y="56" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="7.5" fill="#475569" letterSpacing="2">STATIC ANALYSIS</text>
      <text x="125" y="84" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="15" fontWeight="700" fill="#3B82F6">Structural</text>
      <text x="125" y="107" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="7" fill="#64748B">call-graph · taint · CPG</text>
      <circle cx="211" cy="45" r="3.5" fill="#3B82F6" style={{ animation: "bca-pulse 1.3s ease-in-out infinite" }} filter="url(#ca-gb)" />

      {/* SEMANTIC SEARCH (purple) */}
      <rect x="305" y="36" width="190" height="84" rx="5" fill="#0F1117" stroke="#8B5CF6" strokeWidth="1.5" />
      <rect x="305" y="36" width="190" height="84" rx="5" fill="rgba(139,92,246,0.08)" />
      <text x="400" y="56" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="7.5" fill="#475569" letterSpacing="2">SEMANTIC SEARCH</text>
      <text x="400" y="84" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="15" fontWeight="700" fill="#8B5CF6">Retrieval</text>
      <text x="400" y="107" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="7" fill="#64748B">vector embeddings · similarity</text>
      <circle cx="486" cy="45" r="3.5" fill="#8B5CF6" style={{ animation: "bca-pulse 1.7s ease-in-out infinite", animationDelay: "0.4s" }} filter="url(#ca-gp)" />

      {/* LLM REASONING (green) */}
      <rect x="580" y="36" width="190" height="84" rx="5" fill="#0F1117" stroke="#10B981" strokeWidth="1.5" />
      <rect x="580" y="36" width="190" height="84" rx="5" fill="rgba(16,185,129,0.08)" />
      <text x="675" y="56" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="7.5" fill="#475569" letterSpacing="2">LLM REASONING</text>
      <text x="675" y="84" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="15" fontWeight="700" fill="#10B981">Inference</text>
      <text x="675" y="107" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="7" fill="#64748B">evidence → judgement</text>
      <circle cx="761" cy="45" r="3.5" fill="#10B981" style={{ animation: "bca-pulse 2.1s ease-in-out infinite", animationDelay: "0.8s" }} filter="url(#ca-gg)" />

      {/* ── CONVERGENCE TRACES ── */}
      <path d="M 125 120 L 270 170" stroke="#3B82F6" strokeWidth="1.5" fill="none" strokeDasharray="4 3" opacity="0.35" />
      <path d="M 400 120 L 400 170" stroke="#8B5CF6" strokeWidth="1.5" fill="none" strokeDasharray="4 3" opacity="0.35" />
      <path d="M 675 120 L 530 170" stroke="#10B981" strokeWidth="1.5" fill="none" strokeDasharray="4 3" opacity="0.35" />

      {/* ── EXECUTION PATH BOX ── */}
      <rect x="190" y="170" width="420" height="75" rx="5" fill="#0F1117" stroke="#3B82F6" strokeWidth="2" />
      <rect x="190" y="170" width="420" height="75" rx="5" fill="rgba(59,130,246,0.07)" />
      <text x="400" y="191" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="7.5" fill="#475569" letterSpacing="2">EXECUTION PATH · EVIDENCE COLLECTOR</text>
      <text x="400" y="215" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="14" fontWeight="700" fill="#3B82F6">Exec Path Builder</text>
      {/* Three input type labels inside */}
      <text x="268" y="234" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="7" fill="#3B82F6" opacity="0.65">structural</text>
      <text x="400" y="234" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="7" fill="#8B5CF6" opacity="0.65">retrieval</text>
      <text x="532" y="234" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="7" fill="#10B981" opacity="0.65">inference</text>
      <path d="M 334 228 L 334 238" stroke="#475569" strokeWidth="0.5" opacity="0.4" />
      <path d="M 466 228 L 466 238" stroke="#475569" strokeWidth="0.5" opacity="0.4" />
      <circle cx="600" cy="183" r="3" fill="#3B82F6" style={{ animation: "bca-pulse 1.5s ease-in-out infinite" }} filter="url(#ca-gb)" />

      {/* ── TRACE: EXEC → VULN ── */}
      <path d="M 400 245 L 400 280" stroke="#8B5CF6" strokeWidth="1.5" fill="none" strokeDasharray="4 3" opacity="0.4" />

      {/* ── VULNERABILITY ANALYSIS BOX ── */}
      <rect x="225" y="280" width="350" height="65" rx="5" fill="#0F1117" stroke="#8B5CF6" strokeWidth="1.5" />
      <rect x="225" y="280" width="350" height="65" rx="5" fill="rgba(139,92,246,0.07)" />
      <text x="400" y="301" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="7.5" fill="#475569" letterSpacing="2">VULNERABILITY ANALYSIS</text>
      <text x="400" y="325" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="14" fontWeight="700" fill="#8B5CF6">Vuln Analysis Agent</text>
      <circle cx="565" cy="290" r="3" fill="#8B5CF6" style={{ animation: "bca-pulse 2s ease-in-out infinite", animationDelay: "0.6s" }} filter="url(#ca-gp)" />

      {/* ── ITERATIVE AGENT LOOP (feedback arc, right side) ── */}
      <path d="M 575 312 C 680 312 680 207 610 207" stroke="#F59E0B" strokeWidth="1" fill="none" strokeDasharray="3 4" opacity="0.35" />
      <text x="710" y="255" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="7" fill="#F59E0B" opacity="0.55" letterSpacing="1">re-plan</text>
      <text x="710" y="265" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="7" fill="#F59E0B" opacity="0.55">→</text>

      {/* ── RESULT METRIC BANNER ── */}
      <rect x="200" y="368" width="400" height="50" rx="6" fill="rgba(16,185,129,0.07)" stroke="rgba(16,185,129,0.2)" strokeWidth="1" />
      <text x="400" y="385" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="8" fill="#475569" letterSpacing="3">RESULT</text>
      <text x="400" y="406" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="14" fontWeight="700" fill="#10B981">70% more findings · 0 false positives</text>

      {/* ── ANIMATED DATA PACKETS ── */}
      {/* Static Analysis → Execution Path */}
      <circle r="4" fill="#3B82F6" filter="url(#ca-gb)">
        <animateMotion dur="1.4s" repeatCount="indefinite" begin="0s" calcMode="linear">
          <mpath href="#ca-p1" />
        </animateMotion>
      </circle>
      {/* Semantic Search → Execution Path */}
      <circle r="4" fill="#8B5CF6" filter="url(#ca-gp)">
        <animateMotion dur="1.2s" repeatCount="indefinite" begin="0.5s" calcMode="linear">
          <mpath href="#ca-p2" />
        </animateMotion>
      </circle>
      {/* LLM Reasoning → Execution Path */}
      <circle r="4" fill="#10B981" filter="url(#ca-gg)">
        <animateMotion dur="1.4s" repeatCount="indefinite" begin="1.0s" calcMode="linear">
          <mpath href="#ca-p3" />
        </animateMotion>
      </circle>
      {/* Execution Path → Vuln Analysis */}
      {([0, 0.8] as const).map((delay) => (
        <circle key={delay} r="4" fill="#3B82F6" filter="url(#ca-gb)">
          <animateMotion dur="0.9s" repeatCount="indefinite" begin={`${1.5 + delay}s`} calcMode="linear">
            <mpath href="#ca-p4" />
          </animateMotion>
        </circle>
      ))}
      {/* Re-plan feedback loop packet (amber) */}
      <circle r="3" fill="#F59E0B">
        <animateMotion dur="2s" repeatCount="indefinite" begin="2.5s" calcMode="paced">
          <mpath href="#ca-loop" />
        </animateMotion>
      </circle>

      {/* Corner annotations */}
      <text x="18" y="444" fontFamily="'Courier New',monospace" fontSize="7.5" fill="#1E293B">aryan.dev</text>
      <text x="782" y="444" textAnchor="end" fontFamily="'Courier New',monospace" fontSize="7.5" fill="#1E293B">security · ai-infrastructure</text>
    </svg>
  );
}

/* ── Swagger Parser Agent: API dependency graph workflow – */
function SwaggerParserAgentCover() {
  return (
    <svg
      viewBox="0 0 800 450"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <style>{STYLE}</style>
        <pattern id="sp-dots" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="12" cy="12" r="0.7" fill="rgba(255,255,255,0.045)" />
        </pattern>
        <filter id="sp-gb">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="sp-gp">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="sp-gg">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="sp-go">
          <feGaussianBlur stdDeviation="2.5" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <radialGradient id="sp-bg" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.04" />
          <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
        </radialGradient>
        {/* Motion paths: Row1 chain (left → right), then down into Row2 */}
        <path id="sp-p1" d="M 175 102 L 225 102" />
        <path id="sp-p2" d="M 375 102 L 425 102" />
        <path id="sp-p3" d="M 575 102 L 625 102" />
        <path id="sp-p4" d="M 500 134 L 500 210" />
        <path id="sp-p5" d="M 700 134 L 700 210" />
        <path id="sp-p6" d="M 575 242 L 625 242" />
      </defs>

      {/* Background */}
      <rect width="800" height="450" fill="#0F1117" />
      <rect width="800" height="450" fill="url(#sp-dots)" />
      <ellipse cx="400" cy="220" rx="380" ry="210" fill="url(#sp-bg)" />

      {/* Header */}
      <text x="400" y="22" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="8.5" fill="#334155" letterSpacing="3">
        OPENAPI DEPENDENCY GRAPH · WORKFLOW EXECUTION
      </text>

      {/* ── ROW 1: Spec → Root → Dependency chain ── */}

      {/* OPENAPI SPEC */}
      <rect x="25" y="70" width="150" height="64" rx="5" fill="#0F1117" stroke="#3B82F6" strokeWidth="1.5" />
      <rect x="25" y="70" width="150" height="64" rx="5" fill="rgba(59,130,246,0.07)" />
      <text x="100" y="90" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="7" fill="#475569" letterSpacing="2">OPENAPI SPEC</text>
      <text x="100" y="112" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="13" fontWeight="700" fill="#3B82F6">Swagger</text>
      <circle cx="166" cy="79" r="3.5" fill="#3B82F6" style={{ animation: "bca-pulse 1.2s ease-in-out infinite" }} filter="url(#sp-gb)" />

      {/* ROOT API */}
      <rect x="225" y="70" width="150" height="64" rx="5" fill="#0F1117" stroke="#8B5CF6" strokeWidth="1.5" />
      <rect x="225" y="70" width="150" height="64" rx="5" fill="rgba(139,92,246,0.08)" />
      <text x="300" y="90" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="7" fill="#475569" letterSpacing="2">ROOT API</text>
      <text x="300" y="112" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="12" fontWeight="700" fill="#8B5CF6">POST /users</text>
      <circle cx="366" cy="79" r="3" fill="#8B5CF6" style={{ animation: "bca-pulse 1.8s ease-in-out infinite", animationDelay: "0.3s" }} filter="url(#sp-gp)" />

      {/* DEPENDS ON (GET /users/{id}) */}
      <rect x="425" y="70" width="150" height="64" rx="5" fill="#0F1117" stroke="#3B82F6" strokeWidth="1.5" />
      <rect x="425" y="70" width="150" height="64" rx="5" fill="rgba(59,130,246,0.08)" />
      <text x="500" y="90" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="7" fill="#475569" letterSpacing="2">DEPENDS ON</text>
      <text x="500" y="112" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="11" fontWeight="700" fill="#3B82F6">GET /users/{'{id}'}</text>
      <circle cx="566" cy="79" r="3" fill="#3B82F6" style={{ animation: "bca-pulse 1.5s ease-in-out infinite", animationDelay: "0.6s" }} filter="url(#sp-gb)" />

      {/* DEPENDENT (POST /projects) */}
      <rect x="625" y="70" width="150" height="64" rx="5" fill="#0F1117" stroke="#8B5CF6" strokeWidth="1.5" />
      <rect x="625" y="70" width="150" height="64" rx="5" fill="rgba(139,92,246,0.08)" />
      <text x="700" y="90" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="7" fill="#475569" letterSpacing="2">DEPENDENT</text>
      <text x="700" y="112" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="12" fontWeight="700" fill="#8B5CF6">POST /projects</text>
      <circle cx="766" cy="79" r="3" fill="#8B5CF6" style={{ animation: "bca-pulse 2s ease-in-out infinite", animationDelay: "0.9s" }} filter="url(#sp-gp)" />

      {/* Row 1 traces */}
      <path d="M 175 102 L 225 102" stroke="#8B5CF6" strokeWidth="1.5" fill="none" strokeDasharray="4 3" opacity="0.35" />
      <path d="M 375 102 L 425 102" stroke="#3B82F6" strokeWidth="1.5" fill="none" strokeDasharray="4 3" opacity="0.35" />
      <path d="M 575 102 L 625 102" stroke="#8B5CF6" strokeWidth="1.5" fill="none" strokeDasharray="4 3" opacity="0.35" />

      {/* Vertical traces: Row1 → Row2 */}
      <path d="M 500 134 L 500 210" stroke="#F59E0B" strokeWidth="1.5" fill="none" strokeDasharray="4 3" opacity="0.35" />
      <path d="M 700 134 L 700 210" stroke="#10B981" strokeWidth="1.5" fill="none" strokeDasharray="4 3" opacity="0.35" />

      {/* ── ROW 2: Param cache → Success ── */}

      {/* PARAM CACHE */}
      <rect x="425" y="210" width="150" height="64" rx="5" fill="#0F1117" stroke="#F59E0B" strokeWidth="1.5" />
      <rect x="425" y="210" width="150" height="64" rx="5" fill="rgba(245,158,11,0.07)" />
      <text x="500" y="230" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="7" fill="#475569" letterSpacing="2">PARAM CACHE</text>
      <text x="500" y="252" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="11" fontWeight="700" fill="#F59E0B">userId, id...</text>
      <circle cx="566" cy="219" r="3" fill="#F59E0B" style={{ animation: "bca-pulse 1.4s ease-in-out infinite" }} filter="url(#sp-go)" />

      {/* SUCCESS */}
      <rect x="625" y="210" width="150" height="64" rx="5" fill="#0F1117" stroke="#10B981" strokeWidth="1.5" />
      <rect x="625" y="210" width="150" height="64" rx="5" fill="rgba(16,185,129,0.08)" />
      <text x="700" y="230" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="7" fill="#475569" letterSpacing="2">SUCCESS</text>
      <text x="700" y="252" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="13" fontWeight="700" fill="#10B981">Resolved</text>
      <circle cx="766" cy="219" r="3" fill="#10B981" style={{ animation: "bca-pulse 1.8s ease-in-out infinite", animationDelay: "0.4s" }} filter="url(#sp-gg)" />

      {/* Trace: Cache → Success */}
      <path d="M 575 242 L 625 242" stroke="#10B981" strokeWidth="1.5" fill="none" strokeDasharray="4 3" opacity="0.35" />

      {/* ── AI RECOVERY BADGE ── */}
      <rect x="200" y="300" width="400" height="48" rx="5" fill="rgba(59,130,246,0.06)" stroke="rgba(59,130,246,0.18)" strokeWidth="1" />
      <text x="400" y="319" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="7" fill="#475569" letterSpacing="2">AI-ASSISTED RECOVERY FOR EDGE CASES</text>
      <text x="400" y="339" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="11" fontWeight="700" fill="#3B82F6">When deterministic logic reaches limits</text>

      {/* ── RESULT METRIC BANNER ── */}
      <rect x="190" y="368" width="420" height="46" rx="6" fill="rgba(16,185,129,0.07)" stroke="rgba(16,185,129,0.2)" strokeWidth="1" />
      <text x="400" y="385" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="8" fill="#475569" letterSpacing="3">COVERAGE</text>
      <text x="400" y="405" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="14" fontWeight="700" fill="#10B981">10% → 60% successful API execution</text>

      {/* ── ANIMATED DATA PACKETS ── */}
      {/* Spec → Root */}
      <circle r="4" fill="#3B82F6" filter="url(#sp-gb)">
        <animateMotion dur="0.8s" repeatCount="indefinite" begin="0s" calcMode="linear">
          <mpath href="#sp-p1" />
        </animateMotion>
      </circle>
      {/* Root → Depends On */}
      <circle r="4" fill="#8B5CF6" filter="url(#sp-gp)">
        <animateMotion dur="0.8s" repeatCount="indefinite" begin="0.5s" calcMode="linear">
          <mpath href="#sp-p2" />
        </animateMotion>
      </circle>
      {/* Depends On → Dependent */}
      <circle r="4" fill="#3B82F6" filter="url(#sp-gb)">
        <animateMotion dur="0.8s" repeatCount="indefinite" begin="1.0s" calcMode="linear">
          <mpath href="#sp-p3" />
        </animateMotion>
      </circle>
      {/* Depends On → Param Cache */}
      <circle r="3.5" fill="#F59E0B" filter="url(#sp-go)">
        <animateMotion dur="1s" repeatCount="indefinite" begin="1.5s" calcMode="linear">
          <mpath href="#sp-p4" />
        </animateMotion>
      </circle>
      {/* Dependent → Success */}
      <circle r="4" fill="#10B981" filter="url(#sp-gg)">
        <animateMotion dur="1s" repeatCount="indefinite" begin="1.5s" calcMode="linear">
          <mpath href="#sp-p5" />
        </animateMotion>
      </circle>
      {/* Cache → Success */}
      <circle r="4" fill="#10B981" filter="url(#sp-gg)">
        <animateMotion dur="0.8s" repeatCount="indefinite" begin="2.2s" calcMode="linear">
          <mpath href="#sp-p6" />
        </animateMotion>
      </circle>

      {/* Corner annotations */}
      <text x="18" y="444" fontFamily="'Courier New',monospace" fontSize="7.5" fill="#1E293B">aryan.dev</text>
      <text x="782" y="444" textAnchor="end" fontFamily="'Courier New',monospace" fontSize="7.5" fill="#1E293B">api-design · ai-infrastructure</text>
    </svg>
  );
}

/* ── Observability Dashboard: multi-agent ingestion pipeline ── */
function ObservabilityDashboardCover() {
  const AGENTS = [
    { name: "Claude", x: 26, strategy: "BORROW", color: "#8B5CF6" },
    { name: "Cursor", x: 152, strategy: "TRUST", color: "#10B981" },
    { name: "Copilot", x: 278, strategy: "INVENT", color: "#3B82F6" },
    { name: "Codex", x: 404, strategy: "INVENT", color: "#3B82F6" },
    { name: "Gemini", x: 530, strategy: "INVENT", color: "#3B82F6" },
    { name: "LangChain", x: 656, strategy: "INVENT", color: "#3B82F6" },
  ] as const;
  const AW = 118;
  const AH = 48;
  const AY = 34;
  const BUS_Y = 98;
  const glowFor = (c: string) => (c === "#3B82F6" ? "od-gb" : c === "#8B5CF6" ? "od-gp" : "od-gg");

  return (
    <svg
      viewBox="0 0 800 450"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <style>{STYLE}</style>
        <pattern id="od-dots" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="12" cy="12" r="0.7" fill="rgba(255,255,255,0.045)" />
        </pattern>
        <filter id="od-gb">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="od-gp">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="od-gg">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <radialGradient id="od-bg" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.04" />
          <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
        </radialGradient>
        {/* Motion paths: each agent → bus → center → aggregator */}
        {AGENTS.map((a) => (
          <path key={a.name} id={`od-${a.name}`} d={`M ${a.x + AW / 2} ${AY + AH} L ${a.x + AW / 2} ${BUS_Y} L 400 ${BUS_Y} L 400 116`} />
        ))}
        <path id="od-agg-kafka" d="M 400 162 L 400 186" />
        <path id="od-kafka-cons" d="M 400 234 L 400 258" />
        <path id="od-cons-es" d="M 400 302 L 400 326" />
      </defs>

      {/* Background */}
      <rect width="800" height="450" fill="#0F1117" />
      <rect width="800" height="450" fill="url(#od-dots)" />
      <ellipse cx="400" cy="220" rx="380" ry="210" fill="url(#od-bg)" />

      {/* Header */}
      <text x="400" y="22" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="8.5" fill="#334155" letterSpacing="3">
        AI AGENT OBSERVABILITY · SIX AGENTS, ONE NORMALIZED EVENT
      </text>

      {/* ── AGENT BOXES ── */}
      {AGENTS.map((a) => {
        const cx = a.x + AW / 2;
        return (
          <g key={a.name}>
            <rect x={a.x} y={AY} width={AW} height={AH} rx="5" fill="#0F1117" stroke={a.color} strokeWidth="1.5" />
            <rect x={a.x} y={AY} width={AW} height={AH} rx="5" fill={`${a.color}12`} />
            <text x={cx} y={AY + 15} textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="8" fill="#475569" letterSpacing="2">AGENT</text>
            <text x={cx} y={AY + 31} textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="12" fontWeight="700" fill={a.color}>{a.name}</text>
            <text x={cx} y={AY + 43} textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="6.5" fill={a.color} opacity="0.75" letterSpacing="1.5">{a.strategy}</text>
            <circle cx={a.x + AW - 8} cy={AY + 8} r="3" fill={a.color} style={{ animation: "bca-pulse 1.6s ease-in-out infinite" }} filter={`url(#${glowFor(a.color)})`} />
          </g>
        );
      })}

      {/* Traces: agents → bus */}
      {AGENTS.map((a) => (
        <path key={a.name} d={`M ${a.x + AW / 2} ${AY + AH} L ${a.x + AW / 2} ${BUS_Y}`} stroke={a.color} strokeWidth="1" fill="none" strokeDasharray="3 3" opacity="0.3" />
      ))}
      <path d={`M ${AGENTS[0].x + AW / 2} ${BUS_Y} L ${AGENTS[5].x + AW / 2} ${BUS_Y}`} stroke="#3B82F6" strokeWidth="1" fill="none" opacity="0.15" />
      {AGENTS.map((a) => (
        <rect key={a.name} x={a.x + AW / 2 - 3} y={BUS_Y - 3} width={6} height={6} rx="1" fill={a.color} opacity="0.5" />
      ))}
      <path d={`M 400 ${BUS_Y} L 400 116`} stroke="#3B82F6" strokeWidth="1.5" fill="none" strokeDasharray="4 3" opacity="0.35" />

      {/* ── AGGREGATOR ── */}
      <rect x="300" y="116" width="200" height="46" rx="5" fill="#0F1117" stroke="#3B82F6" strokeWidth="1.5" />
      <rect x="300" y="116" width="200" height="46" rx="5" fill="rgba(59,130,246,0.07)" />
      <text x="400" y="132" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="8" fill="#475569" letterSpacing="2.5">PER-TENANT BUFFER</text>
      <text x="400" y="150" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="14" fontWeight="700" fill="#3B82F6">Aggregator</text>
      <text x="514" y="141" fontFamily="'Courier New',monospace" fontSize="7.5" fill="#334155">flush · 5s or 100 events</text>
      <circle cx="491" cy="124" r="3" fill="#3B82F6" style={{ animation: "bca-pulse 1.4s ease-in-out infinite" }} filter="url(#od-gb)" />

      {/* Trace: aggregator → kafka */}
      <path d="M 400 162 L 400 186" stroke="#3B82F6" strokeWidth="1.5" fill="none" strokeDasharray="4 3" opacity="0.35" />

      {/* ── KAFKA ── */}
      <rect x="280" y="186" width="240" height="48" rx="5" fill="#0F1117" stroke="#8B5CF6" strokeWidth="1.5" />
      <rect x="280" y="186" width="240" height="48" rx="5" fill="rgba(139,92,246,0.08)" />
      <text x="400" y="202" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="8" fill="#475569" letterSpacing="2.5">MESSAGE QUEUE</text>
      <text x="400" y="221" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="15" fontWeight="700" fill="#8B5CF6">Kafka</text>
      <text x="534" y="212" fontFamily="'Courier New',monospace" fontSize="7.5" fill="#334155">partitioned by tenant</text>
      <circle cx="511" cy="194" r="3" fill="#8B5CF6" style={{ animation: "bca-pulse 1.8s ease-in-out infinite", animationDelay: "0.3s" }} filter="url(#od-gp)" />

      {/* Trace: kafka → consumers */}
      <path d="M 400 234 L 400 258" stroke="#8B5CF6" strokeWidth="1.5" fill="none" strokeDasharray="4 3" opacity="0.35" />

      {/* ── CONSUMERS ── */}
      <rect x="300" y="258" width="200" height="44" rx="5" fill="#0F1117" stroke="#10B981" strokeWidth="1.5" />
      <rect x="300" y="258" width="200" height="44" rx="5" fill="rgba(16,185,129,0.08)" />
      <text x="400" y="274" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="8" fill="#475569" letterSpacing="2.5">ASYNC WRITERS</text>
      <text x="400" y="292" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="14" fontWeight="700" fill="#10B981">Consumers</text>
      <circle cx="491" cy="266" r="3" fill="#10B981" style={{ animation: "bca-pulse 2s ease-in-out infinite", animationDelay: "0.6s" }} filter="url(#od-gg)" />

      {/* Trace: consumers → elasticsearch */}
      <path d="M 400 302 L 400 326" stroke="#10B981" strokeWidth="1.5" fill="none" strokeDasharray="4 3" opacity="0.35" />

      {/* ── ELASTICSEARCH ── */}
      <rect x="290" y="326" width="220" height="46" rx="5" fill="#0F1117" stroke="#10B981" strokeWidth="1.5" />
      <rect x="290" y="326" width="220" height="46" rx="5" fill="rgba(16,185,129,0.07)" />
      <text x="400" y="342" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="8" fill="#475569" letterSpacing="2.5">SEARCH INDEX</text>
      <text x="400" y="360" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="14" fontWeight="700" fill="#10B981">Elasticsearch</text>
      <text x="524" y="351" fontFamily="'Courier New',monospace" fontSize="7.5" fill="#334155">one document per span</text>
      <circle cx="501" cy="334" r="3" fill="#10B981" style={{ animation: "bca-pulse 1.5s ease-in-out infinite", animationDelay: "0.9s" }} filter="url(#od-gg)" />

      {/* ── RESULT METRIC ── */}
      <rect x="190" y="392" width="420" height="44" rx="6" fill="rgba(59,130,246,0.07)" stroke="rgba(59,130,246,0.2)" strokeWidth="1" />
      <text x="400" y="408" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="8" fill="#475569" letterSpacing="3">RESULT</text>
      <text x="400" y="425" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="13" fontWeight="700" fill="#3B82F6">6 agents → 3 identity strategies → 1 shape</text>

      {/* ── ANIMATED DATA PACKETS ── */}
      {AGENTS.map((a, i) => (
        <circle key={a.name} r="4" fill={a.color} filter={`url(#${glowFor(a.color)})`}>
          <animateMotion dur="2.4s" repeatCount="indefinite" begin={`${i * 0.35}s`} calcMode="linear">
            <mpath href={`#od-${a.name}`} />
          </animateMotion>
        </circle>
      ))}
      {[0, 0.5].map((delay) => (
        <circle key={delay} r="4" fill="#3B82F6" filter="url(#od-gb)">
          <animateMotion dur="1s" repeatCount="indefinite" begin={`${1.8 + delay}s`} calcMode="linear">
            <mpath href="#od-agg-kafka" />
          </animateMotion>
        </circle>
      ))}
      {[0, 0.5].map((delay) => (
        <circle key={delay} r="4" fill="#8B5CF6" filter="url(#od-gp)">
          <animateMotion dur="1s" repeatCount="indefinite" begin={`${2.3 + delay}s`} calcMode="linear">
            <mpath href="#od-kafka-cons" />
          </animateMotion>
        </circle>
      ))}
      {[0, 0.5].map((delay) => (
        <circle key={delay} r="4" fill="#10B981" filter="url(#od-gg)">
          <animateMotion dur="1s" repeatCount="indefinite" begin={`${2.8 + delay}s`} calcMode="linear">
            <mpath href="#od-cons-es" />
          </animateMotion>
        </circle>
      ))}

      {/* Corner annotations */}
      <text x="18" y="444" fontFamily="'Courier New',monospace" fontSize="7.5" fill="#1E293B">aryan.dev</text>
      <text x="782" y="444" textAnchor="end" fontFamily="'Courier New',monospace" fontSize="7.5" fill="#1E293B">ai-infrastructure · observability</text>
    </svg>
  );
}

/* ── AI Blog: prompt journey through the agent stack ───── */
function AIPromptJourneyCover() {
  return (
    <svg
      viewBox="0 0 800 450"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <style>{STYLE}</style>
        <pattern id="pj-dots" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="12" cy="12" r="0.7" fill="rgba(255,255,255,0.045)" />
        </pattern>
        <filter id="pj-gb">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="pj-gp">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="pj-gg">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <radialGradient id="pj-bg" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.04" />
          <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
        </radialGradient>
        {/* Motion paths — left-to-right pipeline, then right-to-left continuation below */}
        <path id="pj-p1" d="M 158 90 L 185 90" />
        <path id="pj-p2" d="M 315 90 L 345 90" />
        <path id="pj-p3" d="M 475 90 L 590 90" />
        <path id="pj-lbend" d="M 675 140 L 675 192 L 610 192 L 610 235" />
        <path id="pj-p5" d="M 545 265 L 505 265" />
        <path id="pj-p6" d="M 375 265 L 335 265" />
        <path id="pj-loop" d="M 270 235 Q 355 195 440 235" />
        <path id="pj-exit" d="M 440 295 L 440 355" />
      </defs>

      {/* Background */}
      <rect width="800" height="450" fill="#0F1117" />
      <rect width="800" height="450" fill="url(#pj-dots)" />
      <ellipse cx="400" cy="220" rx="380" ry="210" fill="url(#pj-bg)" />

      {/* Header */}
      <text x="400" y="22" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="8.5" fill="#334155" letterSpacing="3">
        ANATOMY OF A PROMPT · REQUEST TO RESPONSE
      </text>

      {/* ── ROW 1: request → prompt engineering → tokenize → retrieve (left → right) ── */}

      {/* CLIENT REQUEST */}
      <rect x="18" y="58" width="140" height="64" rx="5" fill="#0F1117" stroke="#3B82F6" strokeWidth="1.5" />
      <rect x="18" y="58" width="140" height="64" rx="5" fill="rgba(59,130,246,0.08)" />
      <text x="88" y="76" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="7" fill="#475569" letterSpacing="1.5">CLIENT REQUEST</text>
      <text x="88" y="98" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="13" fontWeight="700" fill="#3B82F6">User Prompt</text>
      <circle cx="149" cy="67" r="3.5" fill="#3B82F6" style={{ animation: "bca-pulse 1.2s ease-in-out infinite" }} filter="url(#pj-gb)" />

      {/* Trace: request → prompt engineering */}
      <path d="M 158 90 L 185 90" stroke="#3B82F6" strokeWidth="1.5" fill="none" strokeDasharray="4 3" opacity="0.4" />

      {/* PROMPT ENGINEERING */}
      <rect x="185" y="58" width="130" height="64" rx="5" fill="#0F1117" stroke="#8B5CF6" strokeWidth="1.5" />
      <rect x="185" y="58" width="130" height="64" rx="5" fill="rgba(139,92,246,0.08)" />
      <text x="250" y="76" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="6.5" fill="#475569" letterSpacing="1">PROMPT ENGINEERING</text>
      <text x="250" y="98" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="12" fontWeight="700" fill="#8B5CF6">Scope + Rules</text>
      <circle cx="306" cy="67" r="3" fill="#8B5CF6" style={{ animation: "bca-pulse 1.6s ease-in-out infinite", animationDelay: "0.3s" }} filter="url(#pj-gp)" />

      {/* Trace: prompt engineering → tokenize */}
      <path d="M 315 90 L 345 90" stroke="#8B5CF6" strokeWidth="1.5" fill="none" strokeDasharray="4 3" opacity="0.4" />

      {/* TOKENIZE */}
      <rect x="345" y="58" width="130" height="64" rx="5" fill="#0F1117" stroke="#3B82F6" strokeWidth="1.5" />
      <rect x="345" y="58" width="130" height="64" rx="5" fill="rgba(59,130,246,0.08)" />
      <text x="410" y="76" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="7" fill="#475569" letterSpacing="1.5">TOKENIZATION</text>
      <text x="410" y="98" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="12" fontWeight="700" fill="#3B82F6">Tokens</text>
      <circle cx="466" cy="67" r="3" fill="#3B82F6" style={{ animation: "bca-pulse 1.4s ease-in-out infinite", animationDelay: "0.6s" }} filter="url(#pj-gb)" />

      {/* Trace: tokenize → retrieve (search trace) */}
      <path d="M 475 90 L 590 90" stroke="#3B82F6" strokeWidth="1.5" fill="none" strokeDasharray="4 3" opacity="0.5" />

      {/* RAG RETRIEVAL (prominent, with search rings) */}
      <circle cx="675" cy="90" r="68" fill="none" stroke="#10B981" strokeWidth="0.7" opacity="0.1" style={{ animation: "bca-pulse 2.4s ease-in-out infinite" }} />
      <circle cx="675" cy="90" r="85" fill="none" stroke="#10B981" strokeWidth="0.5" opacity="0.06" style={{ animation: "bca-pulse 2.4s ease-in-out infinite", animationDelay: "0.7s" }} />
      <rect x="590" y="40" width="170" height="100" rx="5" fill="#0F1117" stroke="#10B981" strokeWidth="2" />
      <rect x="590" y="40" width="170" height="100" rx="5" fill="rgba(16,185,129,0.07)" />
      <text x="675" y="64" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="7.5" fill="#475569" letterSpacing="2">RAG RETRIEVAL</text>
      <text x="675" y="86" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="13" fontWeight="700" fill="#10B981">Vector Search</text>
      <text x="675" y="106" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="8" fill="#64748B">embed · rank · context</text>

      {/* L-shaped trace: retrieval bottom → bend → planner top */}
      <path d="M 675 140 L 675 192 L 610 192 L 610 235" stroke="#10B981" strokeWidth="1.5" fill="none" strokeDasharray="4 3" opacity="0.4" />
      {/* Junction dots at L-bend */}
      <rect x="672" y="189" width="6" height="6" rx="1" fill="#10B981" opacity="0.5" />
      <rect x="607" y="189" width="6" height="6" rx="1" fill="#10B981" opacity="0.5" />
      <text x="700" y="170" fontFamily="'Courier New',monospace" fontSize="7" fill="#334155">context</text>

      {/* ── ROW 2: planner → react agent → mcp tool call (right → left) ── */}

      {/* PLANNER */}
      <rect x="545" y="235" width="130" height="60" rx="5" fill="#0F1117" stroke="#3B82F6" strokeWidth="1.5" />
      <rect x="545" y="235" width="130" height="60" rx="5" fill="rgba(59,130,246,0.08)" />
      <text x="610" y="253" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="6.5" fill="#475569" letterSpacing="1.5">PLANNER</text>
      <text x="610" y="275" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="12" fontWeight="700" fill="#3B82F6">Decompose</text>

      {/* Trace: planner → react agent */}
      <path d="M 545 265 L 505 265" stroke="#3B82F6" strokeWidth="1.5" fill="none" strokeDasharray="4 3" opacity="0.4" />

      {/* REACT AGENT */}
      <rect x="375" y="235" width="130" height="60" rx="5" fill="#0F1117" stroke="#8B5CF6" strokeWidth="1.5" />
      <rect x="375" y="235" width="130" height="60" rx="5" fill="rgba(139,92,246,0.08)" />
      <text x="440" y="253" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="6.5" fill="#475569" letterSpacing="1.5">REACT AGENT</text>
      <text x="440" y="275" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="12" fontWeight="700" fill="#8B5CF6">ReAct Loop</text>
      <circle cx="496" cy="244" r="3" fill="#8B5CF6" style={{ animation: "bca-pulse 1.8s ease-in-out infinite" }} filter="url(#pj-gp)" />

      {/* Trace: react agent → mcp tool call (act) */}
      <path d="M 375 265 L 335 265" stroke="#8B5CF6" strokeWidth="1.5" fill="none" strokeDasharray="4 3" opacity="0.4" />
      <text x="313" y="253" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="6.5" fill="#334155">acts</text>

      {/* MCP TOOL CALL */}
      <rect x="205" y="235" width="130" height="60" rx="5" fill="#0F1117" stroke="#10B981" strokeWidth="1.5" />
      <rect x="205" y="235" width="130" height="60" rx="5" fill="rgba(16,185,129,0.08)" />
      <text x="270" y="253" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="6.5" fill="#475569" letterSpacing="1.5">MCP TOOL CALL</text>
      <text x="270" y="275" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="11" fontWeight="700" fill="#10B981">Client→Server</text>

      {/* Feedback loop: tool result observed back into react agent */}
      <path d="M 270 235 Q 355 195 440 235" stroke="#F59E0B" strokeWidth="1" fill="none" strokeDasharray="3 4" opacity="0.4" />
      <text x="355" y="190" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="7" fill="#F59E0B" opacity="0.7" letterSpacing="1">tool result</text>

      {/* Trace: react agent → final response */}
      <path d="M 440 295 L 440 355" stroke="#3B82F6" strokeWidth="1.5" fill="none" strokeDasharray="4 3" opacity="0.4" />

      {/* ── BOTTOM ROW ── */}

      {/* Loop guard badge */}
      <rect x="18" y="355" width="148" height="52" rx="5" fill="rgba(245,158,11,0.06)" stroke="rgba(245,158,11,0.18)" strokeWidth="1" />
      <text x="92" y="374" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="7" fill="#475569" letterSpacing="2">LOOP GUARD</text>
      <text x="92" y="395" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="11" fontWeight="700" fill="#F59E0B">bounded recursion</text>

      {/* Final response */}
      <rect x="356" y="355" width="168" height="52" rx="5" fill="#0F1117" stroke="#3B82F6" strokeWidth="1" />
      <rect x="356" y="355" width="168" height="52" rx="5" fill="rgba(59,130,246,0.06)" />
      <text x="440" y="374" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="7" fill="#475569" letterSpacing="2">RESPONSE</text>
      <text x="440" y="395" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="12" fontWeight="600" fill="#3B82F6">Grounded Answer</text>

      {/* Grounding confidence badge */}
      <rect x="530" y="355" width="252" height="52" rx="5" fill="rgba(16,185,129,0.06)" stroke="rgba(16,185,129,0.18)" strokeWidth="1" />
      <text x="656" y="374" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="7" fill="#475569" letterSpacing="2">GROUNDED IN</text>
      <text x="656" y="395" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="11" fontWeight="700" fill="#10B981">retrieved context · tool results</text>

      {/* ── ANIMATED DATA PACKETS ── */}
      <circle r="3.5" fill="#3B82F6" filter="url(#pj-gb)">
        <animateMotion dur="0.8s" repeatCount="indefinite" begin="0s" calcMode="linear"><mpath href="#pj-p1" /></animateMotion>
      </circle>
      <circle r="3.5" fill="#8B5CF6" filter="url(#pj-gp)">
        <animateMotion dur="0.8s" repeatCount="indefinite" begin="0.4s" calcMode="linear"><mpath href="#pj-p2" /></animateMotion>
      </circle>
      <circle r="3.5" fill="#3B82F6" filter="url(#pj-gb)">
        <animateMotion dur="1.6s" repeatCount="indefinite" begin="0.8s" calcMode="linear"><mpath href="#pj-p3" /></animateMotion>
      </circle>
      {[0, 0.7].map((delay) => (
        <circle key={delay} r="3.5" fill="#10B981" filter="url(#pj-gg)">
          <animateMotion dur="1.6s" repeatCount="indefinite" begin={`${1.2 + delay}s`} calcMode="linear"><mpath href="#pj-lbend" /></animateMotion>
        </circle>
      ))}
      <circle r="3.5" fill="#3B82F6" filter="url(#pj-gb)">
        <animateMotion dur="0.7s" repeatCount="indefinite" begin="1.8s" calcMode="linear"><mpath href="#pj-p5" /></animateMotion>
      </circle>
      <circle r="3.5" fill="#8B5CF6" filter="url(#pj-gp)">
        <animateMotion dur="0.7s" repeatCount="indefinite" begin="2.2s" calcMode="linear"><mpath href="#pj-p6" /></animateMotion>
      </circle>
      <circle r="3" fill="#F59E0B">
        <animateMotion dur="1.4s" repeatCount="indefinite" begin="2.6s" calcMode="paced"><mpath href="#pj-loop" /></animateMotion>
      </circle>
      <circle r="3" fill="#3B82F6" filter="url(#pj-gb)">
        <animateMotion dur="1.0s" repeatCount="indefinite" begin="3.0s" calcMode="linear"><mpath href="#pj-exit" /></animateMotion>
      </circle>

      {/* Corner annotations */}
      <text x="18" y="444" fontFamily="'Courier New',monospace" fontSize="7.5" fill="#1E293B">aryan.dev</text>
      <text x="782" y="444" textAnchor="end" fontFamily="'Courier New',monospace" fontSize="7.5" fill="#1E293B">ai-infrastructure</text>
    </svg>
  );
}

/* ── Generic tag cover (fallback) ──────────────────────── */
function GenericCover({ tags }: { tags: string[] }) {
  const primary = tags[0] ?? "distributed-systems";
  const colorMap: Record<string, string> = {
    "distributed-systems": "#8B5CF6",
    "ai-infrastructure": "#3B82F6",
    databases: "#10B981",
    observability: "#F59E0B",
    security: "#EF4444",
  };
  const color = colorMap[primary] ?? "#3B82F6";

  return (
    <svg viewBox="0 0 800 450" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <style>{STYLE}</style>
        <pattern id="gen-dots" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="12" cy="12" r="0.7" fill="rgba(255,255,255,0.045)" />
        </pattern>
        <radialGradient id="gen-bg" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor={color} stopOpacity="0.08" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="800" height="450" fill="#0F1117" />
      <rect width="800" height="450" fill="url(#gen-dots)" />
      <ellipse cx="400" cy="225" rx="360" ry="200" fill="url(#gen-bg)" />

      {/* Large faint tag label */}
      <text x="400" y="240" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="48" fontWeight="700"
        fill={color} opacity="0.12">{primary.toUpperCase()}</text>

      {/* Center ring */}
      <circle cx="400" cy="225" r="60" fill="none" stroke={color} strokeWidth="1" opacity="0.15" />
      <circle cx="400" cy="225" r="40" fill="none" stroke={color} strokeWidth="1" opacity="0.1" />
      <circle cx="400" cy="225" r="20" fill={`${color}22`} stroke={color} strokeWidth="1.5" opacity="0.5"
        style={{ animation: "bca-pulse 2.5s ease-in-out infinite" }} />

      {/* Tag label */}
      <text x="400" y="338" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="11" fill={color} opacity="0.7" letterSpacing="3">
        {primary.replace(/-/g, " ").toUpperCase()}
      </text>
    </svg>
  );
}

/* ── Public API ─────────────────────────────────────────── */
interface BlogCoverArtProps {
  slug: string;
  tags: string[];
  className?: string;
}

const SLUG_MAP: Record<string, React.FC> = {
  boostingTesting: BoostingTestingCover,
  kafka: KafkaLogCover,
  redTeamingOchestrator: RedTeamOrchestratorCover,
  CodeAnalysisAgent: CodeAnalysisAgentCover,
  SwaggerParserAgent: SwaggerParserAgentCover,
  obervabilityService: ObservabilityDashboardCover,
  "AI-Blog": AIPromptJourneyCover,
};

export default function BlogCoverArt({ slug, tags, className = "" }: BlogCoverArtProps) {
  const Cover = SLUG_MAP[slug];
  if (Cover) return <div className={`w-full h-full ${className}`}><Cover /></div>;
  return <div className={`w-full h-full ${className}`}><GenericCover tags={tags} /></div>;
}
