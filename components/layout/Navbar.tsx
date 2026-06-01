"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Notes" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header
      className="sticky top-0 z-50 w-full"
      style={{
        background: "rgba(var(--bg-raw, 247 248 250) / 0.85)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <nav className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group" aria-label="Home">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
            <rect x="1" y="1" width="20" height="20" rx="3" stroke="var(--accent)" strokeWidth="1.5" />
            <path d="M5 11h4M13 11h4M11 5v4M11 13v4" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="11" cy="11" r="1.5" fill="var(--accent)" />
          </svg>
          <span
            className="font-mono text-sm font-semibold tracking-tight"
            style={{ color: "var(--text)" }}
          >
            ark.dev
          </span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          {NAV_LINKS.map(({ href, label }) => {
            const active = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                style={{
                  color: active ? "var(--accent)" : "var(--text-muted)",
                  background: active ? "var(--accent-dim)" : "transparent",
                }}
              >
                {label}
              </Link>
            );
          })}
          <a
            href="mailto:aryan@akto.io"
            className="ml-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all"
            style={{
              color: "var(--text)",
              background: "var(--surface)",
              border: "1px solid var(--border)",
            }}
          >
            Contact
          </a>
        </div>
      </nav>
    </header>
  );
}
