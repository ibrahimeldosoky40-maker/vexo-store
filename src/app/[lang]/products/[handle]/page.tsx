import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { ProductView } from "@/components/product/ProductView";
import { ErrorState } from "@/components/home/Sections";
import { isLocale, localizePath } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { shopifySafe } from "@/lib/shopify/client";
import {
  getBestsellers,
  getComplementaryProducts,
  getProduct,
  getRelatedProducts,
} from "@/lib/shopify/queries";
import type { Locale } from "@/lib/i18n/config";
import type { ProductSummary } from "@/lib/shopify/types";

const loadProduct = cache((handle: string, lang: Locale) => shopifySafe(() => getProduct(handle, lang)));

async function loadCrossSell(productId: string, lang: Locale): Promise<ProductSummary[]> {
  const complementary = await shopifySafe(() => getComplementaryProducts(productId, lang));
  if (complementary.data?.length) return complementary.data;

  const related = await shopifySafe(() => getRelatedProducts(productId, lang));
  if (related.data?.length) return related.data;

  // Brand-new catalogue? Fall back to bestsellers so the section still has content.
  const best = await shopifySafe(() => getBestsellers(lang, 6));
  return (best.data ?? []).filter((p) => p.id !== productId);
}

export async function generateMetadata({ params }: PageProps<"/[lang]/products/[handle]">): Promise<Metadata> {
  const { lang, handle } = await params;
  if (!isLocale(lang)) return {};
  const { data: product } = await loadProduct(handle, lang);
  if (!product) return {};

  const description = product.seo.description ?? product.description.slice(0, 160);
  return {
    title: product.seo.title ?? product.title,
    description,
    alternates: { canonical: localizePath(lang, `/products/${handle}`) },
    openGraph: {
      title: product.title,
      description,
      type: "website",
      images: product.featuredImage ? [{ url: product.featuredImage.url }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: PageProps<"/[lang]/products/[handle]">) {
  const { lang, handle } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  const { data: product, error } = await loadProduct(handle, lang);

  if (error) {
    return (
      <div className="container-x py-20">
        <ErrorState message={dict.common.error} retryLabel={dict.common.retry} retryHref={localizePath(lang, `/products/${handle}`)} />
      </div>
    );
  }
  if (!product) notFound();

  const crossSell = await loadCrossSell(product.id, lang);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: product.allImages.map((i) => i.url),
    brand: product.vendor ? { "@type": "Brand", name: product.vendor } : undefined,
    offers: {
      "@type": "Offer",
      price: product.price.amount,
      priceCurrency: product.price.currencyCode,
      availability: product.availableForSale ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="container-x pb-10 pt-6 sm:pt-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href={localizePath(lang, "/")} className="hover:text-ink">
              {dict.product.breadcrumbHome}
            </Link>
          </li>
          <ChevronRight size={14} className="rtl:-scale-x-100" />
          <li className="max-w-[60vw] truncate font-medium text-ink" aria-current="page">
            {product.title}
          </li>
        </ol>
      </nav>

      <ProductView product={product} crossSell={crossSell} />
    </div>
  );
}
