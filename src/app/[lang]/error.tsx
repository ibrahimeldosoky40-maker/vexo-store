"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

/** Route error boundary — any uncaught render error ends up here, never a blank page. */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-x flex min-h-[50vh] flex-col items-center justify-center gap-5 py-24 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-coral-soft text-coral">
        <AlertTriangle size={30} />
      </span>
      <h1 className="font-display text-3xl font-extrabold text-ink">Something went wrong</h1>
      <p className="max-w-md text-muted">An unexpected error occurred. Please try again.</p>
      <button type="button" onClick={reset} className="btn btn-primary">
        Try again
      </button>
    </div>
  );
}
