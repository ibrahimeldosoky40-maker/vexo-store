import Link from "next/link";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container-x flex min-h-[50vh] flex-col items-center justify-center gap-5 py-24 text-center">
      <span className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-brand-50 to-teal-soft text-brand-600">
        <SearchX size={34} />
      </span>
      <h1 className="font-display text-4xl font-extrabold text-ink">404</h1>
      <p className="max-w-md text-muted">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
      <Link href="/" className="btn btn-primary">
        Go home
      </Link>
    </div>
  );
}
