import type { Section, Branding } from "@/lib/types";

interface Props {
  section: Section;
  branding: Branding;
}

const BADGES = [
  { icon: "✓", label: "Quality Guaranteed", description: "Every product is carefully curated and quality-checked." },
  { icon: "⚡", label: "Fast Shipping", description: "Quick dispatch and reliable delivery to your door." },
  { icon: "↩", label: "Easy Returns", description: "Hassle-free returns within 30 days of purchase." },
  { icon: "🔒", label: "Secure Payment", description: "Your payment information is always protected." },
];

export default function TrustBadgesSection({ section, branding }: Props) {
  return (
    <section
      style={{
        background: "var(--color-secondary)",
        borderTop: "1px solid var(--color-border)",
        borderBottom: "1px solid var(--color-border)",
        padding: "40px 0",
      }}
    >
      <div className="section-container">
        {section.title && (
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--color-muted)",
              textAlign: "center",
              marginBottom: 28,
            }}
          >
            {section.title}
          </p>
        )}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 32,
          }}
        >
          {BADGES.map((badge) => (
            <div
              key={badge.label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                maxWidth: 160,
                gap: 8,
              }}
            >
              <span
                style={{
                  fontSize: 24,
                  color: "var(--color-accent)",
                  lineHeight: 1,
                }}
              >
                {badge.icon}
              </span>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 13,
                  fontWeight: 700,
                  color: "var(--color-text)",
                  letterSpacing: "0.02em",
                  margin: 0,
                }}
              >
                {badge.label}
              </p>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 12,
                  color: "var(--color-muted)",
                  lineHeight: 1.5,
                  margin: 0,
                }}
              >
                {badge.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
