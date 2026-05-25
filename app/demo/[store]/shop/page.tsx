import { notFound } from "next/navigation";
import { getWebshowPackage, getProducts, getCategories } from "@/lib/data";
import FullCatalogSection from "@/components/sections/FullCatalogSection";

interface Props {
  params: Promise<{ store: string }>;
  searchParams: Promise<{ category?: string }>;
}

export default async function ShopPage({ params, searchParams }: Props) {
  const { store } = await params;
  const { category: initialCategory = "all" } = await searchParams;

  const [pkg, products, categories] = await Promise.all([
    getWebshowPackage(store),
    getProducts(store),
    getCategories(store),
  ]);
  if (!pkg) notFound();

  const currencyDisplay = pkg.siteConfig.site?.currency_display ?? "EUR";

  return (
    <div>
      {/* Shop header */}
      <div
        style={{
          padding: "48px 0 0",
          background: "var(--color-secondary)",
          borderBottom: "1px solid var(--color-border)",
          marginBottom: 0,
        }}
      >
        <div className="section-container" style={{ paddingBottom: 32 }}>
          <h1
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(28px, 4vw, 44px)",
              fontWeight: 400,
              color: "var(--color-text)",
              marginBottom: 8,
            }}
          >
            Shop All
          </h1>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 14,
              color: "var(--color-muted)",
            }}
          >
            {products.length} products across {categories.length} categories
          </p>
        </div>
      </div>

      <FullCatalogSection
        storeSlug={store}
        products={products}
        categories={categories}
        initialCategory={initialCategory}
        currencyDisplay={currencyDisplay}
      />
    </div>
  );
}
