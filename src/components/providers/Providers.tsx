"use client";

import type { ReactNode } from "react";
import { CartProvider } from "./CartProvider";
import { DeviceProvider } from "./DeviceProvider";
import { I18nProvider } from "./I18nProvider";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { DeviceSelectorModal } from "@/components/layout/DeviceSelector";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/** App-wide client context + globally mounted overlays (cart drawer, device modal). */
export function Providers({
  lang,
  dict,
  children,
}: {
  lang: Locale;
  dict: Dictionary;
  children: ReactNode;
}) {
  return (
    <I18nProvider lang={lang} dict={dict}>
      <DeviceProvider>
        <CartProvider>
          {children}
          <CartDrawer />
          <DeviceSelectorModal />
        </CartProvider>
      </DeviceProvider>
    </I18nProvider>
  );
}
