"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import type { Section, Branding, Product } from "@/lib/types";

interface Props {
  section: Section;
  branding: Branding;
  storeSlug: string;
  heroProduct?: Product | null;
}

function CtaButton({
  href,
  label,
  variant = "solid_dark",
  style,
}: {
  href: string;
  label: string;
  variant?: string;
  style?: React.CSSProperties;
}) {
  if (variant === "outline") {
    return (
      <Link href={href} className="btn-outline" style={style}>
        {label}
      </Link>
    );
  }
  if (variant === "text_arrow") {
    return (
      <Link
        href={href}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          fontFamily: "var(--font-body)",
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "inherit",
          textDecoration: "none",
          ...style,
        }}
      >
        {label} →
      </Link>
    );
  }
  // solid_dark (default)
  return (
    <Link href={href} className="btn-primary" style={style}>
      {label}
    </Link>
  );
}

export default function HeroSection({ section, branding, storeSlug, heroProduct }: Props) {
  const heroImage = heroProduct?.images?.[0];
  const base = `/demo/${storeSlug}`;
  const ctaHref = section.cta_href
    ? `${base}${section.cta_href === "/" ? "" : section.cta_href}`
    : `${base}/shop`;

  // Determine layout: explicit section.layout takes precedence, otherwise theme default
  const layout =
    section.layout ??
    (branding.theme_id === "boutique-accessory"
      ? "hero_split"
      : branding.theme_id === "warm-editorial"
      ? "hero_full_bleed"
      : branding.theme_id === "b2b-clean"
      ? "hero_catalog_clean"
      : "hero_split");

  const ctaVariant = section.cta_variant ?? "solid_dark";

  // ── hero_catalog_clean ────────────────────────────────────────────────────
  if (layout === "hero_catalog_clean") {
    return (
      <section
        style={{
          background: "var(--color-secondary)",
          padding: "64px 0",
        }}
      >
        <div
          className="section-container"
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}
        >
          <div>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-accent)", marginBottom: 12 }}>
              {branding.store_display_name}
            </p>
            <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 700, color: "var(--color-text)", marginBottom: 16, lineHeight: 1.15 }}>
              {section.headline}
            </h1>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 16, color: "var(--color-muted)", marginBottom: 32, lineHeight: 1.7 }}>
              {section.subheadline}
            </p>
            <CtaButton href={ctaHref} label={section.cta_label || "Shop Now"} variant={ctaVariant} />
          </div>
          {heroImage && (
            <div style={{ position: "relative", height: 400, background: "var(--color-border)", overflow: "hidden" }}>
              <Image src={heroImage.url} alt={heroImage.alt} fill style={{ objectFit: "cover" }} unoptimized />
            </div>
          )}
        </div>
      </section>
    );
  }

  // ── hero_full_bleed ───────────────────────────────────────────────────────
  if (layout === "hero_full_bleed") {
    return (
      <section style={{ position: "relative", minHeight: "70vh", display: "flex", alignItems: "flex-end", overflow: "hidden", background: "#2C2416" }}>
        {heroImage && (
          <Image src={heroImage.url} alt={heroImage.alt} fill style={{ objectFit: "cover", opacity: 0.6 }} unoptimized priority />
        )}
        <div style={{ position: "relative", zIndex: 2, width: "100%", padding: "80px 0 60px" }}>
          <div className="section-container">
            <p style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--color-accent)", marginBottom: 16 }}>
              {branding.store_display_name}
            </p>
            <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(40px, 6vw, 80px)", fontWeight: 300, color: "white", marginBottom: 20, lineHeight: 1.05, maxWidth: 700 }}>
              {section.headline}
            </h1>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "rgba(255,255,255,0.7)", marginBottom: 36, maxWidth: 500 }}>
              {section.subheadline}
            </p>
            {ctaVariant === "text_arrow" || ctaVariant === "outline" ? (
              <CtaButton href={ctaHref} label={section.cta_label || "Explore"} variant={ctaVariant} style={{ color: "white" }} />
            ) : (
              <Link href={ctaHref} style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "white", textDecoration: "none", borderBottom: "1px solid rgba(255,255,255,0.5)", paddingBottom: 2 }}>
                {section.cta_label || "Explore"} →
              </Link>
            )}
          </div>
        </div>
      </section>
    );
  }

  // ── hero_product_focus ────────────────────────────────────────────────────
  if (layout === "hero_product_focus") {
    return (
      <section
        style={{
          background: "var(--color-secondary)",
          minHeight: "100vh",
          display: "grid",
          gridTemplateColumns: "35fr 65fr",
          overflow: "hidden",
        }}
      >
        {/* Left slim column */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "80px 48px 80px max(48px, calc((100vw - 1200px) / 2 + 24px))",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--color-muted)",
              marginBottom: 24,
            }}
          >
            {branding.store_display_name}
          </p>
          <h1
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(32px, 3.5vw, 56px)",
              fontWeight: 300,
              color: "var(--color-text)",
              marginBottom: 20,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}
          >
            {section.headline}
          </h1>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 14,
              color: "var(--color-muted)",
              marginBottom: 36,
              lineHeight: 1.7,
            }}
          >
            {section.subheadline}
          </p>
          <CtaButton href={ctaHref} label={section.cta_label || "Explore"} variant={ctaVariant} />
        </div>

        {/* Right large image */}
        {heroImage && (
          <div style={{ position: "relative", overflow: "hidden" }}>
            <Image
              src={heroImage.url}
              alt={heroImage.alt || section.headline || ""}
              fill
              style={{ objectFit: "cover" }}
              priority
              unoptimized
            />
          </div>
        )}
      </section>
    );
  }

  // ── hero_centered ─────────────────────────────────────────────────────────
  if (layout === "hero_centered") {
    return (
      <section
        style={{
          background: "var(--color-secondary)",
          padding: "80px 0 60px",
          textAlign: "center",
        }}
      >
        <div className="section-container" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "var(--color-accent)",
              marginBottom: 20,
            }}
          >
            {branding.store_display_name}
          </p>
          <h1
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(36px, 5vw, 68px)",
              fontWeight: 400,
              color: "var(--color-text)",
              marginBottom: 20,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              maxWidth: 700,
            }}
          >
            {section.headline}
          </h1>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 15,
              color: "var(--color-muted)",
              marginBottom: 36,
              lineHeight: 1.7,
              maxWidth: 500,
            }}
          >
            {section.subheadline}
          </p>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
            <CtaButton href={ctaHref} label={section.cta_label || "Explore Collection"} variant={ctaVariant} />
            <Link href={`${base}/about`} className="btn-outline">
              Our Story
            </Link>
          </div>

          {heroImage && (
            <div
              style={{
                position: "relative",
                width: "100%",
                maxWidth: 800,
                aspectRatio: "16/9",
                marginTop: 48,
                overflow: "hidden",
              }}
            >
              <Image
                src={heroImage.url}
                alt={heroImage.alt || section.headline || ""}
                fill
                style={{ objectFit: "cover" }}
                priority
                unoptimized
              />
            </div>
          )}
        </div>
      </section>
    );
  }

  // ── hero_editorial_stack ──────────────────────────────────────────────────
  if (layout === "hero_editorial_stack") {
    return (
      <section style={{ overflow: "hidden" }}>
        {/* Top: full-width image */}
        <div
          style={{
            position: "relative",
            height: "55vh",
            overflow: "hidden",
          }}
        >
          {heroImage && (
            <Image
              src={heroImage.url}
              alt={heroImage.alt || section.headline || ""}
              fill
              style={{ objectFit: "cover" }}
              priority
              unoptimized
            />
          )}
          {/* Gradient overlay at bottom */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "40%",
              background: "linear-gradient(to bottom, transparent, rgba(0,0,0,0.4))",
            }}
          />
        </div>

        {/* Bottom: dark text block */}
        <div
          style={{
            background: "var(--color-text)",
            padding: "56px 0 60px",
            textAlign: "center",
          }}
        >
          <div className="section-container" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            {branding.tagline && (
              <p
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: 13,
                  fontStyle: "italic",
                  color: "rgba(255,255,255,0.5)",
                  marginBottom: 20,
                  letterSpacing: "0.06em",
                }}
              >
                {branding.tagline}
              </p>
            )}
            <h1
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "clamp(36px, 5vw, 68px)",
                fontWeight: 300,
                color: "white",
                marginBottom: section.subheadline ? 16 : 36,
                lineHeight: 1.05,
                letterSpacing: "-0.02em",
                maxWidth: 700,
              }}
            >
              {section.headline}
            </h1>
            {section.subheadline && (
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 15,
                  color: "rgba(255,255,255,0.65)",
                  marginBottom: 36,
                  maxWidth: 480,
                  lineHeight: 1.7,
                }}
              >
                {section.subheadline}
              </p>
            )}
            {/* On dark background: solid_dark becomes white button, text_arrow stays minimal */}
            {ctaVariant === "text_arrow" ? (
              <Link
                href={ctaHref}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 700,
                  letterSpacing: "0.1em", textTransform: "uppercase",
                  color: "white", textDecoration: "none",
                  borderBottom: "1px solid rgba(255,255,255,0.45)", paddingBottom: 2,
                }}
              >
                {section.cta_label || "Explore"} →
              </Link>
            ) : (
              <Link
                href={ctaHref}
                style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  padding: "14px 36px",
                  background: "white", color: "var(--color-text)",
                  fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 700,
                  letterSpacing: "0.1em", textTransform: "uppercase",
                  textDecoration: "none", border: "1px solid white",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                  (e.currentTarget as HTMLAnchorElement).style.color = "white";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background = "white";
                  (e.currentTarget as HTMLAnchorElement).style.color = "var(--color-text)";
                }}
              >
                {section.cta_label || "Explore Collection"}
              </Link>
            )}
          </div>
        </div>
      </section>
    );
  }

  // ── hero_split (default / boutique) ──────────────────────────────────────
  return (
    <section
      style={{
        background: "var(--color-bg)",
        padding: "0",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: heroImage ? "1fr 1fr" : "1fr",
          minHeight: "calc(100vh - 64px)",
        }}
      >
        {/* Text side */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "80px 60px 80px max(60px, calc((100vw - 1200px) / 2 + 24px))",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "var(--color-accent)",
              marginBottom: 20,
            }}
          >
            {branding.store_display_name}
          </p>
          <h1
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(36px, 4.5vw, 64px)",
              fontWeight: 400,
              color: "var(--color-text)",
              marginBottom: 20,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}
          >
            {section.headline}
          </h1>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 15,
              color: "var(--color-muted)",
              marginBottom: 36,
              lineHeight: 1.7,
              maxWidth: 400,
            }}
          >
            {section.subheadline}
          </p>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <CtaButton href={ctaHref} label={section.cta_label || "Explore Collection"} variant={ctaVariant} />
            <Link href={`${base}/about`} className="btn-outline">
              Our Story
            </Link>
          </div>
          {branding.tagline && (
            <p
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: 13,
                fontStyle: "italic",
                color: "var(--color-muted)",
                marginTop: 40,
              }}
            >
              "{branding.tagline}"
            </p>
          )}
        </div>

        {/* Image side */}
        {heroImage && (
          <div
            style={{
              position: "relative",
              background: "var(--color-secondary)",
              minHeight: 500,
            }}
          >
            <Image
              src={heroImage.url}
              alt={heroImage.alt || section.headline || ""}
              fill
              style={{ objectFit: "cover" }}
              priority
              unoptimized
            />
          </div>
        )}
      </div>
    </section>
  );
}
