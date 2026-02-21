"use client";

import { useRouter } from "next/navigation";

export function BackButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="text-sm text-gray-600 transition-colors hover:text-[#5E7AB8] hover:underline"
    >
      ← 戻る
    </button>
  );
}
