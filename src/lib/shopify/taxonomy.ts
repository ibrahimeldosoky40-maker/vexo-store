import type { MenuItem } from "./types";

/**
 * Fallback mega-menu taxonomy (Level 1 Category → Level 2 Brand → Level 3 Device).
 *
 * Used until a nested menu (3 levels) is configured in Shopify
 * Admin → Content → Menus. Each leaf maps to a collection handle that must
 * exist in Shopify (or be created via smart collections tagged with the
 * device slug) — see `slugify` below for how handles are derived.
 */
export const slugify = (value: string): string =>
  value
    .toLowerCase()
    .replace(/\+/g, " plus ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

type Taxonomy = Record<string, Record<string, string[]>>;

export const TAXONOMY: Taxonomy = {
  "Phone Cases": {
    Apple: [
      "iPhone 18 Pro Max",
      "iPhone 18 Pro",
      "iPhone 18",
      "iPhone 17 Pro Max",
      "iPhone 17 Pro",
      "iPhone Air",
      "iPhone 17",
      "iPhone 16 Pro Max",
      "iPhone 16",
    ],
    Samsung: [
      "Galaxy S26 Ultra",
      "Galaxy S26+",
      "Galaxy S26",
      "Galaxy S25 Ultra",
      "Galaxy Z Fold 7",
      "Galaxy Z Flip 7",
    ],
    "Google Pixel": ["Pixel 10 Pro XL", "Pixel 10 Pro", "Pixel 10", "Pixel 9 Pro"],
  },
  "Watch Bands": {
    "Apple Watch": ["Ultra 3", "Series 11", "Series 10", "SE 3"].map((n) => `Apple Watch ${n}`),
    "Samsung Galaxy Watch": ["Galaxy Watch 8 Classic", "Galaxy Watch 8", "Galaxy Watch Ultra"],
    Garmin: ["Fenix 8", "Forerunner 970"],
  },
  Chargers: {
    "Wall Chargers": ["GaN 65W", "GaN 100W", "Dual-Port 45W"],
    "Wireless Chargers": ["MagSafe 25W", "3-in-1 Stand", "Qi2 Pad"],
    "Cables & Power Banks": ["USB-C to USB-C", "USB-C to Lightning", "20,000mAh Power Bank"],
  },
  "Laptop Sleeves": {
    Apple: ["MacBook Air 13”", "MacBook Air 15”", "MacBook Pro 14”", "MacBook Pro 16”"],
    "Windows Laptops": ["Dell XPS 13", "Dell XPS 15", "Surface Laptop 13”", "ThinkPad X1 Carbon"],
    Tablets: ["iPad Pro 13”", "iPad Air 11”", "Galaxy Tab S11"],
  },
};

export function buildFallbackMenu(): MenuItem[] {
  return Object.entries(TAXONOMY).map(([category, brands]) => {
    const categorySlug = slugify(category);
    return {
      id: `cat-${categorySlug}`,
      title: category,
      path: `/collections/${categorySlug}`,
      children: Object.entries(brands).map(([brand, devices]) => {
        const brandSlug = slugify(brand);
        return {
          id: `cat-${categorySlug}-${brandSlug}`,
          title: brand,
          path: `/collections/${categorySlug}?brand=${brandSlug}`,
          children: devices.map((device) => ({
            id: `cat-${categorySlug}-${brandSlug}-${slugify(device)}`,
            title: device,
            path: `/collections/${categorySlug}?device=${slugify(device)}`,
            children: [],
          })),
        };
      }),
    };
  });
}

/** Flat, unique list of devices for the global "Select Your Device" selector. */
export function getDeviceOptions(): { brand: string; devices: { label: string; slug: string }[] }[] {
  const phone = TAXONOMY["Phone Cases"];
  return Object.entries(phone).map(([brand, devices]) => ({
    brand,
    devices: devices.map((label) => ({ label, slug: slugify(label) })),
  }));
}
