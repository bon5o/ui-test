/* 変更点:
 * - text-white を削除、text-[#111111] に統一
 * - dark: 関連の色指定を削除
 * - PageContainer が max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 を適用（モバイル/PC両対応）
 * - グリッドに sm:grid-cols-2 lg:grid-cols-3 でレスポンシブ対応
 * - LensList（フィルター付き）でレンズ一覧を表示（/lenses と同構造）
 */
import { getAllLenses } from "../lib/lenses";
import { PageContainer } from "../components/ui/PageContainer";
import { LensList } from "./lenses/LensList";

export default function Home() {
  const lenses = getAllLenses();

  return (
    <PageContainer>
      <header className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-[#111111] sm:text-3xl">
          レンズ一覧
        </h1>
      </header>

      <LensList initialLenses={lenses} />
    </PageContainer>
  );
}
