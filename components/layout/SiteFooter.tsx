import Link from "next/link";
import type { SiteConfig, Branding } from "@/lib/types";

interface Props {
  storeSlug: string;
  siteConfig: SiteConfig;
  branding: Branding;
}

export default function SiteFooter({ storeSlug, siteConfig, branding }: Props) {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--color-border)",
        background: "var(--color-secondary)",
        padding: "40px 0 24px",
        marginTop: "auto",
      }}
    >
      <div className="section-container">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: 18,
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--color-text)",
            }}
          >
            {branding.logo_text || branding.store_display_name}
          </div>
          {siteConfig.footer?.tagline && (
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 13,
                color: "var(--color-muted)",
                fontStyle: "italic",
                maxWidth: 400,
              }}
            >
              {siteConfig.footer.tagline}
            </p>
          )}
          <div
            style={{
              display: "flex",
              gap: 24,
              flexWrap: "wrap",
              justifyContent: "center",
              marginTop: 8,
            }}
          >
            {siteConfig.nav?.links?.map((link) => (
              <Link
                key={link.href}
                href={
                  link.href.startsWith("/")
                    ? `/demo/${storeSlug}${link.href === "/" ? "" : link.href}`
                    : link.href
                }
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--color-muted)",
                  textDecoration: "none",
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div
            style={{
              marginTop: 24,
              paddingTop: 16,
              borderTop: "1px solid var(--color-border)",
              width: "100%",
              fontFamily: "var(--font-body)",
              fontSize: 11,
              color: "var(--color-muted)",
              textAlign: "center",
            }}
          >
            © {new Date().getFullYear()} {branding.store_display_name} — Demo Site
          </div>
        </div>
      </div>
    </footer>
  );
}
