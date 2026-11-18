"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AccountRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard?tab=settings");
  }, [router]);

  return (
    <div className="p-12 text-center text-xs text-[#65736B]">
      Redirecting to User Dashboard...
    </div>
  );
}
