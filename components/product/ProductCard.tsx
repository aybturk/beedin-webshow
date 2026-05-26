"use client";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

interface Props {
  product: Product;
  storeSlug: string;
  currencyDisplay?: string;
  size?: "sm" | "md" | "lg";
  variant?: string;
}

/** Renders price or a "Preview only" label when product is not purchasable. */
function PriceLabel({
  product,
  currencyDisplay,
  fontSize,
  fontWeight = 700,
}: {
  product: Product;
  currencyDisplay: string;
  fontSize: number | string;
  fontWeight?: number;
}) {
  const purchasable = product.is_purchasable ?? product.buy_status === "active";
  // Prefer EUR price when currencyDisplay is EUR and eur_price is available
  const displayPrice =
    currencyDisplay === "EUR" && product.eur_price && product.eur_price > 0
      ? formatPrice(product.eur_price, "EUR")
      : formatPrice(product.price_try, currencyDisplay);

  if (!purchasable) {
    return (
      <span
        style={{
          fontFamily: "var(--font-body)",
          fontSize,
          fontWeight: 400,
          color: "var(--color-muted)",
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          opacity: 0.7,
        }}
      >
        <span
          style={{
            fontSize: typeof fontSize === "number" ? fontSize - 2 : 10,
            fontWeight: 500,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            border: "1px solid currentColor",
            borderRadius: 3,
            padding: "1px 5px",
            lineHeight: 1.4,
          }}
        >
          Preview
        </span>
        <span style={{ textDecoration: "line-through" }}>{displayPrice}</span>
      </span>
    );
  }

  return (
    <span
      style={{
        fontFamily: "var(--font-body)",
        fontSize,
        fontWeight,
        color: "var(--color-text)",
      }}
    >
      {displayPrice}
    </span>
  );
}

