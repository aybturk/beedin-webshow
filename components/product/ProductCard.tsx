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
}

export default function ProductCard({
  product,
  storeSlug,
  currencyDisplay = "TRY",
  size = "md",
}: Props) {
  const image = product.images?.[0];
  const href = `/demo/${storeSlug}/product/${product.id}`;
  const imgSize = size === "lg" ? 360 : size === "sm" ? 160 : 260;

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
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: size === "sm" ? 13 : 14,
              fontWeight: 700,
              color: "var(--color-text)",
            }}
          >
            {formatPrice(product.price_try, currencyDisplay)}
          </p>
        </div>
      </div>
    </Link>
  );
}
