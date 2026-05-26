/**
 * Data layer for the Beedin webshow frontend.
 *
 * v2: Reads from FastAPI Public Storefront API (PostgreSQL-backed).
 *     Falls back to JSON file reads if BACKEND_URL is not set (local dev without backend).
 *
 * All functions are async. Page components must be async server components.
 *
 * Environment variables:
 *   BACKEND_URL  FastAPI backend URL (default: http://localhost:8000)
 *   WEBSHOW_DATA_DIR  Path to JSON data directory (fallback only)
 */

import type {
  WebshowPackage,
  Branding,
  SiteConfig,
  Product,
  Category,
} from "./types";

// ── Config ────────────────────────────────────────────────────────────────────

const BACKEND_URL =
  process.env.BACKEND_URL ?? "http://localhost:8000";

const DATA_DIR =
  process.env.WEBSHOW_DATA_DIR ??
  (typeof process !== "undefined"
    ? require("path").join(process.cwd(), "..", "beedin-sync", "data", "webshows")
    : "");

// ── API fetch helpers ─────────────────────────────────────────────────────────

const IS_PRODUCTION = process.env.NODE_ENV === "production";

async function apiFetch<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${BACKEND_URL}${path}`, {
      // Next.js ISR: revalidate every 60s in production, no cache in dev
      next: IS_PRODUCTION ? { revalidate: 60 } : { revalidate: 0 },
    });
    if (!res.ok) {
      if (IS_PRODUCTION) {
        // In production, log but don't silently fall through to stale JSON
        console.error(`[storefront-api] ${res.status} ${res.statusText} for ${path}`);
      }
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    if (IS_PRODUCTION) {
      // Surface error in production — don't silently serve stale JSON
      console.error(`[storefront-api] fetch failed for ${path}:`, err);
      throw new Error(`Storefront API unavailable: ${path}`);
    }
    // Dev: fall through to JSON fallback
    return null;
  }
}

// ── JSON file fallback (local dev without running backend) ────────────────────

function readJsonSync<T>(filePath: string): T | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require("fs") as typeof import("fs");
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T;
  } catch {
    return null;
  }
}

function storeDir(storeSlug: string): string {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const path = require("path") as typeof import("path");
  return path.join(DATA_DIR, storeSlug);
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function getWebshowPackage(
  storeSlug: string
): Promise<WebshowPackage | null> {
  // Try API first
  const data = await apiFetch<Record<string, unknown>>(
    `/api/storefront/${storeSlug}`
  );

  if (data) {
    // Adapt API response → WebshowPackage shape expected by page components
    const branding = (data.branding ?? {}) as Record<string, unknown>;
    const siteConfigRaw = (data.site_config ?? {}) as Record<string, unknown>;

    const pkg: WebshowPackage = {
      status: {
        schema_version: "2.0",
        store_slug: storeSlug,
        status: "ready" as const,
        step: "done",
        theme_id: ((data.theme_id as string) ?? "") as import("./types").ThemeId,
        store_display_name: (branding.store_display_name as string) ?? storeSlug,
        tagline: (branding.tagline as string) ?? "",
        product_count: Number(data.product_count ?? 0),
        category_count: ((data.categories as unknown[]) ?? []).length,
        generated_at: (data.published_at as string) ?? new Date().toISOString(),
      },
      branding: {
        schema_version: "2.0",
        theme_id: ((data.theme_id as string) ?? "") as import("./types").ThemeId,
        theme_reasoning: (branding.theme_reasoning as string) ?? "",
        store_display_name: (branding.store_display_name as string) ?? storeSlug,
        tagline: (branding.tagline as string) ?? "",
        brand_voice: (branding.brand_voice as string) ?? "",
        primary_color: (branding.primary_color as string) ?? "#FFFFFF",
        secondary_color: (branding.secondary_color as string) ?? "#F5F5F5",
        accent_color: (branding.accent_color as string) ?? "#000000",
        font_heading: (branding.font_heading as string) ?? "Inter",
        font_body: (branding.font_body as string) ?? "Inter",
        logo_text: (branding.logo_text as string) ?? storeSlug,
        hero_image_source_id: (branding.hero_image_source_id as string) ?? null,
        visual_style_notes: (branding.visual_style_notes as string) ?? "",
        generated_at: (data.published_at as string) ?? new Date().toISOString(),
      } as Branding,
      siteConfig: {
        schema_version: "2.0",
        store_slug: storeSlug,
        generated_at: (data.published_at as string) ?? new Date().toISOString(),
        site: {
          title: (siteConfigRaw.title as string) ?? storeSlug,
          description: (siteConfigRaw.description as string) ?? "",
          language: (siteConfigRaw.language as string) ?? "en",
          currency_display: (siteConfigRaw.currency_display as string) ?? "EUR",
          contact_cta_label: (siteConfigRaw.contact_cta_label as string) ?? "Contact",
          lead_capture: (siteConfigRaw.lead_capture as SiteConfig["site"]["lead_capture"]) ?? {
            mode: "mailto",
            email: null,
            form_enabled: false,
          },
        },
        nav: (data.nav as SiteConfig["nav"]) ?? { links: [] },
        hero: (data.hero as SiteConfig["hero"]) ?? {
          type: "hero",
          layout: "hero_centered",
        },
        sections: (data.sections as SiteConfig["sections"]) ?? [],
        footer: {
          tagline: (branding.tagline as string) ?? "",
          show_source_link: false,
        },
      } as SiteConfig,
      productsDoc: {
        schema_version: "2.0",
        store_slug: storeSlug,
        generated_at: new Date().toISOString(),
        total_count: Number(data.product_count ?? 0),
        products: ((data.featured_products as unknown[]) ?? []).map((p) => adaptProduct(p as Record<string, unknown>)),
      },
      categoriesDoc: {
        schema_version: "2.0",
        store_slug: storeSlug,
        generated_at: new Date().toISOString(),
        total_count: ((data.categories as unknown[]) ?? []).length,
        categories: adaptCategories((data.categories as Record<string, unknown>[]) ?? []),
      },
    };
    return pkg;
  }

  // Fallback: read JSON files (dev without backend)
  return getWebshowPackageFallback(storeSlug);
}

function adaptProduct(p: Record<string, unknown>): Product {
  return {
    id: (p.source_id ?? p.id) as string,
    source_id: (p.source_id ?? p.id) as string,
    title_en: (p.title_en ?? p.title ?? "") as string,
    title_tr: (p.title_tr ?? "") as string,
    description_en: (p.description_en ?? "") as string,
    category_id: (p.category_id ?? p.category ?? "") as string,
    category_display: (p.category_display ?? p.category_id ?? "") as string,
    category_tr: (p.category_tr ?? "") as string,
    brand: (p.brand ?? "") as string,
    price_try: Number(p.price_try ?? 0),
    eur_price: Number(p.eur_price ?? 0),
    images: (p.images as Product["images"]) ?? [],
    rating: (p.rating as number | null) ?? null,
    review_count: (p.review_count as number | null) ?? null,
    is_featured: Boolean(p.is_featured ?? false),
    tags: Array.isArray(p.tags)
      ? (p.tags as string[])
      : typeof p.tags === "string" && p.tags
      ? (p.tags as string).split(",").filter(Boolean)
      : [],
    buy_status: ((p.buy_status === "active" || p.buy_status === "APPROVED") ? "active" : "demo_only") as Product["buy_status"],
    is_purchasable: Boolean(p.is_purchasable ?? false),
    shopify_product_id: (p.shopify_product_id as string) ?? null,
    buy_url: (p.buy_url as string) ?? null,
  };
}

function adaptCategories(cats: Record<string, unknown>[]): import("./types").Category[] {
  return cats.map((c) => ({
    id: (c.id ?? c.category_id ?? "") as string,
    display_name: (c.display_name ?? c.id ?? "") as string,
    display_name_tr: (c.display_name_tr ?? "") as string,
    slug: ((c.id ?? "") as string)
      .toLowerCase()
      .replace(/\s+/g, "-"),
    product_count: Number(c.product_count ?? 0),
    cover_image_source_id: (c.cover_image_source_id as string) ?? null,
    description: (c.description ?? "") as string,
  }));
}

export async function getProducts(storeSlug: string): Promise<Product[]> {
  const data = await apiFetch<{ products: Record<string, unknown>[] }>(
    `/api/storefront/${storeSlug}/products?page_size=200`
  );
  if (data?.products) return data.products.map((p) => adaptProduct(p as Record<string, unknown>));

  // Fallback
  const { getProducts: fallback } = await import("./data_fallback");
  return fallback(storeSlug);
}

export async function getProductById(
  storeSlug: string,
  productId: string
): Promise<Product | null> {
  const data = await apiFetch<Record<string, unknown>>(
    `/api/storefront/${storeSlug}/products/${productId}`
  );
  if (data) return adaptProduct(data);

  // Fallback
  const { getProductById: fallback } = await import("./data_fallback");
  return fallback(storeSlug, productId);
}

export async function getProductsByCategory(
  storeSlug: string,
  categoryId: string
): Promise<Product[]> {
  const data = await apiFetch<{ products: Record<string, unknown>[] }>(
    `/api/storefront/${storeSlug}/products?category=${encodeURIComponent(categoryId)}&page_size=200`
  );
  if (data?.products) return data.products.map((p) => adaptProduct(p as Record<string, unknown>));

  // Fallback
  const { getProductsByCategory: fallback } = await import("./data_fallback");
  return fallback(storeSlug, categoryId);
}

export async function getCategories(storeSlug: string): Promise<import("./types").Category[]> {
  const data = await apiFetch<{ categories: Record<string, unknown>[] }>(
    `/api/storefront/${storeSlug}/categories`
  );
  if (data?.categories) return adaptCategories(data.categories);

  // Fallback
  const { getCategories: fallback } = await import("./data_fallback");
  return fallback(storeSlug);
}

export async function getCategoryById(
  storeSlug: string,
  categoryId: string
): Promise<import("./types").Category | null> {
  const cats = await getCategories(storeSlug);
  return cats.find((c) => c.id === categoryId) ?? null;
}

export async function getBranding(storeSlug: string): Promise<Branding | null> {
  const pkg = await getWebshowPackage(storeSlug);
  return pkg?.branding ?? null;
}

export async function getSiteConfig(storeSlug: string): Promise<SiteConfig | null> {
  const pkg = await getWebshowPackage(storeSlug);
  return pkg?.siteConfig ?? null;
}

export async function getAllStoreSlugs(): Promise<string[]> {
  const data = await apiFetch<{ storefronts: { slug: string }[] }>(
    "/api/storefront/storefronts"
  );
  if (data?.storefronts?.length) {
    return data.storefronts.map((s) => s.slug);
  }

  // Fallback: scan JSON dirs
  try {
    const fs = require("fs") as typeof import("fs");
    const path = require("path") as typeof import("path");
    if (!fs.existsSync(DATA_DIR)) return [];
    return fs
      .readdirSync(DATA_DIR, { withFileTypes: true })
      .filter((d: import("fs").Dirent) => d.isDirectory())
      .map((d: import("fs").Dirent) => d.name)
      .filter((slug: string) => {
        const statusPath = path.join(DATA_DIR, slug, "webshow_status.json");
        try {
          const status = JSON.parse(fs.readFileSync(statusPath, "utf-8"));
          return status?.status === "ready";
        } catch {
          return false;
        }
      });
  } catch {
    return [];
  }
}

// ── JSON fallback implementation (isolated to keep main file clean) ───────────

function getWebshowPackageFallback(storeSlug: string): WebshowPackage | null {
  try {
    const path = require("path") as typeof import("path");
    const dir = storeDir(storeSlug);

    type WStatus = import("./types").WebshowStatus;
    type WBranding = import("./types").Branding;
    type WSiteConfig = import("./types").SiteConfig;
    type WProductsDoc = import("./types").ProductsDoc;
    type WCategoriesDoc = import("./types").CategoriesDoc;

    const status = readJsonSync<WStatus>(path.join(dir, "webshow_status.json"));
    if (!status || status.status !== "ready") return null;

    const branding = readJsonSync<WBranding>(path.join(dir, "branding.json"));
    const siteConfig = readJsonSync<WSiteConfig>(path.join(dir, "site_config.json"));
    const productsDoc = readJsonSync<WProductsDoc>(path.join(dir, "products.json"));
    const categoriesDoc = readJsonSync<WCategoriesDoc>(path.join(dir, "categories.json"));

    if (!branding || !siteConfig || !productsDoc || !categoriesDoc) return null;

    return { status, branding, siteConfig, productsDoc, categoriesDoc };
  } catch {
    return null;
  }
}

// formatPrice lives in lib/utils.ts (safe for client components)
export { formatPrice } from "./utils";
