// ── Webshow Package Types ──────────────────────────────────────────────────

export interface WebshowStatus {
  schema_version: string;
  store_slug: string;
  status: "ready" | "generating_brand" | "generating_catalog" | "generating_content" | "validating" | "failed";
  step: string;
  theme_id: ThemeId;
  store_display_name: string;
  tagline: string;
  product_count: number;
  category_count: number;
  generated_at: string;
  error?: string | null;
}

export type ThemeId = "boutique-accessory" | "warm-editorial" | "b2b-clean";

export interface Branding {
  schema_version: string;
  theme_id: ThemeId;
  theme_reasoning: string;
  store_display_name: string;
  tagline: string;
  brand_voice: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  font_heading: string;
  font_body: string;
  logo_text: string;
  hero_image_source_id: string | null;
  visual_style_notes: string;
  generated_at: string;
}

export interface LeadCapture {
  mode: "mailto" | "form";
  email: string | null;
  form_enabled: boolean;
}

export interface NavLink {
  label: string;
  href: string;
}

export type SectionType =
  | "hero"
  | "featured_categories"
  | "featured_products"
  | "brand_story"
  | "full_catalog"
  | "bulk_order_cta"
  | "trust_badges"
  | "contact_cta"
  | "editorial_statement";

export interface Section {
  type: SectionType;
  title?: string;
  headline?: string;
  subheadline?: string;
  body?: string;
  cta_label?: string;
  cta_href?: string;
  source_ids?: string[];
  background_source_id?: string;
  background_mode?: string;
  layout?: string;
  image_fit?: "cover" | "contain";
  image_position?: string;
  content_alignment?: "left" | "center" | "right";
  cta_variant?: "solid_dark" | "outline" | "text_arrow";
}

export interface SiteConfig {
  schema_version: string;
  store_slug: string;
  generated_at: string;
  site: {
    title: string;
    description: string;
    language: string;
    currency_display: string;
    contact_cta_label: string;
    lead_capture: LeadCapture;
  };
  nav: { links: NavLink[] };
  hero: Section;
  featured_categories?: string[];
  sections: Section[];
  footer: {
    tagline: string;
    show_source_link: boolean;
  };
  product_grid?: {
    card_variant?: "boutique_large" | "catalog_compact" | "editorial_minimal" | "b2b_dense";
    density?: "comfortable" | "compact" | "dense";
    show_category?: boolean;
    show_subcategory?: boolean;
  };
  navigation?: {
    max_items?: number;
    collapse_extra_to_shop?: boolean;
  };
}

export interface ProductImage {
  url: string;
  alt: string;
}

export interface Product {
  id: string;
  source_id: string;
  title_en: string;
  title_tr: string;
  description_en: string;
  category_id: string;
  category_display: string;
  subcategory_display?: string;
  category_tr: string;
  brand: string;
  price_try: number;
  images: ProductImage[];
  rating?: number | null;
  review_count?: number | null;
  is_featured: boolean;
  tags: string[];
  buy_status: "demo_only" | "active";
  shopify_product_id: string | null;
  buy_url: string | null;
}

export interface ProductsDoc {
  schema_version: string;
  store_slug: string;
  generated_at: string;
  total_count: number;
  products: Product[];
}

export interface Category {
  id: string;
  display_name: string;
  display_name_tr: string;
  slug: string;
  product_count: number;
  cover_image_source_id: string | null;
  description: string;
}

export interface CategoriesDoc {
  schema_version: string;
  store_slug: string;
  generated_at: string;
  total_count: number;
  categories: Category[];
}

export interface WebshowPackage {
  status: WebshowStatus;
  branding: Branding;
  siteConfig: SiteConfig;
  productsDoc: ProductsDoc;
  categoriesDoc: CategoriesDoc;
}
