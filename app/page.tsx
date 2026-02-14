/* 変更点:
 * - text-white を削除、text-[#111111] に統一
 * - dark: 関連の色指定を削除
 * - PageContainer が max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 を適用（モバイル/PC両対応）
 * - グリッドに sm:grid-cols-2 lg:grid-cols-3 でレスポンシブ対応
 */
import { getAllLenses } from "../lib/lenses";
import { PageContainer } from "../components/ui/PageContainer";
import { LensCard } from "../components/ui/LensCard";

export default function Home() {
  const lenses = getAllLenses();

  return (
    <PageContainer>
      <header className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-[#111111] sm:text-3xl">
          レンズ一覧
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          {lenses.length} 件
        </p>
      </header>

      {lenses.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm sm:p-10">
          <p className="text-sm text-gray-600">
            レンズデータがありません。
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {lenses.map((lens) => (
            <LensCard key={lens.meta.slug} lens={lens} />
          ))}
        </div>
      )}
    </PageContainer>
  );
}
