"use client";

import { useMemo, useState } from "react";
import { Check, ChevronDown, Search, Smartphone, X } from "lucide-react";
import clsx from "clsx";
import { Modal } from "@/components/ui/Overlays";
import { useDevice } from "@/components/providers/DeviceProvider";
import { useI18n } from "@/components/providers/I18nProvider";
import { getDeviceOptions } from "@/lib/shopify/taxonomy";

/** Header trigger — labelled "Select Your Device" until a device is chosen. */
export function DeviceSelectorButton({
  variant = "pill",
  className,
}: {
  variant?: "pill" | "icon" | "block";
  className?: string;
}) {
  const { dict } = useI18n();
  const { device, openModal, selectDevice } = useDevice();
  const label = device?.label ?? dict.deviceSelector.label;

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={openModal}
        aria-label={label}
        title={label}
        className={clsx("icon-btn relative", className)}
      >
        <Smartphone size={21} strokeWidth={1.9} />
        {device && <span className="absolute end-2 top-2 h-2.5 w-2.5 rounded-full bg-teal ring-2 ring-white" />}
      </button>
    );
  }

  return (
    <div className={clsx("relative", variant === "block" && "w-full", className)}>
      <button
        type="button"
        onClick={openModal}
        aria-haspopup="dialog"
        className={clsx(
          "group flex h-11 items-center gap-2.5 rounded-full border px-4 text-sm font-semibold transition-all",
          variant === "block" && "w-full",
          device
            ? "border-brand-100 bg-brand-50 text-brand-700 hover:border-brand-500"
            : "border-line bg-white text-ink hover:border-ink hover:shadow-soft",
        )}
      >
        <Smartphone size={18} className={device ? "text-brand-600" : "text-teal"} />
        <span className="max-w-[10.5rem] truncate">{label}</span>
        <ChevronDown size={16} className="ms-auto text-muted transition-transform group-hover:translate-y-0.5" />
      </button>
      {device && (
        <button
          type="button"
          onClick={() => selectDevice(null)}
          aria-label={dict.deviceSelector.clear}
          className="absolute -end-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-ink text-white shadow transition-transform hover:scale-110"
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
}

/** Global modal. Mounted once in the app shell. */
export function DeviceSelectorModal() {
  const { dict } = useI18n();
  const { modalOpen, closeModal, device, selectDevice } = useDevice();
  const [query, setQuery] = useState("");

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    return getDeviceOptions()
      .map((g) => ({
        ...g,
        devices: g.devices.filter((d) => !q || d.label.toLowerCase().includes(q) || g.brand.toLowerCase().includes(q)),
      }))
      .filter((g) => g.devices.length > 0);
  }, [query]);

  function pick(brand: string, label: string, slug: string) {
    selectDevice({ brand, label, slug });
    setQuery("");
    closeModal();
  }

  return (
    <Modal
      open={modalOpen}
      onClose={closeModal}
      label={dict.deviceSelector.label}
      closeLabel={dict.nav.close}
    >
      <div className="px-6 pb-4 pt-7 sm:px-8">
        <div className="mb-1 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-soft text-teal">
          <Smartphone size={22} />
        </div>
        <h2 className="font-display text-2xl font-bold text-ink">{dict.deviceSelector.title}</h2>
        <p className="mt-1 text-sm text-muted">{dict.deviceSelector.subtitle}</p>

        <label className="relative mt-5 block">
          <Search size={18} className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-muted" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={dict.deviceSelector.searchPlaceholder}
            className="h-12 w-full rounded-2xl bg-surface ps-11 pe-4 text-[15px] outline-none ring-1 ring-transparent transition focus:bg-white focus:ring-brand-500"
          />
        </label>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto px-6 pb-6 sm:px-8">
        {groups.length === 0 && (
          <p className="py-10 text-center text-sm text-muted">{dict.deviceSelector.noDevices}</p>
        )}
        {groups.map((group) => (
          <section key={group.brand}>
            <h3 className="mb-2.5 text-xs font-bold uppercase tracking-[0.16em] text-muted">{group.brand}</h3>
            <div className="flex flex-wrap gap-2">
              {group.devices.map((d) => {
                const active = device?.slug === d.slug;
                return (
                  <button
                    key={d.slug}
                    type="button"
                    onClick={() => pick(group.brand, d.label, d.slug)}
                    aria-pressed={active}
                    className={clsx(
                      "inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-medium transition-all",
                      active
                        ? "bg-brand-600 text-white shadow-[0_8px_20px_-8px_rgb(31_85_173/0.8)]"
                        : "bg-surface text-ink hover:-translate-y-0.5 hover:bg-brand-50 hover:text-brand-700",
                    )}
                  >
                    {active && <Check size={14} />}
                    {d.label}
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {device && (
        <div className="border-t border-line px-6 py-4 sm:px-8">
          <button
            type="button"
            onClick={() => {
              selectDevice(null);
              closeModal();
            }}
            className="text-sm font-semibold text-sale underline-offset-4 hover:underline"
          >
            {dict.deviceSelector.clear}
          </button>
        </div>
      )}
    </Modal>
  );
}
