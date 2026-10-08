import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";

/**
 * Full Vexo Store logo (graphic mark + wordmark + subtitle), used as-is.
 * Source: /public/brand/logo.png — regenerate with scripts/generate-brand-assets.py.
 */
export function Logo({
  href,
  className,
  imgClassName,
  priority = false,
  height,
}: {
  href: string;
  className?: string;
  /** Responsive sizing via classes (e.g. `h-12 lg:h-[72px]`); width follows the aspect ratio. */
  imgClassName?: string;
  priority?: boolean;
  /** Fixed rendered height in px (ignored when `imgClassName` is set). */
  height?: number;
}) {
  return (
    <Link
      href={href}
      aria-label="Vexo Store — home"
      className={clsx("inline-flex shrink-0 items-center transition-transform duration-300 hover:scale-[1.04]", className)}
    >
      <Image
        src="/brand/logo.png"
        alt="Vexo Store — iPhone cases & smart watch accessories"
        width={483}
        height={361}
        priority={priority}
        style={imgClassName ? undefined : { height: height ?? 64, width: "auto" }}
        className={clsx("w-auto select-none", imgClassName)}
      />
    </Link>
  );
}
