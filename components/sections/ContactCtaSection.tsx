"use client";
import type { Section, SiteConfig, Branding } from "@/lib/types";

interface Props {
  section: Section;
  siteConfig: SiteConfig;
  branding: Branding;
}

export default function ContactCtaSection({ section, siteConfig, branding }: Props) {
  const email = siteConfig.site?.lead_capture?.email;
  const ctaHref = email ? `mailto:${email}` : "#contact";

  return (
    <section
      style={{
        padding: "96px 0",
        background: "var(--color-primary)",
        color: "var(--color-bg)",
      }}
    >
      <div
        className="section-container"
        style={{ textAlign: "center", maxWidth: 640, margin: "0 auto" }}
      >
        {section.headline && (
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(26px, 3.5vw, 42px)",
              fontWeight: 400,
              color: "inherit",
              marginBottom: 16,
              lineHeight: 1.15,
            }}
          >
            {section.headline}
          </h2>
        )}
        {section.body && (
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 15,
              color: "rgba(255,255,255,0.65)",
              marginBottom: 36,
              lineHeight: 1.7,
            }}
          >
            {section.body}
          </p>
        )}
        <a
          href={ctaHref}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "14px 36px",
            background: "var(--color-accent)",
            color: "var(--color-primary)",
            fontFamily: "var(--font-body)",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            textDecoration: "none",
            border: "1px solid var(--color-accent)",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
            (e.currentTarget as HTMLAnchorElement).style.color = "var(--color-accent)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.background = "var(--color-accent)";
            (e.currentTarget as HTMLAnchorElement).style.color = "var(--color-primary)";
          }}
        >
          {siteConfig.site?.contact_cta_label || "Request Information"}
        </a>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 11,
            color: "rgba(255,255,255,0.35)",
            marginTop: 20,
            letterSpacing: "0.04em",
          }}
        >
          {branding.store_display_name} — Demo Site
        </p>
      </div>
    </section>
  );
}
