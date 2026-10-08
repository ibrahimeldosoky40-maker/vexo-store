"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, Menu, User } from "lucide-react";
import clsx from "clsx";
import { useI18n } from "@/components/providers/I18nProvider";
import { CartButton } from "@/components/cart/CartDrawer";
import { AnnouncementBar } from "./AnnouncementBar";
import { DeviceSelectorButton } from "./DeviceSelector";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Logo } from "./Logo";
import { MegaPanel } from "./MegaMenu";
import { NavDrawer } from "./NavDrawer";
import { SearchBar } from "./SearchBar";
import type { MenuItem } from "@/lib/shopify/types";

export function Header({ menu }: { menu: MenuItem[] }) {
  const { href, dict } = useI18n();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const closeTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setActiveId(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const open = (id: string) => {
    window.clearTimeout(closeTimer.current);
    setActiveId(id);
  };
  const scheduleClose = () => {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setActiveId(null), 140);
  };

  const active = menu.find((m) => m.id === activeId && m.children.length > 0);

  return (
    <>
      <div className="sticky top-0 z-50" onMouseLeave={scheduleClose}>
        <AnnouncementBar />

        <header
          className={clsx(
            "glass relative border-b transition-shadow duration-300",
            scrolled ? "border-line shadow-soft" : "border-transparent",
          )}
        >
          <div
            className={clsx(
              "container-x flex items-center gap-2 transition-[height] duration-300 sm:gap-3 lg:gap-5",
              scrolled ? "h-[64px] lg:h-[70px]" : "h-[72px] lg:h-[92px]",
            )}
          >
            <button
              type="button"
              className="icon-btn -ms-2"
              onClick={() => setDrawerOpen(true)}
              aria-label={dict.nav.openMenu}
              aria-haspopup="dialog"
            >
              <Menu size={24} strokeWidth={1.9} />
            </button>

            <Logo
              href={href("/")}
              priority
              imgClassName={clsx("transition-all duration-300", scrolled ? "h-11 lg:h-[56px]" : "h-[54px] lg:h-[78px]")}
            />

            {/* Level-1 categories → mega panel (xl and up; drawer covers smaller screens) */}
            <nav aria-label="Main" className="hidden xl:block">
              <ul className="flex items-center gap-1">
                {menu.map((item) => {
                  const hasChildren = item.children.length > 0;
                  const isActive = item.id === activeId;
                  return (
                    <li key={item.id} onMouseEnter={() => (hasChildren ? open(item.id) : setActiveId(null))}>
                      <Link
                        href={href(item.path)}
                        aria-expanded={hasChildren ? isActive : undefined}
                        aria-haspopup={hasChildren ? "true" : undefined}
                        onFocus={() => (hasChildren ? open(item.id) : setActiveId(null))}
                        onClick={() => setActiveId(null)}
                        className={clsx(
                          "relative flex items-center gap-1 rounded-full px-3.5 py-2.5 text-sm font-semibold transition-colors",
                          isActive ? "bg-brand-50 text-brand-700" : "text-ink hover:bg-surface-2",
                        )}
                      >
                        {item.title}
                        {hasChildren && (
                          <ChevronDown size={14} className={clsx("transition-transform duration-300", isActive && "rotate-180")} />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <SearchBar className="mx-auto hidden max-w-xl flex-1 md:block" />
            <span className="flex-1 md:hidden" />

            <div className="flex items-center gap-0.5 sm:gap-1">
              <DeviceSelectorButton variant="pill" className="me-1 hidden xl:block" />
              <DeviceSelectorButton variant="icon" className="hidden md:inline-flex xl:hidden" />
              <a
                href={`https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/account`}
                className="icon-btn hidden sm:inline-flex"
                aria-label={dict.nav.account}
              >
                <User size={21} strokeWidth={1.9} />
              </a>
              <LanguageSwitcher />
              <CartButton />
            </div>
          </div>

          {/* Mobile / tablet: search + device selector (collapses once the page scrolls) */}
          <div
            className={clsx(
              "grid transition-[grid-template-rows,opacity] duration-300 md:hidden",
              scrolled ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100",
            )}
          >
            <div className="overflow-hidden">
              <div className="container-x flex items-center gap-2 pb-3">
                <SearchBar className="min-w-0 flex-1" />
                <DeviceSelectorButton variant="pill" className="shrink-0 [&>button]:px-3.5 [&>button>span]:max-w-[6.5rem]" />
              </div>
            </div>
          </div>

          {/* Mega panel */}
          {active && (
            <div
              key={active.id}
              onMouseEnter={() => open(active.id)}
              className="absolute inset-x-0 top-full hidden animate-pop-in border-t border-line bg-white shadow-pop xl:block"
            >
              <MegaPanel item={active} onNavigate={() => setActiveId(null)} />
            </div>
          )}
        </header>
      </div>

      <NavDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} menu={menu} />
    </>
  );
}
