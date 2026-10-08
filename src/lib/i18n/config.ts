/**
 * i18n configuration — add a new language by:
 *  1. Adding its code to `locales` and an entry in `localeMeta`
 *  2. Creating `src/dictionaries/<code>.json` (copy en.json)
 *  3. Registering the loader in `src/lib/i18n/dictionaries.ts`
 */
export const locales = ["en", "ar"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export const localeMeta: Record<
  Locale,
  {
    label: string;
    nativeLabel: string;
    dir: "ltr" | "rtl";
    /** Shopify Storefront `LanguageCode` for @inContext. */
    shopifyLanguage: "EN" | "AR";
  }
> = {
  en: { label: "English", nativeLabel: "English", dir: "ltr", shopifyLanguage: "EN" },
  ar: { label: "Arabic", nativeLabel: "العربية", dir: "rtl", shopifyLanguage: "AR" },
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** Prefix an internal path with a locale: `/collections/x` → `/en/collections/x`. */
export function localizePath(locale: Locale, path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  const clean = path.startsWith("/") ? path : `/${path}`;
  return clean === "/" ? `/${locale}` : `/${locale}${clean}`;
}

/** Swap the locale segment of a pathname, preserving the rest. */
export function switchLocalePath(pathname: string, target: Locale): string {
  const segments = pathname.split("/");
  if (segments[1] && isLocale(segments[1])) {
    segments[1] = target;
    return segments.join("/") || `/${target}`;
  }
  return localizePath(target, pathname);
}
