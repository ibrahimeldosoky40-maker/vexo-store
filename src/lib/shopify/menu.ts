import { shopifyFetch, shopifySafe } from "./client";
import { buildFallbackMenu } from "./taxonomy";
import type { Locale } from "@/lib/i18n/config";
import type { MenuItem } from "./types";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Raw = any;

const MENU_HANDLE = process.env.SHOPIFY_MENU_HANDLE ?? "main-menu";

/** Strip the Shopify domain so links resolve inside our storefront. */
function toInternalPath(url: string): string {
  try {
    const u = new URL(url);
    const path = `${u.pathname}${u.search}`.replace(/\/$/, "");
    return path || "/";
  } catch {
    return url.startsWith("/") ? url : `/${url}`;
  }
}

function reshapeItems(items: Raw[] | undefined): MenuItem[] {
  return (items ?? []).map((item) => ({
    id: item.id,
    title: item.title,
    path: toInternalPath(item.url ?? "/"),
    children: reshapeItems(item.items),
  }));
}

/** Depth of the deepest branch (1 = flat list). */
function menuDepth(items: MenuItem[]): number {
  return items.length ? 1 + Math.max(...items.map((i) => menuDepth(i.children))) : 0;
}

/**
 * Loads the 3-tier navigation (Category → Brand → Device) from the Shopify
 * menu `SHOPIFY_MENU_HANDLE` (default `main-menu`). If that menu is missing,
 * unreachable, or isn't nested at least 2 levels deep, the built-in taxonomy
 * is used so the Mega Menu always renders.
 */
export async function getMegaMenu(locale?: Locale): Promise<MenuItem[]> {
  const result = await shopifySafe(() =>
    shopifyFetch<Raw>({
      locale,
      revalidate: 600,
      tags: ["menu"],
      variables: { handle: MENU_HANDLE },
      query: /* GraphQL */ `
        query Menu($language: LanguageCode, $handle: String!) @inContext(language: $language) {
          menu(handle: $handle) {
            items {
              id title url
              items {
                id title url
                items { id title url }
              }
            }
          }
        }
      `,
    }),
  );

  const items = reshapeItems(result.data?.menu?.items);
  return menuDepth(items) >= 2 ? items : buildFallbackMenu();
}
