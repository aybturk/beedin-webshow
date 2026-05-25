import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getWebshowPackage } from "@/lib/data";
import { buildThemeVars, themeClass, googleFontsUrl } from "@/lib/theme";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import PageTransition from "@/components/layout/PageTransition";

interface Props {
  children: React.ReactNode;
  params: Promise<{ store: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { store } = await params;
  const pkg = await getWebshowPackage(store);
  if (!pkg) return { title: "Demo Site" };
  return {
    title: pkg.siteConfig.site?.title ?? pkg.branding.store_display_name,
    description: pkg.siteConfig.site?.description ?? "",
  };
}

export default async function StoreLayout({ children, params }: Props) {
  const { store } = await params;
  const pkg = await getWebshowPackage(store);
  if (!pkg) notFound();

  const { branding, siteConfig } = pkg;
  const themeVars = buildThemeVars(branding);
  const tc = themeClass(branding.theme_id);
  const fontsUrl = googleFontsUrl(branding);

  return (
    <div
      className={tc}
      style={themeVars as React.CSSProperties}
    >
      {fontsUrl && (
        <>
          {/* preconnect */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href={fontsUrl} rel="stylesheet" />
        </>
      )}
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          background: "var(--color-bg)",
          color: "var(--color-text)",
          fontFamily: "var(--font-body)",
        }}
      >
        <SiteHeader
          storeSlug={store}
          siteConfig={siteConfig}
          branding={branding}
        />
        <main style={{ flex: 1 }}>
          <PageTransition>{children}</PageTransition>
        </main>
        <SiteFooter
          storeSlug={store}
          siteConfig={siteConfig}
          branding={branding}
        />
      </div>
    </div>
  );
}
