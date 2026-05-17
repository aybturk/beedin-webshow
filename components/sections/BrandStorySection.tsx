import type { Section, Branding } from "@/lib/types";

interface Props {
  section: Section;
  branding: Branding;
}

export default function BrandStorySection({ section, branding }: Props) {
  if (!section.headline && !section.body) return null;

  return (
    <section
      style={{
        padding: "96px 0",
        background: "var(--color-bg)",
      }}
    >
      <div
        className="section-container"
        style={{
          maxWidth: 680,
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        {/* Decorative line */}
        <div
          style={{
            width: 1,
            height: 48,
            background: "var(--color-accent)",
            margin: "0 auto 32px",
          }}
        />
        {section.headline && (
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(24px, 3vw, 38px)",
              fontWeight: 400,
              color: "var(--color-text)",
              marginBottom: 24,
              letterSpacing: "-0.01em",
              lineHeight: 1.2,
            }}
          >
            {section.headline}
          </h2>
        )}
        {section.body && (
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 16,
              color: "var(--color-muted)",
              lineHeight: 1.8,
              marginBottom: 32,
            }}
          >
            {section.body}
          </p>
        )}
        {branding.brand_voice && (
          <p
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: 14,
              fontStyle: "italic",
              color: "var(--color-accent)",
              letterSpacing: "0.04em",
            }}
          >
            {branding.brand_voice}
          </p>
        )}
        <div
          style={{
            width: 1,
            height: 48,
            background: "var(--color-accent)",
            margin: "32px auto 0",
          }}
        />
      </div>
    </section>
  );
}
