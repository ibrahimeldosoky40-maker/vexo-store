"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Check, Globe } from "lucide-react";
import clsx from "clsx";
import { useI18n } from "@/components/providers/I18nProvider";
import { locales, localeMeta, switchLocalePath, type Locale } from "@/lib/i18n/config";
import { rememberLocale } from "@/lib/i18n/client";

export function LanguageSwitcher({ variant = "dropdown" }: { variant?: "dropdown" | "inline" }) {
  const { lang, dict } = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function change(target: Locale) {
    setOpen(false);
    if (target === lang) return;
    // Remember the choice so the proxy honours it on the next visit.
    rememberLocale(target);
    router.push(`${switchLocalePath(pathname, target)}${window.location.search}`);
  }

  if (variant === "inline") {
    return (
      <div className="flex items-center gap-2">
        <Globe size={18} className="text-muted" aria-hidden />
        {locales.map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => change(l)}
            aria-pressed={l === lang}
            className={clsx(
              "rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors",
              l === lang ? "bg-ink text-white" : "bg-surface text-ink-soft hover:bg-surface-2",
            )}
          >
            {localeMeta[l].nativeLabel}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        className="icon-btn"
        aria-label={dict.nav.language}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <Globe size={21} strokeWidth={1.9} />
      </button>
      {open && (
        <ul
          role="menu"
          className="absolute end-0 top-full z-50 mt-2 w-44 animate-pop-in overflow-hidden rounded-2xl bg-white p-1.5 shadow-lift ring-1 ring-line"
        >
          {locales.map((l) => (
            <li key={l} role="none">
              <button
                role="menuitemradio"
                aria-checked={l === lang}
                type="button"
                onClick={() => change(l)}
                className={clsx(
                  "flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors hover:bg-surface",
                  l === lang && "text-brand-600",
                )}
              >
                <span>{localeMeta[l].nativeLabel}</span>
                {l === lang && <Check size={16} />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
