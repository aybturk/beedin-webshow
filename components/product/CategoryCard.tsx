"use client";
import Image from "next/image";
import Link from "next/link";
import type { Category, Product } from "@/lib/types";

interface Props {
  category: Category;
  storeSlug: string;
  coverProduct?: Product | null;
}

export default function CategoryCard({ category, storeSlug, coverProduct }: Props) {
  const href = `/demo/${storeSlug}/shop/${category.id}`;
  const image = coverProduct?.images?.[0];

  return (
    <Link href={href} style={{ textDecoration: "none", color: "inherit" }}>
      <div
        style={{ position: "relative", overflow: "hidden", cursor: "pointer" }}
        onMouseEnter={(e) => {
          const img = (e.currentTarget as HTMLDivElement).querySelector("img") as HTMLImageElement | null;
          if (img) img.style.transform = "scale(1.04)";
        }}
        onMouseLeave={(e) => {
          const img = (e.currentTarget as HTMLDivElement).querySelector("img") as HTMLImageElement | null;
          if (img) img.style.transform = "scale(1)";
        }}
      >
        {/* Image area */}
        <div
          style={{
            position: "relative",
            paddingBottom: "120%",
            background: "var(--color-secondary)",
            overflow: "hidden",
          }}
        >
          {image ? (
            <Image
              src={image.url}
              alt={category.display_name}
              fill
              sizes="320px"
              style={{ objectFit: "cover", transition: "transform 0.4s ease" }}
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
                fontSize: 48,
              }}
            >
              ✦
            </div>
          )}
          {/* Overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 50%)",
            }}
          />
          {/* Label on image */}
          <div
            style={{
              position: "absolute",
              bottom: 16,
              left: 16,
              right: 16,
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: 18,
                fontWeight: 500,
                color: "white",
                marginBottom: 2,
              }}
            >
              {category.display_name}
            </p>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 11,
                color: "rgba(255,255,255,0.75)",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              {category.product_count} {category.product_count === 1 ? "product" : "products"}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
