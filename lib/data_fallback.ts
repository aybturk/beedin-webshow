/**
 * JSON file fallback data layer.
 * Used only when BACKEND_URL is not set or the backend is unreachable.
 * All functions are synchronous (fs.readFileSync).
 */
import fs from "fs";
import path from "path";
import type { Product, ProductsDoc, CategoriesDoc, Category } from "./types";

const DATA_DIR =
  process.env.WEBSHOW_DATA_DIR ??
  path.join(process.cwd(), "..", "beedin-sync", "data", "webshows");

function storeDir(slug: string) {
  return path.join(DATA_DIR, slug);
}

function readJson<T>(filePath: string): T | null {
  try {
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T;
  } catch {
    return null;
  }
}

export function getProducts(storeSlug: string): Product[] {
  const doc = readJson<ProductsDoc>(path.join(storeDir(storeSlug), "products.json"));
  return doc?.products ?? [];
}

export function getProductById(storeSlug: string, productId: string): Product | null {
  return getProducts(storeSlug).find((p) => p.id === productId) ?? null;
}

export function getProductsByCategory(storeSlug: string, categoryId: string): Product[] {
  return getProducts(storeSlug).filter((p) => p.category_id === categoryId);
}

export function getCategories(storeSlug: string): Category[] {
  const doc = readJson<CategoriesDoc>(path.join(storeDir(storeSlug), "categories.json"));
  return doc?.categories ?? [];
}
