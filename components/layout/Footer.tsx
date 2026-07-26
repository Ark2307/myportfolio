import Link from "next/link";

const BUILD_DATE = new Date().toISOString().split("T")[0];

export default function Footer() {
  return (
    <footer
      style={{ borderTop: "1px solid var(--border)", background: "var(--surface)" }}
    >
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <span
              className="font-mono text-sm font-semibold"
              style={{ color: "var(--text)" }}
            >
              Aryan Khandelwal
            </span>
            <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
              Software Engineer.
              <br />
              Building systems at scale.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <span className="annotation block mb-3">Navigation</span>
            <ul className="space-y-2">
              {[
                { href: "/", label: "Home" },
                { href: "/blog", label: "Architecture Notes" },
                { href: "/#about", label: "About" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm transition-colors hover:underline"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* System meta */}
          <div>
            <span className="annotation block mb-3">System Status</span>
            <div className="space-y-1.5">
              {[
                ["version", "v1.0.0"],
                ["build", "PASSING"],
                ["updated", BUILD_DATE],
                ["runtime", "Next.js 15"],
              ].map(([key, val]) => (
                <div key={key} className="flex gap-3 font-mono text-xs">
                  <span style={{ color: "var(--text-muted)", minWidth: 64 }}>{key}</span>
                  <span style={{ color: key === "build" ? "var(--status-green)" : "var(--text)" }}>
                    {val}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <span className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
            © {new Date().getFullYear()} Aryan Khandelwal — MIT License
          </span>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/Ark2307"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs transition-colors hover:underline"
              style={{ color: "var(--text-muted)" }}
            >
              GitHub
            </a>
            <a
              href="mailto:kr.aryan2307@gmail.com"
              className="font-mono text-xs transition-colors hover:underline"
              style={{ color: "var(--text-muted)" }}
            >
              kr.aryan2307@gmail.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
