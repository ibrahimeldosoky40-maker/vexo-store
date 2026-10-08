"use client";

import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { localizePath, type Locale } from "@/lib/i18n/config";

interface I18nContextValue {
  lang: Locale;
  dict: Dictionary;
  /** Prefix an internal path with the active locale. */
  href: (path: string) => string;
  /** Interpolate `{name}` placeholders. */
  t: (template: string, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? `{${key}}`));
}

export function I18nProvider({
  lang,
  dict,
  children,
}: {
  lang: Locale;
  dict: Dictionary;
  children: ReactNode;
}) {
  const href = useCallback((path: string) => localizePath(lang, path), [lang]);
  const value = useMemo<I18nContextValue>(
    () => ({ lang, dict, href, t: interpolate }),
    [lang, dict, href],
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within <I18nProvider>");
  return ctx;
}
