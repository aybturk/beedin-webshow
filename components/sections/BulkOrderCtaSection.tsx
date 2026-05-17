import Link from "next/link";
import type { Section, Branding } from "@/lib/types";

interface Props {
  section: Section;
  branding: Branding;
  storeSlug: string;
}

export default function BulkOrderCtaSection({ section, storeSlug }: Props) {
  const base = `/demo/${storeSlug}`;
  const ctaHref = section.cta_href
    ? `${base}${section.cta_href === "/" ? "" : section.cta_href}`
    : `${base}/contact`;

  return (
    <section
      style={{
        background: "var(--color-text)",
        padding: "80px 0",
      }}
    >
      <div
        className="section-container"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: 20,
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "clamp(28px, 4vw, 48px)",
            fontWeight: 400,
            color: "white",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            margin: 0,
          }}
        >
          {section.headline || "Need to Order in Bulk?"}
        </h2>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 16,
            color: "rgba(255,255,255,0.7)",
            lineHeight: 1.7,
            maxWidth: 520,
            margin: 0,
          }}
        >
          {section.subheadline || "Contact us for wholesale pricing and volume discounts."}
        </p>
        <Link
          href={ctaHref}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginTop: 8,
            padding: "14px 32px",
            background: "white",
            color: "var(--color-text)",
            fontFamily: "var(--font-body)",
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            textDecoration: "none",
            border: "1px solid white",
            transition: "all 0.2s ease",
          }}
        >
          {section.cta_label || "Get a Quote"}
        </Link>
      </div>
    </section>
  );
}
