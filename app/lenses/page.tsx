import { getAllLenses } from "../../lib/lenses";
import type { Lens } from "../../types/lens";
import { LensList } from "./LensList";

export const metadata = {
  title: "レンズ一覧 | オールドレンズ構成の歴史と描写研究",
  description: "オールドレンズの一覧とフィルタリング機能",
};

export default function LensesPage() {
  const lenses = getAllLenses();

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold text-[#111111] sm:text-4xl">
        レンズ一覧
      </h1>
      <LensList initialLenses={lenses} />
    </div>
  );
}
