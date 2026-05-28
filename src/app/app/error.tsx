"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app] route error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-xl font-semibold text-cx-forest-dark">Something went wrong</h1>
      <p className="max-w-md text-sm text-cx-forest-dark/70">
        We couldn&apos;t load this page. Try again, or sign in from the home page.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-none bg-cx-forest-dark px-4 py-2 text-sm font-semibold text-white hover:bg-cx-forest-dark/90"
        >
          Try again
        </button>
        <Link
          href="/login"
          className="text-sm font-medium text-cx-forest-dark underline hover:no-underline"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
