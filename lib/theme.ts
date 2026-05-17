import type { ThemeId, Branding } from "./types";

export interface ThemeVars {
  "--color-primary": string;
  "--color-secondary": string;
  "--color-accent": string;
  "--color-bg": string;
  "--color-text": string;
  "--color-muted": string;
  "--color-border": string;
  "--font-heading": string;
  "--font-body": string;
}

// Base defaults per theme (overridden by branding.json values at runtime)
const THEME_DEFAULTS: Record<ThemeId, ThemeVars> = {
  "boutique-accessory": {
    "--color-primary": "#1C1917",
    "--color-secondary": "#F8F5F0",
    "--color-accent": "#C9A96E",
    "--color-bg": "#FDFAF6",
    "--color-text": "#1C1917",
    "--color-muted": "#A8A29E",
    "--color-border": "#E7E5E4",
    "--font-heading": "Cormorant Garamond",
    "--font-body": "Lato",
  },
  "warm-editorial": {
    "--color-primary": "#2C2416",
    "--color-secondary": "#F5F0E8",
    "--color-accent": "#B8956A",
    "--color-bg": "#FAF7F2",
    "--color-text": "#2C2416",
    "--color-muted": "#9E917D",
    "--color-border": "#E8E0D4",
    "--font-heading": "Cormorant Garamond",
    "--font-body": "Source Sans Pro",
  },
  "b2b-clean": {
    "--color-primary": "#0F172A",
    "--color-secondary": "#F1F5F9",
    "--color-accent": "#2563EB",
    "--color-bg": "#FFFFFF",
    "--color-text": "#0F172A",
    "--color-muted": "#64748B",
    "--color-border": "#E2E8F0",
    "--font-heading": "Inter",
    "--font-body": "Inter",
  },
};

export function buildThemeVars(branding: Branding): ThemeVars {
  const base = THEME_DEFAULTS[branding.theme_id] ?? THEME_DEFAULTS["boutique-accessory"];
  return {
    ...base,
    // Override with branding.json colors when available
    ...(branding.primary_color ? { "--color-primary": branding.primary_color } : {}),
    ...(branding.secondary_color ? { "--color-secondary": branding.secondary_color } : {}),
    ...(branding.accent_color ? { "--color-accent": branding.accent_color } : {}),
    ...(branding.font_heading ? { "--font-heading": `"${branding.font_heading}"` } : {}),
    ...(branding.font_body ? { "--font-body": `"${branding.font_body}"` } : {}),
  };
}

export function themeClass(themeId: ThemeId): string {
  const map: Record<ThemeId, string> = {
    "boutique-accessory": "theme-boutique",
    "warm-editorial": "theme-editorial",
    "b2b-clean": "theme-b2b",
  };
  return map[themeId] ?? "theme-boutique";
}

// Google Fonts URL builder
export function googleFontsUrl(branding: Branding): string {
  const fontMap: Record<string, string> = {
    "Playfair Display": "Playfair+Display:wght@400;500;600;700",
    "Cormorant Garamond": "Cormorant+Garamond:wght@300;400;500;600;700",
    "Lato": "Lato:wght@300;400;700",
    "Source Sans Pro": "Source+Sans+Pro:wght@300;400;600;700",
    "Inter": "Inter:wght@300;400;500;600;700",
  };
  const families = new Set<string>();
  if (branding.font_heading && fontMap[branding.font_heading]) {
    families.add(fontMap[branding.font_heading]);
  }
  if (branding.font_body && fontMap[branding.font_body] && branding.font_body !== branding.font_heading) {
    families.add(fontMap[branding.font_body]);
  }
  if (families.size === 0) return "";
  const params = Array.from(families).map((f) => `family=${f}`).join("&");
  return `https://fonts.googleapis.com/css2?${params}&display=swap`;
}
