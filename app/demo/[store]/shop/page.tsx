import { notFound } from "next/navigation";
import { getWebshowPackage, getProducts, getCategories } from "@/lib/data";
import FullCatalogSection from "@/components/sections/FullCatalogSection";

interface Props {
  params: { store: string };
  searchParams: { category?: string };
}

export default function ShopPage({ params, searchParams }: Props) {
  const pkg = getWebshowPackage(params.store);
  if (!pkg) notFound();

  const products = getProducts(params.store);
  const categories = getCategories(params.store);
  const currencyDisplay = pkg.siteConfig.site?.currency_display ?? "TRY";
  const initialCategory = searchParams.category ?? "all";

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
        storeSlug={params.store}
        products={products}
        categories={categories}
        initialCategory={initialCategory}
        currencyDisplay={currencyDisplay}
      />
    </div>
  );
}
