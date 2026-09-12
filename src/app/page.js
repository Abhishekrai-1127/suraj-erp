"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/login");
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white font-sans">
      <div className="text-xs font-semibold animate-pulse text-slate-400">
        Redirecting to Suraj ERP Login...
      </div>
    </div>
  );
}
