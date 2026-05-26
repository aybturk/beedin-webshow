"use client";
import { useState, useMemo, useEffect } from "react";
import type { Product, Category } from "@/lib/types";
import ProductCard from "@/components/product/ProductCard";

interface Props {
  storeSlug: string;
  products: Product[];
  categories: Category[];
  initialCategory?: string;
  currencyDisplay?: string;
  cardVariant?: string;
  density?: string;
}

export default function FullCatalogSection({
  storeSlug,
  products,
  categories,
  initialCategory,
  currencyDisplay = "TRY",
  cardVariant,
  density,
}: Props) {
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory ?? "all");

  // Sync filter state when URL search param changes (client-side nav between ?category= URLs)
  useEffect(() => {
    setActiveCategory(initialCategory ?? "all");
  }, [initialCategory]);

  const filtered = useMemo(() => {
    if (activeCategory === "all") return products;
    return products.filter((p) => p.category_id === activeCategory);
  }, [products, activeCategory]);

  if (products.length === 0) return null;

  return (
    <section className="section-pad-v" style={{ background: "var(--color-bg)" }}>
      <div className="section-container">

        {/* Category filter tabs */}
        {categories.length > 1 && (
          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              marginBottom: 40,
              paddingBottom: 24,
              borderBottom: "1px solid var(--color-border)",
            }}
          >
            <button
              onClick={() => setActiveCategory("all")}
              style={{
                padding: "8px 20px",
                fontFamily: "var(--font-body)",
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                cursor: "pointer",
                border: "1px solid",
                borderColor: activeCategory === "all" ? "var(--color-text)" : "var(--color-border)",
                background: activeCategory === "all" ? "var(--color-text)" : "transparent",
                color: activeCategory === "all" ? "var(--color-bg)" : "var(--color-muted)",
                transition: "all 0.15s",
              }}
            >
              All
              <span style={{ marginLeft: 6, opacity: 0.6, fontWeight: 400 }}>
                {products.length}
              </span>
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  padding: "8px 20px",
                  fontFamily: "var(--font-body)",
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  border: "1px solid",
                  borderColor: activeCategory === cat.id ? "var(--color-text)" : "var(--color-border)",
                  background: activeCategory === cat.id ? "var(--color-text)" : "transparent",
                  color: activeCategory === cat.id ? "var(--color-bg)" : "var(--color-muted)",
                  transition: "all 0.15s",
                  whiteSpace: "nowrap",
                }}
              >
                {cat.display_name}
                <span style={{ marginLeft: 6, opacity: 0.6, fontWeight: 400 }}>
                  {cat.product_count}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Product count */}
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 12,
            color: "var(--color-muted)",
            marginBottom: 24,
            letterSpacing: "0.04em",
          }}
        >
          {filtered.length} {filtered.length === 1 ? "product" : "products"}
        </p>

        {/* Product grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              density === "dense"
                ? "repeat(auto-fill, minmax(180px, 1fr))"
                : density === "compact"
                ? "repeat(auto-fill, minmax(200px, 1fr))"
                : "repeat(auto-fill, minmax(220px, 1fr))",
            gap: density === "dense" ? 16 : density === "compact" ? 20 : 28,
          }}
        >
          {filtered.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              storeSlug={storeSlug}
              currencyDisplay={currencyDisplay}
              variant={cardVariant}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
