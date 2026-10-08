import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

/** Brand glyphs (lucide dropped brand icons in v1). Decorative: pair with aria-label on the link. */
export function InstagramIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5.2" />
      <circle cx="12" cy="12" r="4.1" />
      <circle cx="17.4" cy="6.6" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function FacebookIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M13.5 21v-7.6h2.6l.4-3h-3V8.5c0-.9.3-1.5 1.5-1.5h1.6V4.3c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.8v3h2.6V21h3.1z" />
    </svg>
  );
}

export function XIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function TikTokIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M16.6 3c.3 2.3 1.6 3.7 3.9 3.9v3c-1.4.1-2.6-.3-3.9-1.1v5.6c0 7.1-7.7 9.3-10.8 4.2-2-3.3-.8-9.1 5.5-9.3v3.2c-.5.1-1 .2-1.5.5-1.4.8-1.8 2.5-1 3.8 1.5 2.5 5.100 1.500 5.100-1.800V3h2.700z" />
    </svg>
  );
}

export function YouTubeIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.200 0-7.800.4A2.500 2.500 0 0 0 2.400 7.200C2 8.800 2 12 2 12s0 3.200.4 4.800a2.500 2.500 0 0 0 1.800 1.800C5.800 19 12 19 12 19s6.200 0 7.800-.4a2.500 2.500 0 0 0 1.800-1.800c.4-1.600.4-4.800.4-4.800s0-3.200-.4-4.800zM10 15V9l5.200 3L10 15z" />
    </svg>
  );
}

/* ---- Payment badges ---------------------------------------------------- */

const badge = "flex h-8 w-12 items-center justify-center rounded-md bg-white shadow-sm ring-1 ring-black/5";

export function PaymentIcons({ className }: { className?: string }) {
  return (
    <ul className={className} aria-label="Accepted payment methods">
      <li className={badge} title="Visa">
        <span className="text-[13px] font-extrabold italic tracking-tight text-[#1a1f71]">VISA</span>
      </li>
      <li className={badge} title="Mastercard">
        <svg viewBox="0 0 32 20" className="h-5 w-8" aria-hidden>
          <circle cx="12" cy="10" r="7" fill="#eb001b" />
          <circle cx="20" cy="10" r="7" fill="#f79e1b" fillOpacity="0.92" />
        </svg>
      </li>
      <li className={badge} title="American Express">
        <span className="rounded-[3px] bg-[#2e77bc] px-1 py-0.5 text-[8px] font-extrabold leading-none tracking-wider text-white">AMEX</span>
      </li>
      <li className={badge} title="PayPal">
        <span className="text-[11px] font-extrabold italic text-[#003087]">Pay<span className="text-[#009cde]">Pal</span></span>
      </li>
      <li className={badge} title="Apple Pay">
        <span className="text-[11px] font-bold text-black"> Pay</span>
      </li>
      <li className={badge} title="Google Pay">
        <span className="text-[11px] font-bold text-[#5f6368]"><span className="text-[#4285f4]">G</span> Pay</span>
      </li>
    </ul>
  );
}
