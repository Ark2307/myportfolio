"use client";

import { useEffect, useId, useState } from "react";

interface MermaidProps {
  chart: string;
}

function readTheme(): "light" | "dark" {
  if (typeof document === "undefined") return "light";
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

/**
 * Renders a ```mermaid fenced block as a real diagram. Mermaid is loaded
 * lazily (client-only, ~500KB) so it never touches the initial page bundle.
 *
 * Theme awareness: `useTheme()` only reflects the value at mount for
 * whichever component calls it — there's no shared store, so a toggle
 * fired from the navbar's ThemeToggle wouldn't otherwise reach a diagram
 * already on screen. We watch the `data-theme` attribute directly instead.
 */
export default function Mermaid({ chart }: MermaidProps) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const rawId = useId().replace(/[^a-zA-Z0-9]/g, "");

  useEffect(() => {
    setTheme(readTheme());
    const observer = new MutationObserver(() => setTheme(readTheme()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { default: mermaid } = await import("mermaid");
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: "strict",
        theme: theme === "dark" ? "dark" : "default",
        themeVariables: {
          fontFamily: "var(--font-inter), system-ui, sans-serif",
          background: "transparent",
        },
      });

      try {
        const { svg: rendered } = await mermaid.render(`mermaid-${rawId}`, chart.trim());
        if (!cancelled) {
          setSvg(rendered);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to render diagram");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [chart, theme, rawId]);

  const wrapperStyle = {
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    padding: "1.25rem",
    overflowX: "auto" as const,
    margin: "0 0 1.5rem",
  };

  if (error) {
    // Fall back to a plain, styled code block rather than a broken render.
    return (
      <pre style={wrapperStyle}>
        <code style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.875rem", color: "var(--text-muted)" }}>
          {chart}
        </code>
      </pre>
    );
  }

  if (!svg) {
    return (
      <div style={{ ...wrapperStyle, minHeight: 120 }} className="animate-pulse" aria-busy="true" />
    );
  }

  return (
    <div
      style={{ ...wrapperStyle, display: "flex", justifyContent: "center" }}
      // Trusted: generated client-side by mermaid from our own post content, not third-party input.
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
