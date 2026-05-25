"use client";
import { motion } from "framer-motion";
import type { Section, Category, Product } from "@/lib/types";
import CategoryCard from "@/components/product/CategoryCard";
import { fadeUp, staggerContainer, defaultViewport } from "@/lib/animations";

interface Props {
  section: Section;
  storeSlug: string;
  categories: Category[];
  productsByCategory: Record<string, Product[]>;
}

export default function FeaturedCategoriesSection({
  section,
  storeSlug,
  categories,
  productsByCategory,
}: Props) {
  const displayed = categories.slice(0, 4);
  if (displayed.length === 0) return null;

  return (
    <section style={{ padding: "80px 0", background: "var(--color-bg)" }}>
      <div className="section-container">
        {section.title && (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            style={{ marginBottom: 40, textAlign: "center" }}
          >
            <h2 className="section-title">{section.title}</h2>
            <div style={{ width: 40, height: 1, background: "var(--color-accent)", margin: "14px auto 0" }} />
          </motion.div>
        )}

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(displayed.length, 4)}, 1fr)`, gap: 16 }}
        >
          {displayed.map((cat) => {
            const prods = productsByCategory[cat.id] ?? [];
            const cover = prods.find((p) => p.images?.length > 0) ?? null;
            return (
              <motion.div key={cat.id} variants={fadeUp}>
                <CategoryCard category={cat} storeSlug={storeSlug} coverProduct={cover} />
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
