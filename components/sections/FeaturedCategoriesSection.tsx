import type { Section, Category, Product } from "@/lib/types";
import CategoryCard from "@/components/product/CategoryCard";

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
          <div style={{ marginBottom: 40, textAlign: "center" }}>
            <h2 className="section-title">{section.title}</h2>
            <div
              style={{
                width: 40,
                height: 1,
                background: "var(--color-accent)",
                margin: "14px auto 0",
              }}
            />
          </div>
        )}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${Math.min(displayed.length, 4)}, 1fr)`,
            gap: 16,
          }}
        >
          {displayed.map((cat) => {
            const prods = productsByCategory[cat.id] ?? [];
            const cover = prods.find((p) => p.images?.length > 0) ?? null;
            return (
              <CategoryCard
                key={cat.id}
                category={cat}
                storeSlug={storeSlug}
                coverProduct={cover}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
