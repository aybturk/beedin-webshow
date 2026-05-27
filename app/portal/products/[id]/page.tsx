"use client";
/**
 * Product Workspace — /portal/products/[id]
 *
 * Tabbed layout: Content | Images | Pricing & Visibility
 *
 * Images tab (Faz 2):
 *   - Full gallery from GET /api/portal/products/{id}/images
 *   - SOURCE (Trendyol CDN) / UPLOADED / GENERATED badges
 *   - Upload new image (POST multipart, max 10 MB, JPEG/PNG/WebP)
 *   - Set as primary (PATCH action=set_primary)
 *   - Archive / restore (PATCH action=archive | restore)
 *   - No hard delete — archive only
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";

type Product = {
  source_id: string;
  title: string;
  title_tr: string;
  brand: string;
  category: string;
  eur_price: number;
  source_price_try: number;
  review_status: string;
  publication_status: string;
  is_purchasable: boolean;
  images: Array<{ url: string; alt?: string }>;
  description_html: string;
  description_plain: string;
  source_url: string;
  can_publish: boolean;
};

type ImageAsset = {
  asset_id: string | null;      // null for legacy inline Trendyol images
  public_url: string;
  image_role: string;           // primary | gallery | generated | hero
  source_type: string;          // trendyol_source | merchant_upload | ai_generated
  storage_provider: string;     // external_cdn | r2
  mime_type: string;
  sort_order: number;
  is_archived: boolean;
  created_at: string | null;
};

type Tab = "content" | "images" | "pricing";

const REVIEW_STATUS_LABEL: Record<string, string> = {
  NOT_REQUIRED: "Cleared",
  AUTO_CLEARED: "Auto-cleared",
  REVIEW_REQUIRED: "Under review",
  BLOCKED: "Blocked",
};

const REVIEW_STATUS_COLOR: Record<string, string> = {
  NOT_REQUIRED: "#16a34a",
  AUTO_CLEARED: "#16a34a",
  REVIEW_REQUIRED: "#d97706",
  BLOCKED: "#dc2626",
};

export default function ProductWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("content");

  // Edit state
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editPrice, setEditPrice] = useState("");

  // Save state
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Publication toggle state
  const [toggling, setToggling] = useState(false);
  const [publishError, setPublishError] = useState("");

  // Images tab state
  const [images, setImages] = useState<ImageAsset[]>([]);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [imagesError, setImagesError] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [assetAction, setAssetAction] = useState<string | null>(null); // asset_id being actioned
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [r2Enabled, setR2Enabled] = useState(false);

  const fetchProduct = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/portal/products/${productId}`);
      if (res.status === 401) { router.push("/portal/login"); return; }
      if (res.status === 404) { setError("Product not found or not accessible."); return; }
      if (!res.ok) throw new Error("Failed to load product");
      const data: Product = await res.json();
      setProduct(data);
      setEditTitle(data.title);
      setEditDescription(data.description_plain);
      setEditCategory(data.category);
      setEditPrice(data.eur_price > 0 ? data.eur_price.toFixed(2) : "");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [productId, router]);

  useEffect(() => { fetchProduct(); }, [fetchProduct]);

  const fetchImages = useCallback(async () => {
    if (!productId) return;
    setImagesLoading(true);
    setImagesError("");
    try {
      const res = await fetch(
        `/api/portal/products/${productId}/images?include_archived=${showArchived}`,
      );
      if (res.status === 401) { router.push("/portal/login"); return; }
      if (!res.ok) throw new Error("Failed to load images");
      const data = await res.json();
      setImages(data.assets ?? []);
      setR2Enabled(data.r2_enabled ?? false);
    } catch (e: unknown) {
      setImagesError(e instanceof Error ? e.message : "Could not load images");
    } finally {
      setImagesLoading(false);
    }
  }, [productId, showArchived, router]);

  useEffect(() => {
    if (tab === "images") fetchImages();
  }, [tab, fetchImages]);

  async function handleUpload(file: File) {
    setUploading(true);
    setUploadError("");
    setUploadSuccess("");
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetch(`/api/portal/products/${productId}/images`, {
        method: "POST",
        body: form,
        // Do NOT set Content-Type — browser sets it with correct boundary
      });
      const data = await res.json();
      if (!res.ok) { setUploadError(data.detail ?? "Upload failed"); return; }
      setUploadSuccess("Image uploaded successfully.");
      setTimeout(() => setUploadSuccess(""), 4000);
      fetchImages();
    } finally {
      setUploading(false);
    }
  }

  async function handleAssetAction(assetId: string, action: "set_primary" | "archive" | "restore") {
    setAssetAction(assetId + ":" + action);
    try {
      const res = await fetch(`/api/portal/products/${productId}/images/${assetId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.detail ?? "Action failed"); return; }
      // Refresh primary in product left panel too if set_primary
      if (action === "set_primary") fetchProduct();
      fetchImages();
    } finally {
      setAssetAction(null);
    }
  }

  async function handleSave() {
    if (!product) return;
    setSaving(true);
    setSaveError("");
    setSaveSuccess(false);

    const priceVal = parseFloat(editPrice);

    const body: Record<string, unknown> = {};
    if (editTitle !== product.title) body.title = editTitle;
    if (editDescription !== product.description_plain) body.description = editDescription;
    if (editCategory !== product.category) body.category = editCategory;
    if (!isNaN(priceVal) && priceVal !== product.eur_price) body.eur_price = priceVal;

    if (Object.keys(body).length === 0) {
      setSaveError("No changes to save.");
      setSaving(false);
      return;
    }

    try {
      const res = await fetch(`/api/portal/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setSaveError(data.detail ?? "Save failed."); return; }
      setSaveSuccess(true);
      // Refresh product to get updated description_html
      await fetchProduct();
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  async function handleTogglePublication() {
    if (!product) return;
    const newStatus = product.publication_status === "PUBLISHED" ? "ARCHIVED" : "PUBLISHED";
    setToggling(true);
    setPublishError("");
    try {
      const res = await fetch(`/api/portal/products/${productId}/publication`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) { setPublishError(data.detail ?? "Failed to update visibility."); return; }
      setProduct((prev) => prev ? { ...prev, publication_status: newStatus } : prev);
    } finally {
      setToggling(false);
    }
  }

  const isDirty =
    product &&
    (editTitle !== product.title ||
      editDescription !== product.description_plain ||
      editCategory !== product.category ||
      (parseFloat(editPrice) || 0) !== product.eur_price);

  if (loading) return (
    <div style={{ padding: 48, textAlign: "center", color: "#888", fontSize: 14 }}>Loading…</div>
  );
  if (error) return (
    <div style={{ padding: 48, textAlign: "center", color: "#dc2626", fontSize: 14 }}>{error}</div>
  );
  if (!product) return null;

  const isVisible = product.publication_status === "PUBLISHED";
  const isBlocked = product.review_status === "BLOCKED";
  const previewPrice = parseFloat(editPrice) || product.eur_price;

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px" }}>
      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 24,
        gap: 16,
      }}>
        <div style={{ minWidth: 0 }}>
          <a href="/portal/products" style={{ fontSize: 12, color: "#888", textDecoration: "none" }}>
            ← Product Catalog
          </a>
          <h1 style={{
            fontSize: 18,
            fontWeight: 600,
            color: "#1a1a1a",
            marginTop: 6,
            marginBottom: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: 600,
          }}>
            {product.title}
          </h1>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
          <button
            onClick={handleSave}
            disabled={saving || !isDirty}
            style={{
              padding: "8px 20px",
              background: isDirty ? "#1a1a1a" : "#e5e5e3",
              color: isDirty ? "#fff" : "#999",
              border: "none",
              borderRadius: 4,
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              cursor: isDirty && !saving ? "pointer" : "not-allowed",
              whiteSpace: "nowrap",
              transition: "all 0.15s",
            }}
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div style={{ marginBottom: 16, padding: "10px 14px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 4, fontSize: 13, color: "#16a34a" }}>
          ✓ Changes saved. Storefront updated.
        </div>
      )}
      {saveError && (
        <div style={{ marginBottom: 16, padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 4, fontSize: 13, color: "#dc2626" }}>
          {saveError}
        </div>
      )}

      {/* ── Main layout ───────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 24 }}>

        {/* ── Left: image + status ─────────────────────────────────────────── */}
        <div>
          {/* Primary image */}
          <div style={{
            aspectRatio: "1",
            background: "#f3f4f6",
            borderRadius: 8,
            overflow: "hidden",
            marginBottom: 16,
            border: "1px solid #e5e5e3",
          }}>
            {product.images?.[0]?.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.images[0].url}
                alt={product.title}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: 40, color: "#ccc" }}>📦</div>
            )}
          </div>

          {/* Image gallery thumbnails */}
          {product.images.length > 1 && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
              {product.images.slice(0, 6).map((img, i) => (
                <div key={i} style={{ width: 52, height: 52, borderRadius: 4, overflow: "hidden", border: "1px solid #e5e5e3", background: "#f3f4f6" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              ))}
              {product.images.length > 6 && (
                <div style={{ width: 52, height: 52, borderRadius: 4, border: "1px solid #e5e5e3", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#888" }}>
                  +{product.images.length - 6}
                </div>
              )}
            </div>
          )}

          {/* Status panel */}
          <div style={{ background: "#fff", border: "1px solid #e5e5e3", borderRadius: 8, padding: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#888", marginBottom: 12 }}>
              Status
            </p>

            {/* Visibility */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: "#555" }}>Storefront</span>
                <span style={{
                  fontSize: 11, fontWeight: 700, letterSpacing: "0.06em",
                  padding: "2px 8px", borderRadius: 10,
                  background: isBlocked ? "#fee2e2" : isVisible ? "#e0f2fe" : "#f3f4f6",
                  color: isBlocked ? "#dc2626" : isVisible ? "#0369a1" : "#888",
                }}>
                  {isBlocked ? "BLOCKED" : isVisible ? "VISIBLE" : "HIDDEN"}
                </span>
              </div>
              {publishError && (
                <p style={{ fontSize: 11, color: "#dc2626", marginBottom: 6 }}>{publishError}</p>
              )}
              <button
                onClick={handleTogglePublication}
                disabled={isBlocked || toggling}
                style={{
                  width: "100%",
                  padding: "8px 0",
                  border: "1px solid",
                  borderColor: isBlocked ? "#e5e5e3" : isVisible ? "#fecaca" : "#bbf7d0",
                  borderRadius: 4,
                  background: isBlocked ? "#f9f9f7" : isVisible ? "#fef2f2" : "#f0fdf4",
                  color: isBlocked ? "#ccc" : isVisible ? "#dc2626" : "#16a34a",
                  fontSize: 11, fontWeight: 600, letterSpacing: "0.05em",
                  textTransform: "uppercase" as const,
                  cursor: isBlocked || toggling ? "not-allowed" : "pointer",
                }}
              >
                {toggling ? "…" : isBlocked ? "Blocked" : isVisible ? "Hide from store" : "Show in store"}
              </button>
            </div>

            {/* Purchasability */}
            <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, color: "#555" }}>Checkout</span>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", padding: "2px 8px", borderRadius: 10, background: "#f3f4f6", color: "#888" }}>
                  PREVIEW ONLY
                </span>
              </div>
              <p style={{ fontSize: 11, color: "#aaa", marginTop: 4 }}>
                Shopify checkout not yet active.
              </p>
            </div>

            {/* Platform review */}
            <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: 12, marginTop: 4 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, color: "#555" }}>Platform</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: REVIEW_STATUS_COLOR[product.review_status] || "#888" }}>
                  {REVIEW_STATUS_LABEL[product.review_status] || product.review_status}
                </span>
              </div>
            </div>
          </div>

          {/* Source link */}
          {product.source_url && (
            <a
              href={product.source_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "block", marginTop: 12, fontSize: 11, color: "#aaa", textDecoration: "none", textAlign: "center" }}
            >
              View source product ↗
            </a>
          )}
        </div>

        {/* ── Right: tabbed editor ─────────────────────────────────────────── */}
        <div>
          {/* Tabs */}
          <div style={{ display: "flex", gap: 0, borderBottom: "2px solid #e5e5e3", marginBottom: 24 }}>
            {(["content", "images", "pricing"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  padding: "10px 20px",
                  border: "none",
                  background: "none",
                  fontSize: 13,
                  fontWeight: tab === t ? 600 : 400,
                  color: tab === t ? "#1a1a1a" : "#888",
                  borderBottom: tab === t ? "2px solid #1a1a1a" : "2px solid transparent",
                  marginBottom: -2,
                  cursor: "pointer",
                  textTransform: "capitalize",
                }}
              >
                {t === "content" ? "Content" : t === "images" ? "Images" : "Pricing & Visibility"}
              </button>
            ))}
          </div>

          {/* ── Content tab ─────────────────────────────────────────────── */}
          {tab === "content" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

              <Field label="English Title" hint="Shown to customers on the storefront.">
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  maxLength={200}
                  style={inputStyle}
                  placeholder="Product title in English"
                />
                {product.title_tr && (
                  <p style={{ fontSize: 11, color: "#aaa", marginTop: 4 }}>
                    Original (TR): {product.title_tr}
                  </p>
                )}
              </Field>

              <Field label="Category">
                <input
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  maxLength={100}
                  style={inputStyle}
                  placeholder="e.g. sunglasses-collection"
                />
              </Field>

              <Field label="Description" hint="Plain text. Bold, links and other formatting not yet supported. HTML is stripped automatically.">
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={8}
                  maxLength={5000}
                  style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
                  placeholder="Product description in English…"
                />
                <p style={{ fontSize: 11, color: "#aaa", marginTop: 4 }}>
                  {editDescription.length} / 5000 characters
                </p>
              </Field>

              {/* Description preview */}
              {editDescription && editDescription !== product.description_plain && (
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: "#888", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Preview (how it appears on storefront)
                  </p>
                  <div style={{
                    padding: 16,
                    background: "#f9f9f7",
                    border: "1px solid #e5e5e3",
                    borderRadius: 6,
                    fontSize: 14,
                    color: "#555",
                    lineHeight: 1.7,
                  }}>
                    {editDescription.split("\n\n").filter(Boolean).map((para, i) => (
                      <p key={i} style={{ margin: "0 0 12px" }}>{para}</p>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ── Images tab ──────────────────────────────────────────── */}
          {tab === "images" && (
            <div>
              {/* Upload area */}
              <div style={{ marginBottom: 20, padding: 16, background: "#f9f9f7", border: "1px solid #e5e5e3", borderRadius: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a", margin: 0 }}>
                    Upload New Image
                  </p>
                  {!r2Enabled && (
                    <span style={{ fontSize: 11, color: "#d97706", background: "#fffbeb", border: "1px solid #fde68a", padding: "2px 8px", borderRadius: 10 }}>
                      Storage not configured
                    </span>
                  )}
                </div>
                <p style={{ fontSize: 11, color: "#aaa", marginBottom: 10 }}>
                  JPEG, PNG or WebP · Max 10 MB · Archived, never permanently deleted
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleUpload(f);
                    e.target.value = "";
                  }}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!r2Enabled || uploading}
                  style={{
                    padding: "8px 20px",
                    background: r2Enabled && !uploading ? "#1a1a1a" : "#e5e5e3",
                    color: r2Enabled && !uploading ? "#fff" : "#999",
                    border: "none", borderRadius: 4, fontSize: 12, fontWeight: 600,
                    cursor: r2Enabled && !uploading ? "pointer" : "not-allowed",
                  }}
                >
                  {uploading ? "Uploading…" : "Choose file"}
                </button>
                {uploadSuccess && (
                  <p style={{ fontSize: 12, color: "#16a34a", marginTop: 8 }}>✓ {uploadSuccess}</p>
                )}
                {uploadError && (
                  <p style={{ fontSize: 12, color: "#dc2626", marginTop: 8 }}>✗ {uploadError}</p>
                )}
              </div>

              {/* Gallery header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>
                  Gallery ({images.filter(i => !i.is_archived).length} active
                  {showArchived ? `, ${images.filter(i => i.is_archived).length} archived` : ""})
                </p>
                <button
                  onClick={() => setShowArchived(v => !v)}
                  style={{ fontSize: 11, color: "#888", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
                >
                  {showArchived ? "Hide archived" : "Show archived"}
                </button>
              </div>

              {imagesLoading && (
                <p style={{ color: "#888", fontSize: 13, padding: "24px 0", textAlign: "center" }}>Loading images…</p>
              )}
              {imagesError && (
                <p style={{ color: "#dc2626", fontSize: 13 }}>{imagesError}</p>
              )}
              {!imagesLoading && images.length === 0 && (
                <p style={{ color: "#aaa", fontSize: 13, textAlign: "center", padding: "32px 0" }}>No images found.</p>
              )}

              {/* Image grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
                {images.map((img, i) => {
                  const isPrimary = img.image_role === "primary";
                  const isActioning = assetAction?.startsWith(img.asset_id ?? "___");
                  const badgeText = img.source_type === "merchant_upload" ? "UPLOADED"
                    : img.source_type === "ai_generated" ? "AI" : "SOURCE";
                  const badgeColor = img.source_type === "merchant_upload" ? "#2563eb"
                    : img.source_type === "ai_generated" ? "#7c3aed" : "#888";

                  return (
                    <div
                      key={img.asset_id ?? `legacy-${i}`}
                      style={{
                        border: isPrimary ? "2px solid #1a1a1a" : "1px solid #e5e5e3",
                        borderRadius: 8, overflow: "hidden", background: "#fff",
                        opacity: img.is_archived ? 0.45 : 1, position: "relative",
                      }}
                    >
                      <div style={{ aspectRatio: "1", background: "#f3f4f6", overflow: "hidden" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img.public_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>

                      {/* Badges */}
                      <div style={{ position: "absolute", top: 6, left: 6, display: "flex", gap: 3, flexWrap: "wrap" }}>
                        {isPrimary && (
                          <span style={{ fontSize: 9, fontWeight: 700, background: "#1a1a1a", color: "#fff", padding: "2px 6px", borderRadius: 8 }}>
                            PRIMARY
                          </span>
                        )}
                        <span style={{ fontSize: 9, fontWeight: 700, background: "#fff", color: badgeColor, border: `1px solid ${badgeColor}`, padding: "2px 6px", borderRadius: 8 }}>
                          {badgeText}
                        </span>
                        {img.is_archived && (
                          <span style={{ fontSize: 9, fontWeight: 700, background: "#fee2e2", color: "#dc2626", padding: "2px 6px", borderRadius: 8 }}>
                            ARCHIVED
                          </span>
                        )}
                      </div>

                      {/* Actions — only for tracked assets (asset_id !== null) */}
                      {img.asset_id && (
                        <div style={{ padding: "6px 8px", display: "flex", flexDirection: "column", gap: 4 }}>
                          {!isPrimary && !img.is_archived && (
                            <button
                              onClick={() => handleAssetAction(img.asset_id!, "set_primary")}
                              disabled={!!isActioning}
                              style={actionBtnStyle("#1a1a1a", "#fff", !!isActioning)}
                            >
                              {isActioning ? "…" : "Set primary"}
                            </button>
                          )}
                          {!img.is_archived ? (
                            <button
                              onClick={() => handleAssetAction(img.asset_id!, "archive")}
                              disabled={!!isActioning || isPrimary}
                              style={actionBtnStyle("#dc2626", "#fef2f2", !!isActioning || isPrimary)}
                            >
                              {isActioning ? "…" : "Archive"}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleAssetAction(img.asset_id!, "restore")}
                              disabled={!!isActioning}
                              style={actionBtnStyle("#16a34a", "#f0fdf4", !!isActioning)}
                            >
                              {isActioning ? "…" : "Restore"}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Pricing & Visibility tab ─────────────────────────────── */}
          {tab === "pricing" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

              <Field label="EUR Price" hint="This is the preview price shown on your storefront. Actual checkout price is activated later when Shopify sync is set up.">
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 16, color: "#888" }}>€</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    style={{ ...inputStyle, width: 120 }}
                    placeholder="0.00"
                  />
                </div>
                {product.source_price_try > 0 && (
                  <p style={{ fontSize: 11, color: "#aaa", marginTop: 4 }}>
                    Source (TRY): ₺{product.source_price_try.toFixed(2)}
                  </p>
                )}
              </Field>

              {/* Price preview */}
              <div style={{ padding: 16, background: "#f9f9f7", border: "1px solid #e5e5e3", borderRadius: 6 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: "#888", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  How it appears to customers
                </p>
                <p style={{ fontSize: 24, fontWeight: 500, color: previewPrice > 0 ? "#888" : "#ccc", margin: "0 0 4px" }}>
                  {previewPrice > 0 ? `€${previewPrice.toFixed(2)}` : "No price set"}
                </p>
                <p style={{ fontSize: 11, color: "#aaa" }}>PREVIEW PRICE · NOT YET ON SALE</p>
              </div>

              {/* Visibility summary */}
              <div style={{ padding: 16, background: "#fff", border: "1px solid #e5e5e3", borderRadius: 6 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: "#888", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Visibility rules
                </p>
                <RuleRow
                  ok={!isBlocked}
                  label="Platform status"
                  value={isBlocked ? "Blocked — contact support" : "Cleared"}
                />
                <RuleRow
                  ok={previewPrice > 0}
                  label="Price set"
                  value={previewPrice > 0 ? `€${previewPrice.toFixed(2)}` : "Required to be visible"}
                />
                <RuleRow
                  ok={true}
                  label="Checkout"
                  value="Preview only — Shopify Bridge pending"
                  neutral
                />
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Small helpers ──────────────────────────────────────────────────────────────

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#1a1a1a", marginBottom: 6 }}>
        {label}
      </label>
      {hint && <p style={{ fontSize: 11, color: "#aaa", marginBottom: 6 }}>{hint}</p>}
      {children}
    </div>
  );
}

function RuleRow({
  ok,
  label,
  value,
  neutral,
}: {
  ok: boolean;
  label: string;
  value: string;
  neutral?: boolean;
}) {
  const color = neutral ? "#888" : ok ? "#16a34a" : "#dc2626";
  const icon = neutral ? "○" : ok ? "✓" : "✗";
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #f3f4f6" }}>
      <span style={{ fontSize: 12, color: "#555" }}>{label}</span>
      <span style={{ fontSize: 12, color }}>
        {icon} {value}
      </span>
    </div>
  );
}

function actionBtnStyle(color: string, bg: string, disabled: boolean): React.CSSProperties {
  return {
    width: "100%",
    padding: "5px 0",
    border: `1px solid ${disabled ? "#e5e5e3" : color}`,
    borderRadius: 4,
    background: disabled ? "#f9f9f7" : bg,
    color: disabled ? "#ccc" : color,
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: "0.04em",
    textTransform: "uppercase" as const,
    cursor: disabled ? "not-allowed" : "pointer",
  };
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  border: "1px solid #d5d5d3",
  borderRadius: 4,
  fontSize: 14,
  color: "#1a1a1a",
  background: "#fff",
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
};
