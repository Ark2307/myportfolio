"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import BlueprintGrid from "@/components/ui/BlueprintGrid";
import SectionLabel from "@/components/ui/SectionLabel";

interface Node {
  id: string;
  label: string;
  sublabel: string;
  x: number;
  y: number;
}

interface Edge {
  from: string;
  to: string;
  label?: string;
}

const NODES: Node[] = [
  { id: "client",    label: "Client",      sublabel: "Web / Mobile",       x: 80,  y: 160 },
  { id: "cdn",       label: "CDN",         sublabel: "Cloudflare",          x: 80,  y: 280 },
  { id: "gateway",   label: "API Gateway", sublabel: "Rate limit · Auth",   x: 280, y: 200 },
  { id: "service_a", label: "Core API",    sublabel: "Go · gRPC",           x: 500, y: 100 },
  { id: "service_b", label: "Worker",      sublabel: "Async jobs",          x: 500, y: 280 },
  { id: "db",        label: "Postgres",    sublabel: "Primary + Replica",   x: 720, y: 120 },
  { id: "cache",     label: "Redis",       sublabel: "L2 Cache",            x: 720, y: 240 },
  { id: "queue",     label: "Kafka",       sublabel: "Event streaming",     x: 720, y: 360 },
];

const EDGES: Edge[] = [
  { from: "client",    to: "cdn",       label: "HTTPS" },
  { from: "cdn",       to: "gateway",   label: "Proxy" },
  { from: "client",    to: "gateway",   label: "API" },
  { from: "gateway",   to: "service_a", label: "gRPC" },
  { from: "gateway",   to: "service_b", label: "Enqueue" },
  { from: "service_a", to: "db",        label: "SQL" },
  { from: "service_a", to: "cache",     label: "GET/SET" },
  { from: "service_b", to: "queue",     label: "Consume" },
  { from: "service_b", to: "db",        label: "Write" },
];

function getNodeById(id: string) {
  return NODES.find((n) => n.id === id)!;
}

const NODE_W = 120;
const NODE_H = 48;

export default function ArchitectureDiagram() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <section className="py-24 px-6" style={{ background: "var(--surface)" }}>
      <div className="max-w-6xl mx-auto">
        <SectionLabel label="System Architecture" />
        <h2
          className="text-3xl font-bold mb-3"
          style={{ fontFamily: "var(--font-ibm)", color: "var(--text)" }}
        >
          How Systems Are Designed
        </h2>
        <p className="mb-12 max-w-xl" style={{ color: "var(--text-muted)" }}>
          A living diagram of a production-grade distributed system — the patterns I think in daily.
        </p>

        {/* Diagram canvas */}
        <div
          ref={ref}
          className="relative rounded-xl overflow-hidden"
          style={{
            background: "var(--bg)",
            border: "1px solid var(--border)",
            minHeight: 480,
          }}
        >
          <BlueprintGrid size="sm" />

          <div className="relative z-10 p-6">
            <svg
              viewBox="0 0 860 460"
              width="100%"
              height="auto"
              style={{ overflow: "visible" }}
              aria-label="System architecture diagram"
            >
              {/* Edges */}
              {EDGES.map((edge, i) => {
                const from = getNodeById(edge.from);
                const to = getNodeById(edge.to);
                const x1 = from.x + NODE_W;
                const y1 = from.y + NODE_H / 2;
                const x2 = to.x;
                const y2 = to.y + NODE_H / 2;
                const mx = (x1 + x2) / 2;

                return (
                  <g key={`${edge.from}-${edge.to}`}>
                    <motion.path
                      d={`M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`}
                      fill="none"
                      stroke="var(--accent)"
                      strokeWidth="1.5"
                      strokeOpacity={0.4}
                      initial={{ pathLength: 0 }}
                      animate={inView ? { pathLength: 1 } : {}}
                      transition={{ duration: 0.8, delay: i * 0.06, ease: "easeInOut" }}
                    />
                    {/* Arrow head */}
                    {inView && (
                      <motion.polygon
                        points={`${x2},${y2} ${x2 - 8},${y2 - 4} ${x2 - 8},${y2 + 4}`}
                        fill="var(--accent)"
                        fillOpacity={0.5}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.06 + 0.7 }}
                      />
                    )}
                    {/* Edge label */}
                    {edge.label && inView && (
                      <motion.text
                        x={mx}
                        y={Math.min(y1, y2) - 6}
                        textAnchor="middle"
                        fontSize="9"
                        fontFamily="var(--font-mono)"
                        fill="var(--text-muted)"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.7 }}
                        transition={{ delay: i * 0.06 + 0.8 }}
                      >
                        {edge.label}
                      </motion.text>
                    )}
                  </g>
                );
              })}

              {/* Nodes */}
              {NODES.map((node, i) => {
                const isHovered = hovered === node.id;
                return (
                  <motion.g
                    key={node.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={inView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.4, delay: i * 0.07, ease: "backOut" }}
                    onMouseEnter={() => setHovered(node.id)}
                    onMouseLeave={() => setHovered(null)}
                    style={{ cursor: "default" }}
                  >
                    {/* Node box */}
                    <rect
                      x={node.x}
                      y={node.y}
                      width={NODE_W}
                      height={NODE_H}
                      rx={6}
                      fill="var(--surface)"
                      stroke={isHovered ? "var(--accent)" : "var(--border-strong)"}
                      strokeWidth={isHovered ? 1.5 : 1}
                    />
                    {/* Node label */}
                    <text
                      x={node.x + NODE_W / 2}
                      y={node.y + 18}
                      textAnchor="middle"
                      fontSize="12"
                      fontFamily="var(--font-ibm)"
                      fontWeight="600"
                      fill="var(--text)"
                    >
                      {node.label}
                    </text>
                    {/* Node sublabel */}
                    <text
                      x={node.x + NODE_W / 2}
                      y={node.y + 33}
                      textAnchor="middle"
                      fontSize="9"
                      fontFamily="var(--font-mono)"
                      fill="var(--text-muted)"
                    >
                      {node.sublabel}
                    </text>
                    {/* Status dot */}
                    <circle
                      cx={node.x + NODE_W - 10}
                      cy={node.y + 10}
                      r={3}
                      fill="var(--status-green)"
                    />
                  </motion.g>
                );
              })}
            </svg>
          </div>

          {/* Legend */}
          <div className="absolute bottom-4 right-4 flex items-center gap-4" aria-hidden="true">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ background: "var(--status-green)" }} />
              <span className="font-mono text-[10px]" style={{ color: "var(--text-muted)" }}>OPERATIONAL</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
