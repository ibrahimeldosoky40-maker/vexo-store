import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { OpenDeviceModalButton } from "./OpenDeviceModalButton";
import { localizePath, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/** High-impact hero banner with a bold "Shop Now" CTA. */
export function Hero({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  return (
    <section className="container-x pt-4 sm:pt-6" aria-labelledby="hero-title">
      <div className="relative isolate overflow-hidden rounded-[2rem] bg-surface sm:rounded-[2.5rem]">
        <Image
          src="/images/hero.jpg"
          alt=""
          fill
          priority
          sizes="(min-width:1360px) 1296px, 100vw"
          className="-z-10 object-cover object-[78%_center] rtl:-scale-x-100 rtl:object-[22%_center]"
        />
        {/* Readability scrim for narrow screens */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-white/95 via-white/55 to-transparent lg:from-white/70 lg:via-transparent rtl:bg-gradient-to-l" />

        <div className="relative flex min-h-[540px] flex-col justify-center px-6 py-16 sm:px-12 lg:min-h-[640px] lg:px-20">
          <div className="max-w-xl animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-brand-700 shadow-soft backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-coral" />
              {dict.home.heroEyebrow}
            </span>

            <h1
              id="hero-title"
              className="font-display mt-6 text-[2.75rem] font-extrabold leading-[1.02] tracking-tight text-ink sm:text-6xl lg:text-7xl"
            >
              {dict.home.heroTitleA}
              <br />
              <span className="gradient-text">{dict.home.heroTitleB}</span>
            </h1>

            <p className="mt-6 max-w-md text-base leading-relaxed text-ink-soft sm:text-lg">{dict.home.heroSubtitle}</p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link href={localizePath(lang, "/collections/all")} className="btn btn-primary px-9 py-[1.1rem] text-base">
                {dict.home.shopNow}
                <ArrowRight size={18} className="rtl:-scale-x-100" />
              </Link>
              <OpenDeviceModalButton className="btn btn-ghost bg-white/85 py-[1.1rem] backdrop-blur" />
            </div>
          </div>

          {/* Floating social-proof chip */}
          <div className="glass absolute bottom-6 end-6 hidden items-center gap-3 rounded-2xl px-4 py-3 shadow-lift sm:flex">
            <div className="flex -space-x-1.5 rtl:space-x-reverse">
              {["#2bbfc4", "#f2735a", "#fbb034"].map((c) => (
                <span key={c} className="h-8 w-8 rounded-full ring-2 ring-white" style={{ background: c }} />
              ))}
            </div>
            <div>
              <div className="flex items-center gap-0.5 text-amber">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={13} fill="currentColor" strokeWidth={0} />
                ))}
              </div>
              <p className="text-xs font-semibold text-ink">{dict.home.rating} · 100k+</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
