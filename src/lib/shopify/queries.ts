import { shopifyFetch } from "./client";
import { PRODUCT_CARD_FIELDS, PRODUCT_FULL_FIELDS } from "./fragments";
import { reshapeCollection, reshapeProduct, reshapeProductSummary } from "./reshape";
import type { Locale } from "@/lib/i18n/config";
import type { Collection, Product, ProductConnection, ProductSummary, ShopInfo } from "./types";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Raw = any;

export type ProductSort = "BEST_SELLING" | "CREATED_AT" | "PRICE" | "TITLE" | "RELEVANCE";

interface ListOptions {
  locale?: Locale;
  first?: number;
  after?: string;
  sortKey?: ProductSort;
  reverse?: boolean;
  /** Shopify search syntax, e.g. `tag:iphone-17-pro-max AND product_type:Case`. */
  query?: string;
}

const LANG = "$language: LanguageCode";
const CTX = "@inContext(language: $language)";

/* ----------------------------------------------------------------------------
 * Shop
 * -------------------------------------------------------------------------- */
export async function getShop(locale?: Locale): Promise<ShopInfo> {
  const data = await shopifyFetch<Raw>({
    locale,
    revalidate: 3600,
    query: /* GraphQL */ `
      query Shop(${LANG}) ${CTX} {
        shop { name paymentSettings { currencyCode } }
      }
    `,
  });
  return { name: data.shop.name, currencyCode: data.shop.paymentSettings.currencyCode };
}

/* ----------------------------------------------------------------------------
 * Products
 * -------------------------------------------------------------------------- */
export async function getProducts({
  locale,
  first = 12,
  after,
  sortKey = "BEST_SELLING",
  reverse = false,
  query,
}: ListOptions = {}): Promise<ProductConnection> {
  const data = await shopifyFetch<Raw>({
    locale,
    tags: ["products"],
    variables: { first, after, sortKey, reverse, query },
    query: /* GraphQL */ `
      ${PRODUCT_CARD_FIELDS}
      query Products(${LANG}, $first: Int!, $after: String, $sortKey: ProductSortKeys, $reverse: Boolean, $query: String) ${CTX} {
        products(first: $first, after: $after, sortKey: $sortKey, reverse: $reverse, query: $query) {
          nodes { ...ProductCardFields }
          pageInfo { hasNextPage endCursor }
        }
      }
    `,
  });
  return {
    products: data.products.nodes.map(reshapeProductSummary),
    pageInfo: data.products.pageInfo,
  };
}

export async function getBestsellers(locale?: Locale, first = 8): Promise<ProductSummary[]> {
  return (await getProducts({ locale, first, sortKey: "BEST_SELLING" })).products;
}

export async function getProduct(handle: string, locale?: Locale): Promise<Product | null> {
  const data = await shopifyFetch<Raw>({
    locale,
    tags: ["products", `product:${handle}`],
    variables: { handle },
    query: /* GraphQL */ `
      ${PRODUCT_FULL_FIELDS}
      query Product(${LANG}, $handle: String!) ${CTX} {
        product(handle: $handle) { ...ProductFullFields }
      }
    `,
  });
  return data.product ? reshapeProduct(data.product) : null;
}

/** "Frequently Bought Together" — Shopify's complementary-product recommendations. */
export async function getComplementaryProducts(
  productId: string,
  locale?: Locale,
): Promise<ProductSummary[]> {
  const data = await shopifyFetch<Raw>({
    locale,
    variables: { productId },
    query: /* GraphQL */ `
      ${PRODUCT_CARD_FIELDS}
      query Complementary(${LANG}, $productId: ID!) ${CTX} {
        productRecommendations(productId: $productId, intent: COMPLEMENTARY) { ...ProductCardFields }
      }
    `,
  });
  return (data.productRecommendations ?? []).map(reshapeProductSummary);
}

/** Related products fallback when no complementary recommendations exist. */
export async function getRelatedProducts(
  productId: string,
  locale?: Locale,
): Promise<ProductSummary[]> {
  const data = await shopifyFetch<Raw>({
    locale,
    variables: { productId },
    query: /* GraphQL */ `
      ${PRODUCT_CARD_FIELDS}
      query Related(${LANG}, $productId: ID!) ${CTX} {
        productRecommendations(productId: $productId, intent: RELATED) { ...ProductCardFields }
      }
    `,
  });
  return (data.productRecommendations ?? []).map(reshapeProductSummary);
}

/* ----------------------------------------------------------------------------
 * Collections
 * -------------------------------------------------------------------------- */
export async function getCollections(locale?: Locale, first = 24): Promise<Collection[]> {
  const data = await shopifyFetch<Raw>({
    locale,
    revalidate: 600,
    variables: { first },
    query: /* GraphQL */ `
      query Collections(${LANG}, $first: Int!) ${CTX} {
        collections(first: $first) {
          nodes { id handle title description image { url altText width height } }
        }
      }
    `,
  });
  return data.collections.nodes.map(reshapeCollection);
}

export async function getCollectionProducts({
  handle,
  locale,
  first = 24,
  after,
  sortKey = "COLLECTION_DEFAULT",
  reverse = false,
  tag,
}: {
  handle: string;
  locale?: Locale;
  first?: number;
  after?: string;
  sortKey?: "COLLECTION_DEFAULT" | "BEST_SELLING" | "CREATED" | "PRICE" | "TITLE";
  reverse?: boolean;
  /** Device filter from the global "Select Your Device" selector. */
  tag?: string;
}): Promise<(ProductConnection & { collection: Collection }) | null> {
  const data = await shopifyFetch<Raw>({
    locale,
    tags: ["collections", `collection:${handle}`],
    variables: {
      handle,
      first,
      after,
      sortKey,
      reverse,
      filters: tag ? [{ tag }] : undefined,
    },
    query: /* GraphQL */ `
      ${PRODUCT_CARD_FIELDS}
      query CollectionProducts(${LANG}, $handle: String!, $first: Int!, $after: String, $sortKey: ProductCollectionSortKeys, $reverse: Boolean, $filters: [ProductFilter!]) ${CTX} {
        collection(handle: $handle) {
          id handle title description image { url altText width height }
          products(first: $first, after: $after, sortKey: $sortKey, reverse: $reverse, filters: $filters) {
            nodes { ...ProductCardFields }
            pageInfo { hasNextPage endCursor }
          }
        }
      }
    `,
  });
  if (!data.collection) return null;
  return {
    collection: reshapeCollection(data.collection),
    products: data.collection.products.nodes.map(reshapeProductSummary),
    pageInfo: data.collection.products.pageInfo,
  };
}

/* ----------------------------------------------------------------------------
 * Live search (header search bar)
 * -------------------------------------------------------------------------- */
export async function searchProducts(
  term: string,
  locale?: Locale,
  limit = 6,
): Promise<ProductSummary[]> {
  if (term.trim().length < 2) return [];
  const data = await shopifyFetch<Raw>({
    locale,
    revalidate: 60,
    variables: { term, limit },
    query: /* GraphQL */ `
      ${PRODUCT_CARD_FIELDS}
      query Search(${LANG}, $term: String!, $limit: Int!) ${CTX} {
        predictiveSearch(query: $term, limit: $limit, types: [PRODUCT]) {
          products { ...ProductCardFields }
        }
      }
    `,
  });
  return (data.predictiveSearch?.products ?? []).map(reshapeProductSummary);
}
