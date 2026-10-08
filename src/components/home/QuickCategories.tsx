import Link from "next/link";
import {
  BatteryCharging,
  Cable,
  Headphones,
  Laptop,
  PackageCheck,
  RotateCcw,
  ShieldCheck,
  Smartphone,
  Truck,
  Watch,
  type LucideIcon,
} from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { localizePath, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

const CATEGORIES: {
  key: keyof Dictionary["categories"];
  slug: string;
  Icon: LucideIcon;
  tone: string;
}[] = [
  { key: "phoneCases", slug: "phone-cases", Icon: Smartphone, tone: "from-teal to-brand-500" },
  { key: "watchBands", slug: "watch-bands", Icon: Watch, tone: "from-coral to-amber" },
  { key: "chargers", slug: "chargers", Icon: BatteryCharging, tone: "from-amber to-coral" },
  { key: "laptopSleeves", slug: "laptop-sleeves", Icon: Laptop, tone: "from-brand-500 to-teal" },
  { key: "audio", slug: "audio", Icon: Headphones, tone: "from-coral to-brand-500" },
  { key: "cables", slug: "cables", Icon: Cable, tone: "from-teal to-amber" },
];

/** Horizontal, scrollable row of circular category icons. */
export function QuickCategories({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  return (
    <section className="container-x pt-14" aria-label={dict.home.shopByCategory}>
      <ul className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-3 sm:mx-0 sm:justify-center sm:gap-8 sm:px-0 lg:gap-12">
        {CATEGORIES.map(({ key, slug, Icon, tone }, i) => (
          <li key={slug} className="snap-start">
            <Reveal delay={i * 60}>
              <Link href={localizePath(lang, `/collections/${slug}`)} className="group flex w-24 flex-col items-center gap-3 sm:w-28">
                <span
                  className={`relative flex h-[5.25rem] w-[5.25rem] items-center justify-center rounded-full bg-gradient-to-br ${tone} text-white shadow-soft transition-all duration-300 group-hover:-translate-y-1.5 group-hover:scale-105 group-hover:shadow-lift sm:h-24 sm:w-24`}
                >
                  <span className="absolute inset-1 rounded-full ring-2 ring-white/40" />
                  <Icon size={32} strokeWidth={1.7} className="relative" />
                </span>
                <span className="text-center text-[13px] font-semibold leading-tight text-ink transition-colors group-hover:text-brand-600 sm:text-sm">
                  {dict.categories[key]}
                </span>
              </Link>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}

const TRUST_ICONS = [Truck, RotateCcw, ShieldCheck, PackageCheck];

export function TrustBar({ dict }: { dict: Dictionary }) {
  return (
    <section className="container-x pt-14" aria-label="Why Vexo">
      <ul className="grid grid-cols-2 gap-3 rounded-3xl bg-surface p-3 sm:gap-4 lg:grid-cols-4">
        {dict.home.trust.map((item, i) => {
          const Icon = TRUST_ICONS[i] ?? Truck;
          return (
            <li key={item.title} className="flex items-center gap-3.5 rounded-2xl bg-white p-4 shadow-[0_1px_2px_rgb(13_27_61/0.04)] sm:p-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <Icon size={21} />
              </span>
              <span>
                <span className="block text-sm font-bold text-ink">{item.title}</span>
                <span className="block text-xs text-muted">{item.text}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
