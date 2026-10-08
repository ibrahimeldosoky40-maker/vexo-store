import { Suspense } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight, BadgeCheck, Quote, Star } from "lucide-react";
import { ProductGrid, ProductGridSkeleton } from "@/components/product/ProductGrid";
import { Reveal } from "@/components/ui/Reveal";
import { localizePath, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { getBestsellers } from "@/lib/shopify/queries";
import { shopifySafe } from "@/lib/shopify/client";

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-brand-600">{eyebrow}</p>}
        <h2 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">{title}</h2>
        {subtitle && <p className="mt-2 max-w-xl text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

/** Graceful failure state — keeps the page usable when Shopify is unreachable. */
export function ErrorState({ message, retryLabel, retryHref }: { message: string; retryLabel: string; retryHref: string }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-line bg-surface px-6 py-14 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-coral-soft text-coral">
        <AlertTriangle size={26} />
      </span>
      <p className="max-w-sm text-ink-soft">{message}</p>
      <Link href={retryHref} className="btn btn-dark">
        {retryLabel}
      </Link>
    </div>
  );
}

async function BestsellersContent({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const result = await shopifySafe(() => getBestsellers(lang, 8));

  if (result.error) {
    return <ErrorState message={dict.home.productsUnavailable} retryLabel={dict.common.retry} retryHref={localizePath(lang, "/")} />;
  }
  return <ProductGrid products={result.data} />;
}

/** Bestsellers grid (with image swap on hover) — streams in behind a skeleton. */
export function Bestsellers({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  return (
    <section className="container-x pt-20" aria-labelledby="bestsellers-title">
      <Reveal>
        <SectionHeading
          title={dict.home.bestsellers}
          subtitle={dict.home.bestsellersSub}
          action={
            <Link
              href={localizePath(lang, "/collections/all")}
              className="group inline-flex items-center gap-2 text-sm font-bold text-brand-600"
            >
              {dict.home.viewAll}
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1" />
            </Link>
          }
        />
      </Reveal>
      <Suspense fallback={<ProductGridSkeleton />}>
        <BestsellersContent lang={lang} dict={dict} />
      </Suspense>
    </section>
  );
}

const AVATAR_TONES = [
  "from-teal to-brand-500",
  "from-coral to-amber",
  "from-brand-500 to-brand-700",
  "from-amber to-coral",
];

function Stars({ size = 16 }: { size?: number }) {
  return (
    <div className="flex items-center gap-0.5 text-amber" aria-label="5 out of 5 stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={size} fill="currentColor" strokeWidth={0} />
      ))}
    </div>
  );
}

/** "Over 100,000 5-Star Reviews" + customer testimonials. */
export function SocialProof({ dict }: { dict: Dictionary }) {
  return (
    <section className="mt-24 bg-gradient-to-b from-surface via-white to-white py-20" aria-labelledby="reviews-title">
      <div className="container-x">
        <Reveal className="mx-auto mb-12 max-w-2xl text-center">
          <div className="mb-4 flex justify-center">
            <Stars size={28} />
          </div>
          <h2 id="reviews-title" className="font-display text-3xl font-extrabold tracking-tight text-ink sm:text-5xl">
            {dict.home.reviewsTitle}
          </h2>
          <p className="mt-3 text-lg text-muted">{dict.home.reviewsSub}</p>
        </Reveal>

        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {dict.reviews.map((review, i) => (
            <li key={review.name}>
              <Reveal delay={i * 80} className="relative flex h-full flex-col rounded-3xl bg-white p-7 shadow-soft ring-1 ring-line transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lift">
                <Quote size={30} className="absolute end-6 top-6 text-brand-100" fill="currentColor" strokeWidth={0} />
                <Stars size={15} />
                <p className="mt-4 flex-1 text-[15px] leading-relaxed text-ink-soft">“{review.text}”</p>
                <div className="mt-6 flex items-center gap-3">
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br ${AVATAR_TONES[i % AVATAR_TONES.length]} text-sm font-bold text-white`}
                  >
                    {review.name.charAt(0)}
                  </span>
                  <div className="min-w-0">
                    <p className="flex items-center gap-1 text-sm font-bold text-ink">
                      {review.name}
                      <BadgeCheck size={15} className="shrink-0 text-teal" />
                    </p>
                    <p className="truncate text-xs text-muted">{review.role}</p>
                  </div>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
