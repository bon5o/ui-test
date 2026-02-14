/* ========================================
   ファイル: components/ui/LensCard.tsx
   UX意図: 薄い水色・青系でカードを統一。ホバーで浮き上がりと青アクセント
   レスポンシブ: タッチデバイスで十分なタップ領域を確保
   ======================================== */
import Link from "next/link";
import type { Lens } from "../../types/lens";

interface LensCardProps {
  lens: Lens;
}

export function LensCard({ lens }: LensCardProps) {
  return (
    <Link
      href={`/lenses/${lens.meta.slug}`}
      className="group block rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-md"
    >
      <h3 className="text-lg font-semibold text-[#111111] transition-colors group-hover:text-blue-500">
        {lens.meta.name}
      </h3>
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
          {lens.classification.design_type}
        </span>
        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
          {lens.classification.era}
        </span>
      </div>
      <dl className="mt-4 space-y-1.5 text-sm text-gray-600">
        <div className="flex justify-between">
          <dt>発売年</dt>
          <dd className="font-medium text-[#111111]">{lens.meta.release_year}</dd>
        </div>
        <div className="flex justify-between">
          <dt>焦点距離</dt>
          <dd className="font-medium text-[#111111]">{lens.specifications.focal_length_mm}mm</dd>
        </div>
        <div className="flex justify-between">
          <dt>最大F値</dt>
          <dd className="font-medium text-[#111111]">f/{lens.specifications.max_aperture}</dd>
        </div>
      </dl>
    </Link>
  );
}
