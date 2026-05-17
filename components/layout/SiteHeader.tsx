"use client";
import { useState } from "react";
import Link from "next/link";
import type { SiteConfig, Branding } from "@/lib/types";

interface Props {
  storeSlug: string;
  siteConfig: SiteConfig;
  branding: Branding;
}

export default function SiteHeader({ storeSlug, siteConfig, branding }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const base = `/demo/${storeSlug}`;

  return (
    <header
      style={{
        borderBottom: "1px solid var(--color-border)",
        background: "var(--color-bg)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        className="section-container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 64,
        }}
      >
        {/* Logo */}
        <Link
          href={base}
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: 20,
            fontWeight: 600,
            letterSpacing: "0.12em",
            color: "var(--color-text)",
            textDecoration: "none",
            textTransform: "uppercase",
          }}
        >
          {branding.logo_text || branding.store_display_name}
        </Link>

        {/* Desktop Nav */}
        <nav
          style={{
            display: "flex",
            gap: 32,
            alignItems: "center",
          }}
          className="hidden md:flex"
        >
          {siteConfig.nav?.links?.map((link) => (
            <Link
              key={link.href}
              href={link.href.startsWith("/") ? `${base}${link.href === "/" ? "" : link.href}` : link.href}
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--color-muted)",
                textDecoration: "none",
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-text)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-muted)")}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 4,
            color: "var(--color-text)",
          }}
          aria-label="Toggle menu"
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 5, width: 22 }}>
            <span style={{ display: "block", height: 1.5, background: "currentColor", borderRadius: 2, transition: "all 0.2s", transform: menuOpen ? "translateY(6.5px) rotate(45deg)" : "none" }} />
            <span style={{ display: "block", height: 1.5, background: "currentColor", borderRadius: 2, opacity: menuOpen ? 0 : 1, transition: "all 0.2s" }} />
            <span style={{ display: "block", height: 1.5, background: "currentColor", borderRadius: 2, transition: "all 0.2s", transform: menuOpen ? "translateY(-6.5px) rotate(-45deg)" : "none" }} />
          </div>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          style={{
            borderTop: "1px solid var(--color-border)",
            background: "var(--color-bg)",
            padding: "16px 24px 20px",
          }}
        >
          {siteConfig.nav?.links?.map((link) => (
            <Link
              key={link.href}
              href={link.href.startsWith("/") ? `${base}${link.href === "/" ? "" : link.href}` : link.href}
              onClick={() => setMenuOpen(false)}
              style={{
                display: "block",
                padding: "10px 0",
                fontFamily: "var(--font-body)",
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--color-text)",
                textDecoration: "none",
                borderBottom: "1px solid var(--color-border)",
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
