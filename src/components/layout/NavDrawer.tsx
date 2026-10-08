"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Home, LayoutGrid, User } from "lucide-react";
import { Drawer } from "@/components/ui/Overlays";
import { useI18n } from "@/components/providers/I18nProvider";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { DeviceSelectorButton } from "./DeviceSelector";
import { Logo } from "./Logo";
import type { MenuItem } from "@/lib/shopify/types";

/**
 * Sliding navigation drawer with drill-down panels:
 * Category → Brand → Device. Each tap slides the next level in; "Back" slides out.
 * Works identically on mobile and desktop and is RTL-aware (logical positioning).
 */
export function NavDrawer({
  open,
  onClose,
  menu,
}: {
  open: boolean;
  onClose: () => void;
  menu: MenuItem[];
}) {
  const { dict, href, t } = useI18n();
  const [trail, setTrail] = useState<MenuItem[]>([]);

  // Reset to the root panel once the closing animation has finished.
  useEffect(() => {
    if (open) return;
    const id = window.setTimeout(() => setTrail([]), 400);
    return () => window.clearTimeout(id);
  }, [open]);

  const panels: { title: string; viewAll?: MenuItem; items: MenuItem[] }[] = [
    { title: dict.nav.browse, items: menu },
    ...trail.map((node) => ({ title: node.title, viewAll: node, items: node.children })),
  ];
  const depth = trail.length;

  const drill = (item: MenuItem) => setTrail((prev) => [...prev.slice(0, depth), item]);
  const back = () => setTrail((prev) => prev.slice(0, -1));

  return (
    <Drawer open={open} onClose={onClose} side="start" label={dict.nav.openMenu} closeLabel={dict.nav.close} bare>
      <div className="flex items-center justify-between border-b border-line px-5 py-3">
        <Logo href={href("/")} height={52} />
        <button type="button" onClick={onClose} aria-label={dict.nav.close} className="icon-btn">
          <span className="text-2xl leading-none">×</span>
        </button>
      </div>

      {/* Sliding panel track — translates by whole panel widths; flipped in RTL */}
      <div className="relative flex-1 overflow-hidden">
        <div
          style={{ ["--i" as string]: depth }}
          className="flex h-full translate-x-[calc(var(--i)*-100%)] transition-transform duration-[380ms] ease-[cubic-bezier(0.22,0.8,0.2,1)] rtl:translate-x-[calc(var(--i)*100%)]"
        >
          <div className="contents">
            {panels.map((panel, level) => (
              <nav
                key={level}
                aria-label={panel.title}
                aria-hidden={level !== depth}
                inert={level !== depth}
                className="flex h-full w-full shrink-0 flex-col overflow-y-auto"
              >
                {level > 0 && (
                  <button
                    type="button"
                    onClick={back}
                    className="sticky top-0 z-10 flex items-center gap-2 border-b border-line bg-white/95 px-5 py-4 text-start text-sm font-semibold text-brand-600 backdrop-blur"
                  >
                    <ChevronLeft size={18} className="rtl:-scale-x-100" />
                    {dict.nav.back}
                    <span className="ms-auto max-w-[55%] truncate font-display text-base font-bold text-ink">{panel.title}</span>
                  </button>
                )}

                <ul className="p-3">
                  {panel.viewAll && (
                    <li>
                      <Link
                        href={href(panel.viewAll.path)}
                        onClick={onClose}
                        className="mb-1 flex items-center justify-between rounded-2xl bg-gradient-to-r from-brand-50 to-teal-soft px-4 py-3.5 text-sm font-bold text-brand-700"
                      >
                        {t(dict.nav.viewAll, { name: panel.viewAll.title })}
                        <ArrowRight size={16} className="rtl:-scale-x-100" />
                      </Link>
                    </li>
                  )}
                  {panel.items.map((item) =>
                    item.children.length > 0 ? (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => drill(item)}
                          className="flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-start text-[15px] font-semibold text-ink transition-colors hover:bg-surface"
                        >
                          {item.title}
                          <ChevronRight size={18} className="text-muted rtl:-scale-x-100" />
                        </button>
                      </li>
                    ) : (
                      <li key={item.id}>
                        <Link
                          href={href(item.path)}
                          onClick={onClose}
                          className="flex items-center justify-between rounded-2xl px-4 py-3 text-[15px] font-medium text-ink-soft transition-colors hover:bg-surface hover:text-ink"
                        >
                          {item.title}
                        </Link>
                      </li>
                    ),
                  )}
                </ul>

                {level === 0 && (
                  <div className="mt-auto space-y-3 border-t border-line p-5">
                    <div className="grid grid-cols-2 gap-2 text-sm font-semibold">
                      <Link href={href("/")} onClick={onClose} className="flex items-center gap-2 rounded-2xl bg-surface px-4 py-3 hover:bg-surface-2">
                        <Home size={17} /> {dict.nav.home}
                      </Link>
                      <Link href={href("/collections/all")} onClick={onClose} className="flex items-center gap-2 rounded-2xl bg-surface px-4 py-3 hover:bg-surface-2">
                        <LayoutGrid size={17} /> {dict.nav.catalog}
                      </Link>
                    </div>
                    <a
                      href={`https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/account`}
                      className="flex items-center gap-2 rounded-2xl bg-surface px-4 py-3 text-sm font-semibold hover:bg-surface-2"
                    >
                      <User size={17} /> {dict.nav.account}
                    </a>
                    <DeviceSelectorButton variant="block" />
                    <LanguageSwitcher variant="inline" />
                  </div>
                )}
              </nav>
            ))}
          </div>
        </div>
      </div>
    </Drawer>
  );
}
