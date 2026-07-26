"use client";

import { usePathname, useRouter } from "next/navigation";

export default function BackButton() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/feed") return null;

  return (
    <button
      onClick={() => router.back()}
      className="lg:hidden p-1 -ml-1 rounded-lg hover:bg-base-200 text-base-content/50 hover:text-base-content transition-colors"
    >
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
    </button>
  );
}
