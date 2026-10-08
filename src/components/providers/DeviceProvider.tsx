"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export interface SelectedDevice {
  label: string;
  slug: string;
  brand: string;
}

interface DeviceContextValue {
  device: SelectedDevice | null;
  selectDevice: (device: SelectedDevice | null) => void;
  modalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  /** True if a product (by title/tags) is compatible with the selected device. */
  matches: (product: { title: string; tags: string[] }) => boolean;
}

const STORAGE_KEY = "vexo_device";
const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}
const getSnapshot = () => window.localStorage.getItem(STORAGE_KEY);
const getServerSnapshot = () => null;

function writeDevice(device: SelectedDevice | null) {
  if (device) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(device));
  else window.localStorage.removeItem(STORAGE_KEY);
  listeners.forEach((l) => l());
}

const DeviceContext = createContext<DeviceContextValue | null>(null);

/**
 * Global "Select Your Device" state. Persisted in localStorage and consumed by
 * every product grid so the whole storefront can filter by compatibility.
 */
export function DeviceProvider({ children }: { children: ReactNode }) {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [modalOpen, setModalOpen] = useState(false);

  const device = useMemo<SelectedDevice | null>(() => {
    if (!raw) return null;
    try {
      return JSON.parse(raw) as SelectedDevice;
    } catch {
      return null;
    }
  }, [raw]);

  const selectDevice = useCallback((d: SelectedDevice | null) => writeDevice(d), []);
  const openModal = useCallback(() => setModalOpen(true), []);
  const closeModal = useCallback(() => setModalOpen(false), []);

  const matches = useCallback(
    (product: { title: string; tags: string[] }) => {
      if (!device) return true;
      const label = device.label.toLowerCase();
      const haystack = [product.title, ...product.tags].map((s) => s.toLowerCase());
      return haystack.some(
        (s) => s.includes(label) || s === device.slug || s.replace(/\s+/g, "-") === device.slug,
      );
    },
    [device],
  );

  const value = useMemo(
    () => ({ device, selectDevice, modalOpen, openModal, closeModal, matches }),
    [device, selectDevice, modalOpen, openModal, closeModal, matches],
  );

  return <DeviceContext.Provider value={value}>{children}</DeviceContext.Provider>;
}

export function useDevice(): DeviceContextValue {
  const ctx = useContext(DeviceContext);
  if (!ctx) throw new Error("useDevice must be used within <DeviceProvider>");
  return ctx;
}
