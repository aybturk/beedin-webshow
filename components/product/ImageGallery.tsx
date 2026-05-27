"use client";
/**
 * ImageGallery — interactive product image gallery.
 *
 * Shows the selected image large + a horizontal thumbnail strip.
 * Single-image products display without the strip.
 * Client component because of useState for the active index.
 */
import { useState } from "react";
import Image from "next/image";
import type { ProductImage } from "@/lib/types";

interface Props {
  images: ProductImage[];
  title: string;
}

export default function ImageGallery({ images, title }: Props) {
  const [activeIdx, setActiveIdx] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div
        style={{
          position: "relative",
          paddingBottom: "100%",
          background: "var(--color-secondary)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 64,
            color: "var(--color-muted)",
          }}
        >
          📦
        </div>
      </div>
    );
  }

  const active = images[activeIdx] ?? images[0];

  return (
    <div>
      {/* Main image */}
      <div
        style={{
          position: "relative",
          paddingBottom: "100%",
          background: "var(--color-secondary)",
          overflow: "hidden",
          marginBottom: images.length > 1 ? 8 : 0,
        }}
      >
        <Image
          key={active.url}           /* key forces re-render on switch */
          src={active.url}
          alt={active.alt || title}
          fill
          style={{ objectFit: "cover", transition: "opacity 0.15s ease" }}
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
          unoptimized
        />
      </div>

      {/* Thumbnail strip — only when more than 1 image */}
      {images.length > 1 && (
        <div
          style={{
            display: "flex",
            gap: 6,
            overflowX: "auto",
            paddingBottom: 4,
            /* Hide scrollbar but keep scrollability */
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
          aria-label="Product image thumbnails"
        >
          {images.map((img, i) => (
            <button
              key={`${img.url}-${i}`}
              onClick={() => setActiveIdx(i)}
              aria-label={`View image ${i + 1}`}
              aria-pressed={i === activeIdx}
              style={{
                flexShrink: 0,
                width: 64,
                height: 64,
                padding: 0,
                border:
                  i === activeIdx
                    ? "2px solid var(--color-text)"
                    : "1px solid var(--color-border)",
                borderRadius: 4,
                overflow: "hidden",
                background: "var(--color-secondary)",
                cursor: "pointer",
                opacity: i === activeIdx ? 1 : 0.65,
                transition: "opacity 0.15s ease, border-color 0.15s ease",
              }}
            >
              <Image
                src={img.url}
                alt={img.alt || `Image ${i + 1}`}
                width={64}
                height={64}
                style={{ objectFit: "cover", width: "100%", height: "100%", display: "block" }}
                unoptimized
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
