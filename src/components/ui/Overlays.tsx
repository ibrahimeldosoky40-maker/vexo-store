"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import clsx from "clsx";

/** Locks body scroll while `locked` is true (ref-counted across overlays). */
let lockCount = 0;
export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    lockCount += 1;
    document.body.dataset.scrollLocked = "true";
    return () => {
      lockCount -= 1;
      if (lockCount <= 0) {
        lockCount = 0;
        delete document.body.dataset.scrollLocked;
      }
    };
  }, [locked]);
}

function useEscape(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
}

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  side: "start" | "end";
  label: string;
  closeLabel: string;
  children: ReactNode;
  className?: string;
  /** Hide the default header close button (when children render their own). */
  bare?: boolean;
}

/**
 * Accessible sliding drawer. Always mounted so the slide animation is smooth in
 * both directions; `inert` keeps the closed panel out of the tab order.
 * Uses logical positioning, so `side="start"` opens from the right in RTL.
 */
export function Drawer({ open, onClose, side, label, closeLabel, children, className, bare }: DrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  useScrollLock(open);
  useEscape(open, onClose);

  useEffect(() => {
    if (open) panelRef.current?.focus({ preventScroll: true });
  }, [open]);

  return (
    <div
      className={clsx("fixed inset-0 z-[90]", open ? "pointer-events-auto" : "pointer-events-none")}
      aria-hidden={!open}
    >
      <div
        onClick={onClose}
        className={clsx(
          "absolute inset-0 bg-ink/45 backdrop-blur-[2px] transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        inert={!open}
        className={clsx(
          "absolute inset-y-0 flex flex-col bg-white shadow-pop outline-none",
          "transition-transform duration-[380ms] ease-[cubic-bezier(0.22,0.8,0.2,1)]",
          side === "start" ? "start-0" : "end-0",
          open
            ? "translate-x-0"
            : side === "start"
              ? "-translate-x-full rtl:translate-x-full"
              : "translate-x-full rtl:-translate-x-full",
          className ?? "w-[min(92vw,26rem)]",
        )}
      >
        {!bare && (
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="icon-btn absolute end-3 top-3 z-10"
          >
            <X size={20} />
          </button>
        )}
        {children}
      </div>
    </div>
  );
}

interface ModalProps {
  open: boolean;
  onClose: () => void;
  label: string;
  closeLabel: string;
  children: ReactNode;
  className?: string;
}

export function Modal({ open, onClose, label, closeLabel, children, className }: ModalProps) {
  useScrollLock(open);
  useEscape(open, onClose);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && !ref.current?.contains(document.activeElement)) {
      ref.current?.focus({ preventScroll: true });
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[95] flex items-end justify-center sm:items-center sm:p-6">
      <div onClick={onClose} className="absolute inset-0 animate-fade-in bg-ink/50 backdrop-blur-sm" />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        className={clsx(
          "relative flex max-h-[88vh] w-full animate-pop-in flex-col overflow-hidden bg-white shadow-pop outline-none",
          "rounded-t-3xl sm:max-w-2xl sm:rounded-3xl",
          className,
        )}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={closeLabel}
          className="icon-btn absolute end-3 top-3 z-10 bg-white/80"
        >
          <X size={20} />
        </button>
        {children}
      </div>
    </div>
  );
}
