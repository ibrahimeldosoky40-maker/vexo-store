import Link from "next/link";
import clsx from "clsx";
import { Logo } from "./Logo";
import { NewsletterForm } from "./NewsletterForm";
import {
  FacebookIcon,
  InstagramIcon,
  PaymentIcons,
  TikTokIcon,
  XIcon,
  YouTubeIcon,
} from "@/components/ui/BrandIcons";
import { siteConfig } from "@/lib/config";
import { localizePath, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { TAXONOMY, slugify } from "@/lib/shopify/taxonomy";

const SOCIALS = [
  { name: "Instagram", href: "https://instagram.com", Icon: InstagramIcon },
  { name: "Facebook", href: "https://facebook.com", Icon: FacebookIcon },
  { name: "TikTok", href: "https://tiktok.com", Icon: TikTokIcon },
  { name: "X", href: "https://x.com", Icon: XIcon },
  { name: "YouTube", href: "https://youtube.com", Icon: YouTubeIcon },
] as const;

function Column({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-5 font-display text-sm font-bold uppercase tracking-[0.16em] text-white/90">{title}</h3>
      <ul className="space-y-3 text-[15px] text-white/65">{children}</ul>
    </div>
  );
}

const linkClass = "inline-block transition-all hover:translate-x-1 hover:text-white rtl:hover:-translate-x-1";

export function Footer({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const href = (p: string) => localizePath(lang, p);
  // "Shop by Device": the most popular devices of each phone brand
  const deviceLinks = Object.entries(TAXONOMY["Phone Cases"]).flatMap(([, devices]) => devices.slice(0, 3));

  return (
    <footer className="relative mt-24 overflow-hidden bg-brand-900 text-white">
      <div className="pointer-events-none absolute -start-32 -top-32 h-96 w-96 rounded-full bg-teal/15 blur-3xl" />
      <div className="pointer-events-none absolute -end-24 bottom-0 h-96 w-96 rounded-full bg-coral/10 blur-3xl" />
      <div className="h-1 bg-gradient-to-r from-teal via-amber to-coral" />

      <div className="container-x relative py-16">
        {/* Newsletter */}
        <div className="flex flex-col items-start justify-between gap-8 border-b border-white/10 pb-12 lg:flex-row lg:items-center">
          <div className="max-w-md">
            <h2 className="font-display text-3xl font-bold leading-tight">{dict.footer.newsletterTitle}</h2>
            <p className="mt-2 text-white/65">{dict.footer.newsletterText}</p>
          </div>
          <NewsletterForm />
        </div>

        {/* Columns */}
        <div className="grid gap-12 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="inline-block rounded-3xl bg-white p-3 shadow-soft">
              <Logo href={href("/")} height={84} />
            </div>
            <p className="mt-5 max-w-xs text-[15px] leading-relaxed text-white/65">{dict.footer.tagline}</p>
            <p className="mb-3 mt-7 text-xs font-bold uppercase tracking-[0.16em] text-white/50">{dict.footer.follow}</p>
            <ul className="flex gap-2.5">
              {SOCIALS.map(({ name, href: url, Icon }) => (
                <li key={name}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={name}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-all hover:-translate-y-1 hover:bg-white hover:text-brand-900"
                  >
                    <Icon className="h-[19px] w-[19px]" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <Column title={dict.footer.shopByDevice}>
            {deviceLinks.map((device) => (
              <li key={device}>
                <Link href={href(`/collections/phone-cases?device=${slugify(device)}`)} className={linkClass}>
                  {device}
                </Link>
              </li>
            ))}
          </Column>

          <Column title={dict.footer.support}>
            {dict.footer.supportLinks.map((l) => (
              <li key={l.href}>
                <Link href={href(l.href)} className={linkClass}>
                  {l.label}
                </Link>
              </li>
            ))}
          </Column>

          <Column title={dict.footer.about}>
            {dict.footer.aboutLinks.map((l) => (
              <li key={l.href}>
                <Link href={href(l.href)} className={linkClass}>
                  {l.label}
                </Link>
              </li>
            ))}
          </Column>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-5 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-sm text-white/50">
            © {new Date().getFullYear()} {siteConfig.name}. {dict.footer.rights}
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-white/45">{dict.footer.payments}</span>
            <PaymentIcons className={clsx("flex flex-wrap items-center justify-center gap-2")} />
          </div>
        </div>
      </div>
    </footer>
  );
}
