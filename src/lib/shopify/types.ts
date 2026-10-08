export interface Money {
  amount: string;
  currencyCode: string;
}

export interface ShopifyImage {
  url: string;
  altText: string | null;
  width: number | null;
  height: number | null;
}

export interface SelectedOption {
  name: string;
  value: string;
}

export interface ProductOptionValue {
  name: string;
  /** Hex colour from a Shopify swatch, when configured. */
  swatchColor: string | null;
  swatchImage: string | null;
}

export interface ProductOption {
  id: string;
  name: string;
  values: ProductOptionValue[];
}

export interface ProductVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  selectedOptions: SelectedOption[];
  price: Money;
  compareAtPrice: Money | null;
  image: ShopifyImage | null;
}

/** Lightweight product used in grids, carousels and cross-sells. */
export interface ProductSummary {
  id: string;
  handle: string;
  title: string;
  vendor: string;
  productType: string;
  tags: string[];
  availableForSale: boolean;
  featuredImage: ShopifyImage | null;
  /** First two images — used for the hover image swap. */
  images: ShopifyImage[];
  price: Money;
  compareAtPrice: Money | null;
  /** First available variant, used for quick add-to-cart. */
  defaultVariantId: string | null;
}

export interface Product extends ProductSummary {
  description: string;
  descriptionHtml: string;
  options: ProductOption[];
  variants: ProductVariant[];
  allImages: ShopifyImage[];
  seo: { title: string | null; description: string | null };
}

export interface Collection {
  id: string;
  handle: string;
  title: string;
  description: string;
  image: ShopifyImage | null;
}

export interface PageInfo {
  hasNextPage: boolean;
  endCursor: string | null;
}

export interface ProductConnection {
  products: ProductSummary[];
  pageInfo: PageInfo;
}

export interface CartLine {
  id: string;
  quantity: number;
  cost: { total: Money; perUnit: Money; compareAtPerUnit: Money | null };
  variant: {
    id: string;
    title: string;
    selectedOptions: SelectedOption[];
    image: ShopifyImage | null;
  };
  product: { handle: string; title: string };
}

export interface Cart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  subtotal: Money;
  total: Money;
  lines: CartLine[];
}

export interface ShopInfo {
  name: string;
  currencyCode: string;
}

/** Normalised menu item — supports 3 tiers: Category → Brand → Device. */
export interface MenuItem {
  id: string;
  title: string;
  /** Locale-agnostic internal path, e.g. `/collections/iphone-17-pro-max`. */
  path: string;
  children: MenuItem[];
}
