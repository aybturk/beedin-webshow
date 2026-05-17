import fs from "fs";
import path from "path";
import type {
  WebshowPackage,
  WebshowStatus,
  Branding,
  SiteConfig,
  ProductsDoc,
  CategoriesDoc,
  Product,
  Category,
} from "./types";

const DATA_DIR =
  process.env.WEBSHOW_DATA_DIR ??
  path.join(process.cwd(), "..", "beedin-sync", "data", "webshows");

function storeDir(storeSlug: string): string {
  return path.join(DATA_DIR, storeSlug);
}

function readJson<T>(filePath: string): T | null {
  try {
    if (!fs.existsSync(filePath)) return null;
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

export function getWebshowPackage(storeSlug: string): WebshowPackage | null {
  const dir = storeDir(storeSlug);
  const status = readJson<WebshowStatus>(path.join(dir, "webshow_status.json"));
  if (!status || status.status !== "ready") return null;

  const branding = readJson<Branding>(path.join(dir, "branding.json"));
  const siteConfig = readJson<SiteConfig>(path.join(dir, "site_config.json"));
  const productsDoc = readJson<ProductsDoc>(path.join(dir, "products.json"));
  const categoriesDoc = readJson<CategoriesDoc>(path.join(dir, "categories.json"));

  if (!branding || !siteConfig || !productsDoc || !categoriesDoc) return null;

  return { status, branding, siteConfig, productsDoc, categoriesDoc };
}

export function getProducts(storeSlug: string): Product[] {
  const doc = readJson<ProductsDoc>(
    path.join(storeDir(storeSlug), "products.json")
  );
  return doc?.products ?? [];
}

export function getProductById(storeSlug: string, productId: string): Product | null {
  const products = getProducts(storeSlug);
  return products.find((p) => p.id === productId) ?? null;
}

export function getProductsByCategory(storeSlug: string, categoryId: string): Product[] {
  return getProducts(storeSlug).filter((p) => p.category_id === categoryId);
}

export function getCategories(storeSlug: string): Category[] {
  const doc = readJson<CategoriesDoc>(
    path.join(storeDir(storeSlug), "categories.json")
  );
  return doc?.categories ?? [];
}

export function getCategoryById(storeSlug: string, categoryId: string): Category | null {
  return getCategories(storeSlug).find((c) => c.id === categoryId) ?? null;
}

export function getBranding(storeSlug: string): Branding | null {
  return readJson<Branding>(path.join(storeDir(storeSlug), "branding.json"));
}

export function getSiteConfig(storeSlug: string): SiteConfig | null {
  return readJson<SiteConfig>(path.join(storeDir(storeSlug), "site_config.json"));
}

export function getAllStoreSlugs(): string[] {
  try {
    if (!fs.existsSync(DATA_DIR)) return [];
    return fs
      .readdirSync(DATA_DIR, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .filter((slug) => {
        const statusPath = path.join(DATA_DIR, slug, "webshow_status.json");
        const status = readJson<WebshowStatus>(statusPath);
        return status?.status === "ready";
      });
  } catch {
    return [];
  }
}

// formatPrice lives in lib/utils.ts (safe for client components)
export { formatPrice } from "./utils";
