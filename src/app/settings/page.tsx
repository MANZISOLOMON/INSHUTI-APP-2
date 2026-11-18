"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SettingsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard?tab=settings");
  }, [router]);

  return (
    <div className="p-12 text-center text-xs text-[#65736B]">
      Redirecting to Account & Privacy Settings...
    </div>
  );
}
