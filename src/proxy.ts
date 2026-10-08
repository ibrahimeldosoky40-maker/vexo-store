import { NextResponse, type NextRequest } from "next/server";
import { match } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";
import { defaultLocale, locales } from "@/lib/i18n/config";

const LOCALE_COOKIE = "VEXO_LOCALE";

function detectLocale(request: NextRequest): string {
  // 1. Explicit user choice (set by the language switcher)
  const saved = request.cookies.get(LOCALE_COOKIE)?.value;
  if (saved && (locales as readonly string[]).includes(saved)) return saved;

  // 2. Browser preference, falling back to English
  const headers = { "accept-language": request.headers.get("accept-language") ?? "" };
  const languages = new Negotiator({ headers }).languages();
  try {
    return match(languages, [...locales], defaultLocale);
  } catch {
    return defaultLocale;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
  if (hasLocale) return;

  const url = request.nextUrl.clone();
  url.pathname = `/${detectLocale(request)}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Skip Next internals, API routes and any file with an extension (favicon, images…)
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
