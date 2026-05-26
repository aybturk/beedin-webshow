import { notFound } from "next/navigation";
import Link from "next/link";
import { getWebshowPackage, getProductsByCategory, getCategoryById } from "@/lib/data";
import ProductCard from "@/components/product/ProductCard";

interface Props {
  params: Promise<{ store: string; category: string }>;
}

export default async function CategoryPage({ params }: Props) {
  const { store, category: categoryId } = await params;

  const [pkg, category, products] = await Promise.all([
    getWebshowPackage(store),
    getCategoryById(store, categoryId),
    getProductsByCategory(store, categoryId),
  ]);
  if (!pkg) notFound();
  if (!category) notFound();

  const currencyDisplay = pkg.siteConfig.site?.currency_display ?? "EUR";

  return (
    <div>
      {/* Category header */}
      <div style={{ padding: "48px 0 32px", background: "var(--color-secondary)", borderBottom: "1px solid var(--color-border)" }}>
        <div className="section-container">
          <nav style={{ display: "flex", gap: 8, alignItems: "center", fontFamily: "var(--font-body)", fontSize: 12, color: "var(--color-muted)", marginBottom: 20 }}>
            <Link href={`/demo/${store}`} style={{ color: "var(--color-muted)", textDecoration: "none" }}>Home</Link>
            <span>/</span>
            <Link href={`/demo/${store}/shop`} style={{ color: "var(--color-muted)", textDecoration: "none" }}>Shop</Link>
            <span>/</span>
            <span style={{ color: "var(--color-text)" }}>{category.display_name}</span>
          </nav>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 400, color: "var(--color-text)", marginBottom: 6 }}>
            {category.display_name}
          </h1>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--color-muted)" }}>
            {products.length} {products.length === 1 ? "product" : "products"}
          </p>
        </div>
      </div>

      {/* Products */}
      <div className="section-pad-v">
        <div className="section-container">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 28 }}>
            {products.map((p) => (
              <ProductCard key={p.id} product={p} storeSlug={store} currencyDisplay={currencyDisplay} />
            ))}
          </div>
          {products.length === 0 && (
            <div style={{ textAlign: "center", padding: "64px 0", color: "var(--color-muted)", fontFamily: "var(--font-body)" }}>
              No products in this category.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
