"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { useI18n } from "@/components/providers/I18nProvider";
import clsx from "clsx";

/** Promo strip: rotates through messages. Sticks to the very top with the header. */
export function AnnouncementBar() {
  const { dict } = useI18n();
  const messages = dict.announcement.messages;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (messages.length < 2) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % messages.length), 4500);
    return () => window.clearInterval(id);
  }, [messages.length]);

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-brand-900 via-brand-700 to-brand-900 text-white">
      <div className="container-x flex h-9 items-center justify-center">
        <p className="relative flex h-full w-full items-center justify-center text-xs font-medium tracking-wide sm:text-[13px]">
          {messages.map((msg, i) => (
            <span
              key={msg}
              aria-hidden={i !== index}
              className={clsx(
                "absolute inset-x-0 flex items-center justify-center gap-2 transition-all duration-500",
                i === index ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-3 opacity-0",
              )}
            >
              <Sparkles size={14} className="shrink-0 text-amber" />
              <span className="truncate">{msg}</span>
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}
