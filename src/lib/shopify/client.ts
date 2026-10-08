import { GraphQLClient, ClientError } from "graphql-request";
import { getShopifyEndpoint, shopifyConfig } from "@/lib/config";
import { defaultLocale, localeMeta, type Locale } from "@/lib/i18n/config";

export class ShopifyError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "ShopifyError";
  }
}

interface FetchOptions<V> {
  query: string;
  variables?: V;
  locale?: Locale;
  /** ISR seconds. `false` disables caching (use for carts). */
  revalidate?: number | false;
  tags?: string[];
}

/**
 * Typed Storefront API request. Throws `ShopifyError` on network, HTTP or
 * GraphQL errors. Use `shopifySafe` where the UI must degrade gracefully.
 */
export async function shopifyFetch<T, V extends object = Record<string, unknown>>({
  query,
  variables,
  locale = defaultLocale,
  revalidate = 300,
  tags,
}: FetchOptions<V>): Promise<T> {
  const client = new GraphQLClient(getShopifyEndpoint(), {
    headers: {
      "X-Shopify-Storefront-Access-Token": shopifyConfig.token as string,
      "Content-Type": "application/json",
    },
    // Route through Next's fetch so we get Data Cache / ISR semantics.
    fetch: (input, init) =>
      fetch(input, {
        ...init,
        ...(revalidate === false
          ? { cache: "no-store" as const }
          : { next: { revalidate, tags } }),
      }),
  });

  try {
    return await client.request<T>({
      document: query,
      variables: {
        language: localeMeta[locale].shopifyLanguage,
        ...(variables ?? {}),
      } as never,
    });
  } catch (err) {
    if (err instanceof ClientError) {
      const msg =
        err.response.errors?.map((e) => e.message).join("; ") ||
        `Shopify request failed (${err.response.status})`;
      throw new ShopifyError(msg, err.response.status, err.response.errors);
    }
    throw new ShopifyError(
      err instanceof Error ? err.message : "Unknown network error",
      undefined,
      err,
    );
  }
}

export type SafeResult<T> = { data: T; error: null } | { data: null; error: ShopifyError };

/** Never throws — returns `{ data, error }` so pages can render fallbacks. */
export async function shopifySafe<T>(fn: () => Promise<T>): Promise<SafeResult<T>> {
  try {
    return { data: await fn(), error: null };
  } catch (err) {
    const error =
      err instanceof ShopifyError
        ? err
        : new ShopifyError(err instanceof Error ? err.message : "Unknown error");
    if (process.env.NODE_ENV !== "production") console.error("[shopify]", error.message);
    return { data: null, error };
  }
}
