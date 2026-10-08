"use client";

import { useState } from "react";
import { ArrowRight, Check, Mail } from "lucide-react";
import { useI18n } from "@/components/providers/I18nProvider";

/**
 * Newsletter signup. UI-only for now: it validates and confirms locally.
 * Wire to Shopify (customerCreate w/ acceptsMarketing) or Klaviyo when ready.
 */
export function NewsletterForm() {
  const { dict } = useI18n();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "done" | "invalid">("idle");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState(/^\S+@\S+\.\S+$/.test(email.trim()) ? "done" : "invalid");
  }

  return (
    <form onSubmit={onSubmit} noValidate className="w-full max-w-md">
      <div className="relative">
        <Mail size={18} className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-white/50" />
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (state !== "idle") setState("idle");
          }}
          placeholder={dict.footer.newsletterPlaceholder}
          aria-label={dict.footer.newsletterPlaceholder}
          aria-invalid={state === "invalid"}
          className="h-14 w-full rounded-full bg-white/10 ps-11 pe-36 text-[15px] text-white outline-none ring-1 ring-white/15 transition placeholder:text-white/45 focus:bg-white/15 focus:ring-teal"
        />
        <button
          type="submit"
          className="absolute end-1.5 top-1.5 flex h-11 items-center gap-1.5 rounded-full bg-gradient-to-r from-teal to-brand-500 px-5 text-sm font-bold text-white transition-transform hover:scale-[1.03] active:scale-95"
        >
          {dict.footer.subscribe}
          <ArrowRight size={15} className="rtl:-scale-x-100" />
        </button>
      </div>
      <p
        role="status"
        className={`mt-2.5 flex min-h-5 items-center gap-1.5 text-sm ${state === "invalid" ? "text-coral" : "text-teal"}`}
      >
        {state === "done" && (
          <>
            <Check size={15} /> {dict.footer.subscribed}
          </>
        )}
        {state === "invalid" && dict.footer.invalidEmail}
      </p>
    </form>
  );
}
