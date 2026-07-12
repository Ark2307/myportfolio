"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GitBranch, Menu, X, Command, Mail } from "lucide-react";
import ThemeToggle from "@/components/ui/ThemeToggle";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Notes" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 flex flex-col items-center pt-3 px-4 pointer-events-none">
        {/* ── Pill nav ── */}
        <motion.nav
          initial={{ y: -16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-3xl flex items-center gap-1 px-3 py-2 rounded-2xl pointer-events-auto"
          style={{
            background: scrolled
              ? "color-mix(in srgb, var(--surface) 88%, transparent)"
              : "color-mix(in srgb, var(--surface) 70%, transparent)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            border: "1px solid var(--border-strong)",
            boxShadow: scrolled
              ? "0 8px 32px rgba(0,0,0,0.22), 0 1px 0 rgba(255,255,255,0.04) inset"
              : "0 2px 8px rgba(0,0,0,0.1)",
            transition: "box-shadow 0.25s ease, background 0.25s ease",
          }}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mr-auto shrink-0" aria-label="Home">
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
              <rect x="2" y="2" width="22" height="22" rx="6" stroke="var(--accent)" strokeWidth="1.5" />
              <path d="M8 13h4M14 13h4M13 8v4M13 14v4" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="13" cy="13" r="1.8" fill="var(--accent)" />
              <path d="M8 8.5L9.5 10" stroke="var(--accent)" strokeWidth="1" strokeLinecap="round" opacity="0.45" />
              <path d="M18 8.5L16.5 10" stroke="var(--accent)" strokeWidth="1" strokeLinecap="round" opacity="0.45" />
            </svg>
            <span
              className="font-mono text-sm font-semibold tracking-tight hidden sm:block"
              style={{ color: "var(--text)" }}
            >
              ark.dev
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden sm:flex items-center gap-0.5">
            {NAV_LINKS.map(({ href, label }) => {
              const active = pathname === href || (href !== "/" && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className="relative px-3.5 py-1.5 rounded-xl text-sm font-medium transition-colors"
                  style={{ color: active ? "var(--text)" : "var(--text-muted)" }}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-active-pill"
                      className="absolute inset-0 rounded-xl"
                      style={{ background: "var(--surface-2)", zIndex: -1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 34 }}
                    />
                  )}
                  {label}
                </Link>
              );
            })}
          </div>

          {/* Right section */}
          <div className="flex items-center gap-1.5 ml-2">
            {/* ⌘K command hint */}
            <button
              aria-label="Command palette"
              className="hidden sm:flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-mono transition-all hover:opacity-80"
              style={{
                color: "var(--text-muted)",
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
              }}
            >
              <Command size={10} />
              <span>K</span>
            </button>

            {/* Available status chip */}
            <div
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono"
              style={{
                background: "rgba(16, 185, 129, 0.08)",
                border: "1px solid rgba(16, 185, 129, 0.22)",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "var(--status-green)", animation: "bca-pulse 2s ease-in-out infinite" }}
              />
              <span style={{ color: "var(--status-green)" }}>available</span>
            </div>

            {/* Theme toggle */}
            <ThemeToggle />

            {/* Email */}
            <a
              href="mailto:kr.aryan2307@gmail.com"
              className="p-1.5 rounded-lg transition-colors hover:opacity-80"
              style={{ color: "var(--text-muted)" }}
              aria-label="Email"
            >
              <Mail size={14} strokeWidth={1.6} />
            </a>

            {/* GitHub */}
            <a
              href="https://github.com/Ark2307"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg transition-colors hover:opacity-80"
              style={{ color: "var(--text-muted)" }}
              aria-label="GitHub"
            >
              <GitBranch size={14} strokeWidth={1.6} />
            </a>

            {/* Mobile hamburger */}
            <button
              className="sm:hidden p-1.5 rounded-lg transition-colors"
              style={{ color: "var(--text-muted)" }}
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </motion.nav>

        {/* ── Mobile dropdown ── */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="w-full max-w-3xl mt-1.5 rounded-2xl p-2 pointer-events-auto"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border-strong)",
                boxShadow: "0 16px 48px rgba(0,0,0,0.28)",
              }}
            >
              {NAV_LINKS.map(({ href, label }) => {
                const active = pathname === href || (href !== "/" && pathname.startsWith(href));
                return (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center px-4 py-3 rounded-xl text-sm font-medium"
                    style={{
                      color: active ? "var(--accent-text)" : "var(--text)",
                      background: active ? "var(--accent-dim)" : "transparent",
                    }}
                  >
                    {label}
                  </Link>
                );
              })}
              <div className="h-px my-1" style={{ background: "var(--border)" }} />
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-sm font-medium" style={{ color: "var(--text)" }}>
                  Theme
                </span>
                <div className="rounded-lg" style={{ border: "1px solid var(--border)" }}>
                  <ThemeToggle />
                </div>
              </div>
              <a
                href="mailto:kr.aryan2307@gmail.com"
                className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-mono"
                style={{ color: "var(--text-muted)" }}
              >
                <Mail size={13} />
                aryan@akto.io
              </a>
              <a
                href="https://github.com/Ark2307"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-mono"
                style={{ color: "var(--text-muted)" }}
              >
                <GitBranch size={13} />
                github.com/Ark2307
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Spacer to push content below fixed navbar */}
      <div className="h-[72px]" />
    </>
  );
}
