import { notFound } from "next/navigation";
import { getWebshowPackage, getProducts, getCategories, getProductById } from "@/lib/data";
import type { Section } from "@/lib/types";

import HeroSection from "@/components/sections/HeroSection";
import FeaturedCategoriesSection from "@/components/sections/FeaturedCategoriesSection";
import FeaturedProductsSection from "@/components/sections/FeaturedProductsSection";
import BrandStorySection from "@/components/sections/BrandStorySection";
import FullCatalogSection from "@/components/sections/FullCatalogSection";
import ContactCtaSection from "@/components/sections/ContactCtaSection";

interface Props { params: { store: string } }

export default function StorePage({ params }: Props) {
  const pkg = getWebshowPackage(params.store);
  if (!pkg) notFound();

  const { branding, siteConfig, productsDoc, categoriesDoc } = pkg;
  const allProducts = productsDoc.products;
  const allCategories = categoriesDoc.categories;
  const currencyDisplay = siteConfig.site?.currency_display ?? "TRY";

  // Build category → products map
  const productsByCategory: Record<string, typeof allProducts> = {};
  for (const cat of allCategories) {
    productsByCategory[cat.id] = allProducts.filter((p) => p.category_id === cat.id);
  }

  // Resolve hero product
  const heroSourceId = siteConfig.hero?.background_source_id ?? branding.hero_image_source_id;
  const heroProduct = heroSourceId ? getProductById(params.store, heroSourceId) : (allProducts[0] ?? null);

  const SECTION_MAP: Record<string, (section: Section) => React.ReactNode> = {
    hero: (s) => (
      <HeroSection
        key="hero"
        section={s}
        branding={branding}
        storeSlug={params.store}
        heroProduct={heroProduct}
      />
    ),
    featured_categories: (s) => (
      <FeaturedCategoriesSection
        key="featured_categories"
        section={s}
        storeSlug={params.store}
        categories={allCategories}
        productsByCategory={productsByCategory}
      />
    ),
    featured_products: (s) => {
      const ids = s.source_ids ?? [];
      const featured = ids.length > 0
        ? ids.map((id) => getProductById(params.store, id)).filter(Boolean) as typeof allProducts
        : allProducts.slice(0, 4);
      return (
        <FeaturedProductsSection
          key="featured_products"
          section={s}
          storeSlug={params.store}
          products={featured}
          currencyDisplay={currencyDisplay}
        />
      );
    },
    brand_story: (s) => (
      <BrandStorySection key="brand_story" section={s} branding={branding} />
    ),
    full_catalog: (_s) => (
      <FullCatalogSection
        key="full_catalog"
        storeSlug={params.store}
        products={allProducts}
        categories={allCategories}
        currencyDisplay={currencyDisplay}
      />
    ),
    contact_cta: (s) => (
      <ContactCtaSection
        key="contact_cta"
        section={s}
        siteConfig={siteConfig}
        branding={branding}
      />
    ),
  };

  const sections = siteConfig.sections ?? [];

  return (
    <>
      {sections.map((section, i) => {
        const renderer = SECTION_MAP[section.type];
        if (!renderer) return null;
        return renderer(section);
      })}
    </>
  );
}
