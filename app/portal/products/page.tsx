"use client";
/**
 * Merchant Portal — Product Catalog Management
 *
 * Lets the merchant see all their products and toggle publication_status.
 * Publication rules (D13):
 *   - PUBLISHED: visible on storefront
 *   - ARCHIVED: hidden from storefront
 *   - BLOCKED (review_status): cannot be published — shown as locked
 *
 * Price editing deferred until Shopify Bridge (D13 price sync-safety rule).
 */
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

type Product = {
  source_id: string;
  title: string;
  brand: string;
  category: string;
  eur_price: number;
  review_status: string;
  publication_status: string;
  thumbnail: string | null;
  can_publish: boolean;
};

type ProductsResponse = {
  total_count: number;
  page: number;
  page_size: number;
  products: Product[];
};

const STATUS_FILTER_OPTIONS = [
  { value: "", label: "All" },
  { value: "PUBLISHED", label: "Published" },
  { value: "ARCHIVED", label: "Archived" },
];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toggling, setToggling] = useState<string | null>(null); // source_id being toggled

  const PAGE_SIZE = 48;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        page: String(page),
        page_size: String(PAGE_SIZE),
        ...(statusFilter ? { publication_status: statusFilter } : {}),
      });
      const res = await fetch(`/api/portal/products?${params}`);
      if (res.status === 401) {
        window.location.href = "/portal/login";
        return;
      }
      if (!res.ok) throw new Error("Failed to load products");
      const data: ProductsResponse = await res.json();
      setProducts(data.products);
      setTotal(data.total_count);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  async function togglePublication(product: Product) {
    const newStatus = product.publication_status === "PUBLISHED" ? "ARCHIVED" : "PUBLISHED";
    setToggling(product.source_id);
    try {
      const res = await fetch(
        `/api/portal/products/${product.source_id}/publication`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      if (!res.ok) {
        const data = await res.json();
        alert(data.detail ?? "Failed to update status");
        return;
      }
      // Optimistic update
      setProducts((prev) =>
        prev.map((p) =>
          p.source_id === product.source_id
            ? { ...p, publication_status: newStatus }
            : p
        )
      );
    } finally {
      setToggling(null);
    }
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const publishedCount = products.filter((p) => p.publication_status === "PUBLISHED").length;
  const archivedCount = products.filter((p) => p.publication_status !== "PUBLISHED").length;

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <Link href="/portal/dashboard" style={{ fontSize: 12, color: "#888", textDecoration: "none" }}>
            ← Dashboard
          </Link>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: "#1a1a1a", marginTop: 4, marginBottom: 0 }}>
            Product Catalog
          </h1>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "#888" }}>
            {total} products total
          </span>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, borderBottom: "1px solid #e5e5e3", paddingBottom: 12 }}>
        {STATUS_FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => { setStatusFilter(opt.value); setPage(1); }}
            style={{
              padding: "6px 14px",
              border: "1px solid",
              borderColor: statusFilter === opt.value ? "#1a1a1a" : "#e5e5e3",
              borderRadius: 20,
              background: statusFilter === opt.value ? "#1a1a1a" : "#fff",
              color: statusFilter === opt.value ? "#fff" : "#555",
              fontSize: 12,
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div style={{ padding: 12, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 4, color: "#dc2626", fontSize: 13, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", padding: 48, color: "#888", fontSize: 14 }}>
          Loading products…
        </div>
      )}

      {/* Product grid */}
      {!loading && products.length === 0 && (
        <div style={{ textAlign: "center", padding: 48, color: "#888", fontSize: 14 }}>
          No products found.
        </div>
      )}

      {!loading && products.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: 16,
            marginBottom: 32,
          }}
        >
          {products.map((product) => (
            <ProductCard
              key={product.source_id}
              product={product}
              onToggle={togglePublication}
              isToggling={toggling === product.source_id}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 8 }}>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            style={paginationBtnStyle(page === 1)}
          >
            ← Prev
          </button>
          <span style={{ fontSize: 13, color: "#555", padding: "6px 12px" }}>
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            style={paginationBtnStyle(page === totalPages)}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

function ProductCard({
  product,
  onToggle,
  isToggling,
}: {
  product: Product;
  onToggle: (p: Product) => void;
  isToggling: boolean;
}) {
  const isPublished = product.publication_status === "PUBLISHED";
  const isBlocked = product.review_status === "BLOCKED";

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e5e3",
        borderRadius: 8,
        overflow: "hidden",
        opacity: isBlocked ? 0.6 : 1,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Thumbnail */}
      <div
        style={{
          aspectRatio: "1",
          background: "#f3f4f6",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {product.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.thumbnail}
            alt={product.title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#ccc", fontSize: 32 }}>
            📦
          </div>
        )}
        {/* Status badge */}
        <div
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            padding: "2px 8px",
            borderRadius: 10,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.06em",
            background: isBlocked ? "#fee2e2" : isPublished ? "#e0f2fe" : "#f3f4f6",
            color: isBlocked ? "#dc2626" : isPublished ? "#0369a1" : "#888",
          }}
        >
          {isBlocked ? "BLOCKED" : isPublished ? "VISIBLE" : "HIDDEN"}
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: "12px 12px 8px", flexGrow: 1 }}>
        <p style={{ fontSize: 11, color: "#888", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {product.category}
        </p>
        <p style={{ fontSize: 13, fontWeight: 500, color: "#1a1a1a", lineHeight: 1.3, marginBottom: 6 }}>
          {product.title.length > 55 ? product.title.slice(0, 55) + "…" : product.title}
        </p>
        <p style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a" }}>
          €{product.eur_price.toFixed(2)}
        </p>
      </div>

      {/* Edit link */}
      <div style={{ padding: "0 12px 6px" }}>
        <a
          href={`/portal/products/${product.source_id}`}
          style={{
            display: "block",
            width: "100%",
            padding: "7px 0",
            textAlign: "center",
            border: "1px solid #e5e5e3",
            borderRadius: 4,
            background: "#fff",
            color: "#1a1a1a",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.05em",
            textTransform: "uppercase" as const,
            textDecoration: "none",
          }}
        >
          Edit →
        </a>
      </div>

      {/* Toggle button */}
      <div style={{ padding: "0 12px 12px" }}>
        <button
          onClick={() => !isBlocked && !isToggling && onToggle(product)}
          disabled={isBlocked || isToggling}
          style={{
            width: "100%",
            padding: "7px 0",
            border: "1px solid",
            borderColor: isBlocked ? "#e5e5e3" : isPublished ? "#fecaca" : "#bbf7d0",
            borderRadius: 4,
            background: isBlocked ? "#f9f9f7" : isPublished ? "#fef2f2" : "#f0fdf4",
            color: isBlocked ? "#ccc" : isPublished ? "#dc2626" : "#16a34a",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.05em",
            textTransform: "uppercase" as const,
            cursor: isBlocked || isToggling ? "not-allowed" : "pointer",
            transition: "all 0.15s",
          }}
        >
          {isToggling
            ? "…"
            : isBlocked
            ? "Blocked"
            : isPublished
            ? "Hide from store"
            : "Show in store"}
        </button>
      </div>
    </div>
  );
}

function paginationBtnStyle(disabled: boolean) {
  return {
    padding: "6px 14px",
    border: "1px solid #e5e5e3",
    borderRadius: 4,
    background: disabled ? "#f9f9f7" : "#fff",
    color: disabled ? "#ccc" : "#555",
    fontSize: 12,
    cursor: disabled ? "not-allowed" : "pointer",
  };
}
