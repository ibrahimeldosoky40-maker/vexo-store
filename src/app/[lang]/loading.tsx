import { ProductGridSkeleton } from "@/components/product/ProductGrid";

/** Route-level loading UI (streams while Shopify data resolves). */
export default function Loading() {
  return (
    <div className="container-x pt-6" aria-busy="true" aria-live="polite">
      <div className="skeleton h-[420px] w-full rounded-[2rem]" />
      <div className="mt-14 flex justify-center gap-8">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-3">
            <div className="skeleton h-24 w-24 rounded-full" />
            <div className="skeleton h-3 w-16" />
          </div>
        ))}
      </div>
      <div className="mt-16">
        <ProductGridSkeleton count={8} />
      </div>
    </div>
  );
}
