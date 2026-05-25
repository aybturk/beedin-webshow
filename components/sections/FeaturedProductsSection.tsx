"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Section, Product } from "@/lib/types";
import ProductCard from "@/components/product/ProductCard";
import { fadeUp, staggerFast, defaultViewport } from "@/lib/animations";

interface Props {
  section: Section;
  storeSlug: string;
  products: Product[];
  currencyDisplay?: string;
  cardVariant?: string;
}

export default function FeaturedProductsSection({
  section,
  storeSlug,
  products,
  currencyDisplay = "TRY",
  cardVariant,
}: Props) {
  if (products.length === 0) return null;

  return (
    <section style={{ padding: "80px 0", background: "var(--color-secondary)" }}>
      <div className="section-container">
        {/* Header */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 40, flexWrap: "wrap", gap: 16 }}
        >
          {section.title && (
            <div>
              <h2 className="section-title">{section.title}</h2>
              <div style={{ width: 40, height: 1, background: "var(--color-accent)", marginTop: 12 }} />
            </div>
          )}
          <Link
            href={`/demo/${storeSlug}/shop`}
            style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-muted)", textDecoration: "none", borderBottom: "1px solid var(--color-border)", paddingBottom: 2 }}
          >
            View All →
          </Link>
        </motion.div>

        {/* Product grid with stagger */}
        <motion.div
          variants={staggerFast}
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 24 }}
        >
          {products.map((p) => (
            <motion.div key={p.id} variants={fadeUp}>
              <ProductCard
                product={p}
                storeSlug={storeSlug}
                currencyDisplay={currencyDisplay}
                variant={cardVariant}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
