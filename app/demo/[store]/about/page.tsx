import { notFound } from "next/navigation";
import { getWebshowPackage } from "@/lib/data";
import BrandStorySection from "@/components/sections/BrandStorySection";
import ContactCtaSection from "@/components/sections/ContactCtaSection";

interface Props { params: Promise<{ store: string }> }

export default async function AboutPage({ params }: Props) {
  const { store } = await params;
  const pkg = await getWebshowPackage(store);
  if (!pkg) notFound();

  const { branding, siteConfig } = pkg;
  const brandStorySection = siteConfig.sections?.find((s) => s.type === "brand_story");
  const contactSection = siteConfig.sections?.find((s) => s.type === "contact_cta");

  return (
    <div>
      {/* Hero banner */}
      <div
        style={{
          padding: "64px 0",
          background: "var(--color-secondary)",
          borderBottom: "1px solid var(--color-border)",
          textAlign: "center",
        }}
      >
        <div className="section-container">
          <p style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-accent)", marginBottom: 12 }}>
            Our Story
          </p>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 400, color: "var(--color-text)", marginBottom: 16 }}>
            {branding.store_display_name}
          </h1>
          {branding.tagline && (
            <p style={{ fontFamily: "var(--font-heading)", fontSize: 17, fontStyle: "italic", color: "var(--color-muted)" }}>
              &ldquo;{branding.tagline}&rdquo;
            </p>
          )}
        </div>
      </div>

      {brandStorySection ? (
        <BrandStorySection section={brandStorySection} branding={branding} />
      ) : (
        <BrandStorySection
          section={{
            type: "brand_story",
            headline: `About ${branding.store_display_name}`,
            body: `${branding.store_display_name} is a curated collection of quality products.`,
          }}
          branding={branding}
        />
      )}

      {contactSection && (
        <ContactCtaSection section={contactSection} siteConfig={siteConfig} branding={branding} />
      )}
    </div>
  );
}
