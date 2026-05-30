"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function SignupRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    const next = params.get("next") ?? "/app/onboarding";
    params.delete("next");
    params.set("next", next);
    router.replace(`/login?${params.toString()}`);
  }, [router, searchParams]);

  return null;
}

/** Legacy route — unified auth lives at /login */
export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupRedirect />
    </Suspense>
  );
}