export default function ProductCard({
  product,
  storeSlug,
  currencyDisplay = "TRY",
  size = "md",
  variant = "boutique_large",
}: Props) {
  const image = product.images?.[0];
  const href = `/demo/${storeSlug}/product/${product.id}`;
  const imgSize = size === "lg" ? 360 : size === "sm" ? 160 : 260;

  // ── catalog_compact: horizontal layout ────────────────────────────────────
  if (variant === "catalog_compact") {
    return (
      <Link href={href} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            background: "var(--color-secondary)",
            height: 100,
            overflow: "hidden",
            transition: "box-shadow 0.2s ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
          }}
        >
          {/* Fixed size image */}
          <div style={{ position: "relative", width: 100, height: 100, flexShrink: 0, overflow: "hidden" }}>
            {image ? (
              <Image
                src={image.url}
                alt={image.alt || product.title_en}
                fill
                sizes="100px"
                style={{ objectFit: "cover" }}
                unoptimized
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 28,
                  color: "var(--color-muted)",
                  background: "var(--color-border)",
                }}
              >
                🪞
              </div>
            )}
          </div>
          {/* Text */}
          <div style={{ flex: 1, minWidth: 0, padding: "8px 12px 8px 0" }}>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 10,
                color: "var(--color-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                fontWeight: 600,
                marginBottom: 4,
              }}
            >
              {product.category_display}
            </p>
            <p
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: 14,
                fontWeight: 400,
                color: "var(--color-text)",
                lineHeight: 1.3,
                marginBottom: 6,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {product.title_en}
            </p>
            <PriceLabel product={product} currencyDisplay={currencyDisplay} fontSize={13} />
          </div>
        </div>
      </Link>
    );
  }

  // ── editorial_minimal: square image, no category label, elegant ────────────
  if (variant === "editorial_minimal") {
    return (
      <Link href={href} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
        <div
          style={{
            background: "var(--color-secondary)",
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
            (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
            (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
          }}
        >
          {/* Square image */}
          <div
            style={{
              position: "relative",
              width: "100%",
              paddingBottom: "100%",
              background: "var(--color-secondary)",
              overflow: "hidden",
            }}
          >
            {image ? (
              <Image
                src={image.url}
                alt={image.alt || product.title_en}
                fill
                sizes={`${imgSize}px`}
                style={{ objectFit: "cover" }}
                unoptimized
              />
            ) : (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 40,
                  color: "var(--color-muted)",
                }}
              >
                🪞
              </div>
            )}
          </div>
          {/* Info: no category, elegant title */}
          <div style={{ padding: "14px 4px 4px" }}>
            <p
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: size === "lg" ? 17 : size === "sm" ? 14 : 16,
                fontWeight: 400,
                color: "var(--color-text)",
                lineHeight: 1.3,
                marginBottom: 8,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {product.title_en}
            </p>
            <PriceLabel product={product} currencyDisplay={currencyDisplay} fontSize={12} fontWeight={400} />
          </div>
        </div>
      </Link>
    );
  }

  // ── b2b_dense: compact vertical card ──────────────────────────────────────
  if (variant === "b2b_dense") {
    return (
      <Link href={href} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
        <div
          style={{
            background: "var(--color-secondary)",
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLDivElement).style.transform = "translateY(-1px)";
            (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
            (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
          }}
        >
          {/* Square image */}
          <div
            style={{
              position: "relative",
              width: "100%",
              paddingBottom: "100%",
              background: "var(--color-secondary)",
              overflow: "hidden",
            }}
          >
            {image ? (
              <Image
                src={image.url}
                alt={image.alt || product.title_en}
                fill
                sizes="160px"
                style={{ objectFit: "cover" }}
                unoptimized
              />
            ) : (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 28,
                  color: "var(--color-muted)",
                }}
              >
                🪞
              </div>
            )}
          </div>
          {/* Info: compact, price right-aligned */}
          <div style={{ padding: "8px 6px 6px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 4 }}>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 12,
                fontWeight: 400,
                color: "var(--color-text)",
                lineHeight: 1.2,
                flex: 1,
                minWidth: 0,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {product.title_en}
            </p>
            <PriceLabel product={product} currencyDisplay={currencyDisplay} fontSize={12} />
          </div>
        </div>
      </Link>
    );
  }

  // ── boutique_large (default) ───────────────────────────────────────────────
  return (
    <Link
      href={href}
      style={{ textDecoration: "none", color: "inherit", display: "block" }}
    >
      <div
        style={{
          background: "var(--color-secondary)",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
          (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
          (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
        }}
      >
        {/* Image */}
        <div
          style={{
            position: "relative",
            width: "100%",
            paddingBottom: "100%",
            background: "var(--color-secondary)",
            overflow: "hidden",
          }}
        >
          {image ? (
            <Image
              src={image.url}
              alt={image.alt || product.title_en}
              fill
              sizes={`${imgSize}px`}
              style={{ objectFit: "cover" }}
              unoptimized
            />
          ) : (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 40,
                color: "var(--color-muted)",
              }}
            >
              🪞
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ padding: "14px 4px 4px" }}>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: size === "sm" ? 12 : 13,
              color: "var(--color-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              fontWeight: 600,
              marginBottom: product.subcategory_display ? 2 : 4,
            }}
          >
            {product.category_display}
          </p>
          {product.subcategory_display && (
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: size === "sm" ? 10 : 11,
                color: "var(--color-muted)",
                letterSpacing: "0.04em",
                marginBottom: 4,
                opacity: 0.75,
              }}
            >
              {product.subcategory_display}
            </p>
          )}
          <p
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: size === "lg" ? 17 : size === "sm" ? 14 : 16,
              fontWeight: 400,
              color: "var(--color-text)",
              lineHeight: 1.3,
              marginBottom: 8,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {product.title_en}
          </p>
          <PriceLabel product={product} currencyDisplay={currencyDisplay} fontSize={size === "sm" ? 13 : 14} />
        </div>
      </div>
    </Link>
  );
}
