# UI/UX 改善提案書

## 1. 具体的な改善アイデア

### 1.1 色（Color）
- **アクセントカラー**: 光学/カメラ感のある青紫〜バイオレット系（`violet-600`, `indigo-600`）を採用
- **背景階層**: 明るい背景は `slate-50`、カードは `white` で区別。ダークモードは `slate-950` ベース
- **境界線**: `slate-200` / `slate-700` でソフトなセパレーション

### 1.2 フォント（Typography）
- **見出し**: `font-semibold` + `tracking-tight` で可読性向上
- **本文**: `text-slate-700` / `dark:text-slate-300` でコントラスト確保
- **日本語**: `font-feature-settings: "palt"` でプロポーショナルメトリクス適用（既存）

### 1.3 余白（Spacing）
- **ページコンテナ**: `max-w-6xl` + `px-4 sm:px-6 lg:px-8` + `py-8 sm:py-10`
- **セクション間**: `space-y-8` / `mb-8`
- **カード内**: `p-6` で十分なパディング

### 1.4 カード（Card）
- シャドウ: `shadow-sm` → ホバー時 `shadow-md`
- 角丸: `rounded-xl` でモダンな印象
- ホバー: `transition-all duration-200` + `hover:shadow-md hover:-translate-y-0.5`

### 1.5 ボタン・リンク
- **ナビリンク**: `rounded-lg px-4 py-2` でタップ領域確保
- **カードリンク**: ブロック全体をクリック可能にし、ホバーで視覚的フィードバック

### 1.6 レスポンシブ
- **グリッド**: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` で段階的変化
- **ナビ**: `hidden md:flex` でモバイルは別ナビ表示
- **タイポグラフィ**: `text-2xl sm:text-3xl` で画面幅に応じたサイズ

---

## 2. 改善例のコンポーネントコード

### 2.1 PageContainer（共通レイアウト）

```tsx
// components/ui/PageContainer.tsx
interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function PageContainer({ children, className = "" }: PageContainerProps) {
  return (
    <div
      className={`mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 ${className}`}
    >
      {children}
    </div>
  );
}
```

### 2.2 LensCard（レンズ一覧カード）

```tsx
// components/ui/LensCard.tsx
import Link from "next/link";
import type { Lens } from "../../types/lens";

interface LensCardProps {
  lens: Lens;
}

export function LensCard({ lens }: LensCardProps) {
  return (
    <Link
      href={`/lenses/${lens.meta.slug}`}
      className="group block rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600"
    >
      <h3 className="text-lg font-semibold text-slate-900 transition-colors group-hover:text-violet-600 dark:text-slate-100 dark:group-hover:text-violet-400">
        {lens.meta.name}
      </h3>
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
          {lens.classification.design_type}
        </span>
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
          {lens.classification.era}
        </span>
      </div>
      <dl className="mt-4 space-y-1 text-sm text-slate-600 dark:text-slate-400">
        <div className="flex justify-between">
          <dt>発売年</dt>
          <dd>{lens.meta.release_year}</dd>
        </div>
        <div className="flex justify-between">
          <dt>焦点距離</dt>
          <dd>{lens.specifications.focal_length_mm}mm</dd>
        </div>
        <div className="flex justify-between">
          <dt>最大F値</dt>
          <dd>f/{lens.specifications.max_aperture}</dd>
        </div>
      </dl>
    </Link>
  );
}
```

### 2.3 SectionHeading（セクション見出し）

```tsx
// components/ui/SectionHeading.tsx
interface SectionHeadingProps {
  children: React.ReactNode;
  className?: string;
}

export function SectionHeading({ children, className = "" }: SectionHeadingProps) {
  return (
    <h2
      className={`border-b border-slate-200 pb-3 text-lg font-semibold text-slate-800 dark:border-slate-700 dark:text-slate-200 ${className}`}
    >
      {children}
    </h2>
  );
}
```

### 2.4 改善されたナビリンク

```tsx
// NavLink のクラス例
className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
```

---

## 3. どのファイルに追加・修正するか

| 操作 | ファイル | 内容 |
|------|----------|------|
| 追加 | `components/ui/PageContainer.tsx` | ページ共通コンテナ |
| 追加 | `components/ui/LensCard.tsx` | レンズ一覧カード |
| 追加 | `components/ui/SectionHeading.tsx` | セクション見出し |
| 修正 | `app/globals.css` | カスタムプロパティ（`container-page` 等）の定義 |
| 修正 | `components/layout/SiteLayout.tsx` | ナビリンクのスタイル改善 |
| 修正 | `app/page.tsx` | PageContainer + LensCard の使用 |
| 修正 | `app/lenses/[slug]/page.tsx` | PageContainer + SectionHeading の使用 |
| 修正 | `app/design/page.tsx` | PageContainer + カード風リンク |
| 修正 | `app/era/page.tsx` | PageContainer |
| 修正 | `app/maker/page.tsx` | PageContainer |

---

## 4. デザイン・UX 意図の説明

### 4.1 何を改善するか

| 項目 | 現状 | 改善後 |
|------|------|--------|
| **一覧の視認性** | フラットなカード | ホバー時のシャドウ・浮き上がりで選択可能な要素であることを示す |
| **情報の階層** | 同じウェイトのテキスト | タグ・データリストでグループ化し、スキャンしやすくする |
| **タップ領域** | テキストリンク中心 | モバイルで 44px 以上のタップ領域を確保 |
| **余白** | やや窮屈 | 8px グリッドに基づく一貫した余白で「息」を持たせる |
| **アクセント** | 青（blue） | バイオレット系で光学/技術感を演出し、サイトのブランド感を強化 |

### 4.2 モバイル/PC 両対応の方針

- **モバイル**: 1カラム、大きなタップ領域、コンパクトなナビ
- **PC**: 2〜3カラムグリッド、ホバーエフェクト、余白を活かしたレイアウト

### 4.3 アクセシビリティ

- 十分なコントラスト比（WCAG 2.1 AA）
- フォーカス時の輪郭（`:focus-visible`）を維持
- セマンティックな HTML（`<main>`, `<nav>`, `<section>` 等）を活用
