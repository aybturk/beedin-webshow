import { notFound } from "next/navigation";
import Link from "next/link";
import { getWebshowPackage, getProductById, getProductsByCategory } from "@/lib/data";
import { formatPrice } from "@/lib/utils";
import ProductCard from "@/components/product/ProductCard";
import ImageGallery from "@/components/product/ImageGallery";
import type { Product } from "@/lib/types";

function DetailPrice({ product, currencyDisplay }: { product: Product; currencyDisplay: string }) {
  const purchasable = product.is_purchasable ?? product.buy_status === "active";
  const price =
    currencyDisplay === "EUR" && product.eur_price && product.eur_price > 0
      ? formatPrice(product.eur_price, "EUR")
      : formatPrice(product.price_try, currencyDisplay);

  if (!purchasable) {
    return (
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontFamily: "var(--font-heading)", fontSize: 28, fontWeight: 500, color: "var(--color-muted)", opacity: 0.65 }}>
          {price}
        </p>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-muted)", opacity: 0.5, marginTop: 4 }}>
          Preview price · not yet on sale
        </p>
      </div>
    );
  }
  return (
    <p style={{ fontFamily: "var(--font-heading)", fontSize: 28, fontWeight: 500, color: "var(--color-text)", marginBottom: 24 }}>
      {price}
    </p>
  );
}

interface Props {
  params: Promise<{ store: string; productId: string }>;
}

export default async function ProductPage({ params }: Props) {
  const { store, productId } = await params;

  const [pkg, product] = await Promise.all([
    getWebshowPackage(store),
    getProductById(store, productId),
  ]);
  if (!pkg) notFound();
  if (!product) notFound();

  const { branding, siteConfig } = pkg;
  const currencyDisplay = siteConfig.site?.currency_display ?? "EUR";
  const email = siteConfig.site?.lead_capture?.email;
  const ctaHref = email
    ? `mailto:${email}?subject=Inquiry: ${encodeURIComponent(product.title_en)}`
    : `#contact`;

  // Related products (same category, exclude self)
  const related = (await getProductsByCategory(store, product.category_id))
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  return (
    <div>
      {/* Breadcrumb */}
      <div style={{ padding: "16px 0", borderBottom: "1px solid var(--color-border)" }}>
        <div className="section-container">
          <nav style={{ display: "flex", gap: 8, alignItems: "center", fontFamily: "var(--font-body)", fontSize: 12, color: "var(--color-muted)" }}>
            <Link href={`/demo/${store}`} style={{ color: "var(--color-muted)", textDecoration: "none" }}>Home</Link>
            <span>/</span>
            <Link href={`/demo/${store}/shop`} style={{ color: "var(--color-muted)", textDecoration: "none" }}>Shop</Link>
            <span>/</span>
            <Link href={`/demo/${store}/shop/${product.category_id}`} style={{ color: "var(--color-muted)", textDecoration: "none" }}>{product.category_display}</Link>
            <span>/</span>
            <span style={{ color: "var(--color-text)" }}>{product.title_en}</span>
          </nav>
        </div>
      </div>

      {/* Product detail */}
      <div className="section-container section-pad-v">
        <div className="product-detail-grid">

          {/* Image gallery */}
          <div className="sticky-desktop">
            <ImageGallery images={product.images ?? []} title={product.title_en} />
          </div>

          {/* Info */}
          <div style={{ paddingTop: 8 }}>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-accent)", marginBottom: 12 }}>
              {product.category_display}
            </p>
            <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 400, color: "var(--color-text)", marginBottom: 8, lineHeight: 1.2 }}>
              {product.title_en}
            </h1>
            {product.brand && (
              <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--color-muted)", marginBottom: 20 }}>
                by {product.brand}
              </p>
            )}

            {/* Rating */}
            {product.rating && product.rating > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                <div style={{ display: "flex", gap: 2 }}>
                  {[1,2,3,4,5].map((i) => (
                    <span key={i} style={{ fontSize: 14, color: i <= Math.round(product.rating!) ? "var(--color-accent)" : "var(--color-border)" }}>★</span>
                  ))}
                </div>
                <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--color-muted)" }}>
                  {product.rating.toFixed(1)}
                  {product.review_count ? ` (${product.review_count})` : ""}
                </span>
              </div>
            )}

            <div style={{ width: 40, height: 1, background: "var(--color-border)", marginBottom: 20 }} />

            <DetailPrice product={product} currencyDisplay={currencyDisplay} />

            {product.description_en && (
              <div
                style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--color-muted)", lineHeight: 1.7, marginBottom: 32 }}
                dangerouslySetInnerHTML={{ __html: product.description_en }}
              />
            )}

            {/* CTA — always show inquiry button; label reflects purchasable state */}
            <a href={ctaHref} className="btn-primary" style={{ width: "100%", marginBottom: 12, justifyContent: "center" }}>
              {(product.is_purchasable ?? product.buy_status === "active")
                ? (siteConfig.site?.contact_cta_label ?? "Request Information")
                : "Enquire About This Product"}
            </a>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--color-muted)", textAlign: "center", letterSpacing: "0.04em" }}>
              {(product.is_purchasable ?? product.buy_status === "active")
                ? "This is a demo site. No actual purchase will be processed."
                : "This product is in preview — not yet available for purchase."}
            </p>
          </div>
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <div className="section-pad-v" style={{ background: "var(--color-secondary)", borderTop: "1px solid var(--color-border)" }}>
          <div className="section-container">
            <h2 className="section-title" style={{ marginBottom: 8 }}>You may also like</h2>
            <div style={{ width: 40, height: 1, background: "var(--color-accent)", marginBottom: 32 }} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 24 }}>
              {related.map((p) => (
                <ProductCard key={p.id} product={p} storeSlug={store} currencyDisplay={currencyDisplay} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
