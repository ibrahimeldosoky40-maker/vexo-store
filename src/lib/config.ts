/**
 * Central, typed access to environment configuration.
 * NEXT_PUBLIC_* values are inlined at build time and are safe for the
 * Storefront API (the public token is designed to be exposed).
 */
export const siteConfig = {
  name: "Vexo Store",
  description:
    "Premium phone cases, smart watch bands, chargers and laptop sleeves — engineered for your device.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  /** Order subtotal (in store currency) that unlocks free shipping. */
  freeShippingThreshold: Number(process.env.NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD ?? 50),
} as const;

export const shopifyConfig = {
  domain: process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN,
  token: process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN,
  apiVersion: process.env.SHOPIFY_STOREFRONT_API_VERSION ?? "2026-07",
} as const;

export function getShopifyEndpoint(): string {
  if (!shopifyConfig.domain || !shopifyConfig.token) {
    throw new Error(
      "Missing Shopify credentials. Set NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN and " +
        "NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN in .env.local.",
    );
  }
  return `https://${shopifyConfig.domain}/api/${shopifyConfig.apiVersion}/graphql.json`;
}
