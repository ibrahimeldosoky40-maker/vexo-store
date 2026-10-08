import { normaliseCompareAt } from "./pricing";
import type {
  Cart,
  CartLine,
  Collection,
  Money,
  Product,
  ProductSummary,
  ProductVariant,
  ShopifyImage,
} from "./types";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Raw = any; // Raw Storefront payloads are validated by the query shape, not at runtime.

const nodes = <T = Raw>(connection?: { nodes?: T[] } | null): T[] => connection?.nodes ?? [];

export function reshapeImage(img: Raw): ShopifyImage | null {
  return img ? { url: img.url, altText: img.altText ?? null, width: img.width ?? null, height: img.height ?? null } : null;
}

export function reshapeProductSummary(p: Raw): ProductSummary {
  const variant = nodes(p.variants)[0];
  // Prefer the default variant's price pair so price + compare-at always refer to the same SKU.
  const price: Money = variant?.price ?? p.priceRange.minVariantPrice;
  const compareAt: Money | null = normaliseCompareAt(
    price,
    variant ? variant.compareAtPrice : p.compareAtPriceRange?.minVariantPrice,
  );
  return {
    id: p.id,
    handle: p.handle,
    title: p.title,
    vendor: p.vendor,
    productType: p.productType,
    tags: p.tags ?? [],
    availableForSale: p.availableForSale,
    featuredImage: reshapeImage(p.featuredImage),
    images: nodes(p.images).map(reshapeImage).filter(Boolean) as ShopifyImage[],
    price,
    compareAtPrice: compareAt,
    defaultVariantId: variant?.id ?? null,
  };
}

export function reshapeProduct(p: Raw): Product {
  const summary = reshapeProductSummary(p);
  const variants: ProductVariant[] = nodes(p.allVariants).map((v: Raw) => ({
    id: v.id,
    title: v.title,
    availableForSale: v.availableForSale,
    selectedOptions: v.selectedOptions,
    price: v.price,
    compareAtPrice: normaliseCompareAt(v.price, v.compareAtPrice),
    image: reshapeImage(v.image),
  }));
  const firstAvailable = variants.find((v) => v.availableForSale) ?? variants[0];
  return {
    ...summary,
    // The PDP leads with the first purchasable variant.
    price: firstAvailable?.price ?? summary.price,
    compareAtPrice: firstAvailable?.compareAtPrice ?? summary.compareAtPrice,
    defaultVariantId: firstAvailable?.id ?? summary.defaultVariantId,
    description: p.description,
    descriptionHtml: p.descriptionHtml,
    seo: { title: p.seo?.title ?? null, description: p.seo?.description ?? null },
    allImages: nodes(p.allImages).map(reshapeImage).filter(Boolean) as ShopifyImage[],
    options: (p.options ?? []).map((o: Raw) => ({
      id: o.id,
      name: o.name,
      values: (o.optionValues ?? []).map((ov: Raw) => ({
        name: ov.name,
        swatchColor: ov.swatch?.color ?? null,
        swatchImage: ov.swatch?.image?.previewImage?.url ?? null,
      })),
    })),
    variants,
  };
}

export function reshapeCollection(c: Raw): Collection {
  return {
    id: c.id,
    handle: c.handle,
    title: c.title,
    description: c.description ?? "",
    image: reshapeImage(c.image),
  };
}

export function reshapeCart(c: Raw): Cart {
  const lines: CartLine[] = nodes(c.lines)
    .filter((l: Raw) => l.merchandise?.id)
    .map((l: Raw) => ({
      id: l.id,
      quantity: l.quantity,
      cost: {
        total: l.cost.totalAmount,
        perUnit: l.cost.amountPerQuantity,
        compareAtPerUnit: normaliseCompareAt(l.cost.amountPerQuantity, l.cost.compareAtAmountPerQuantity),
      },
      variant: {
        id: l.merchandise.id,
        title: l.merchandise.title,
        selectedOptions: l.merchandise.selectedOptions,
        image: reshapeImage(l.merchandise.image),
      },
      product: { handle: l.merchandise.product.handle, title: l.merchandise.product.title },
    }));
  return {
    id: c.id,
    checkoutUrl: c.checkoutUrl,
    totalQuantity: c.totalQuantity,
    subtotal: c.cost.subtotalAmount,
    total: c.cost.totalAmount,
    lines,
  };
}
