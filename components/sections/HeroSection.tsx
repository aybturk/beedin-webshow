"use client";
import Image from "next/image";
import Link from "next/link";
import type { Section, Branding, Product } from "@/lib/types";

interface Props {
  section: Section;
  branding: Branding;
  storeSlug: string;
  heroProduct?: Product | null;
}

export default function HeroSection({ section, branding, storeSlug, heroProduct }: Props) {
  const heroImage = heroProduct?.images?.[0];
  const base = `/demo/${storeSlug}`;
  const ctaHref = section.cta_href
    ? `${base}${section.cta_href === "/" ? "" : section.cta_href}`
    : `${base}/shop`;

  if (branding.theme_id === "b2b-clean") {
    // B2B: split layout
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
            <Link href={ctaHref} className="btn-primary">{section.cta_label || "Shop Now"}</Link>
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

  if (branding.theme_id === "warm-editorial") {
    // Editorial: fullscreen with text overlay
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
            <Link href={ctaHref} style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "white", textDecoration: "none", borderBottom: "1px solid rgba(255,255,255,0.5)", paddingBottom: 2 }}>
              {section.cta_label || "Explore"} →
            </Link>
          </div>
        </div>
      </section>
    );
  }

  // Boutique-accessory: elegant centered/split
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
            <Link href={ctaHref} className="btn-primary">
              {section.cta_label || "Explore Collection"}
            </Link>
            <Link
              href={`${base}/about`}
              className="btn-outline"
            >
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
