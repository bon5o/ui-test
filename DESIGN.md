# レンズデータ駆動型サイト設計書

## 1. プロジェクト概要

### 目的
- レンズ構成（design_type）の歴史的変遷を整理
- rendering_characteristics を用いた描写比較を可能にする
- release_year と design_type を用いて光学設計思想の進化を可視化する

### 技術スタック
- **フレームワーク**: Next.js 16 (App Router)
- **スタイリング**: Tailwind CSS v4
- **言語**: TypeScript
- **ビルド**: SSG (Static Site Generation)
- **データソース**: `/data/lenses/*.json`

---

## 2. フォルダ構成

```
ui-test/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # ルートレイアウト（既存）
│   ├── page.tsx                 # トップページ（一覧ページ）
│   ├── lenses/                  # レンズ関連ページ
│   │   ├── page.tsx            # 一覧ページ（フィルタ機能付き）
│   │   ├── [slug]/             # 動的ルーティング
│   │   │   └── page.tsx        # 詳細ページ
│   │   └── compare/            # 比較ページ
│   │       └── page.tsx        # 比較ページ（クエリパラメータベース）
│   └── timeline/                # タイムラインページ
│       └── page.tsx            # 設計思想タイムライン
│
├── components/                   # 再利用可能コンポーネント
│   ├── layout/                  # レイアウトコンポーネント（既存）
│   │   ├── SiteLayout.tsx
│   │   └── ThemeToggle.tsx
│   │
│   ├── lenses/                  # レンズ専用コンポーネント
│   │   ├── LensCard.tsx        # 一覧用カード
│   │   ├── LensDetail.tsx      # 詳細表示
│   │   ├── LensSpecs.tsx      # スペック表示
│   │   ├── RenderingChart.tsx  # レーダーチャート（rendering_characteristics）
│   │   ├── AberrationChart.tsx # 収差チャート
│   │   └── OpticalDiagram.tsx  # 光学図表示
│   │
│   ├── filters/                 # フィルタコンポーネント
│   │   ├── FilterBar.tsx       # フィルタバー
│   │   ├── EraFilter.tsx       # 時代フィルタ
│   │   ├── DesignTypeFilter.tsx # 設計タイプフィルタ
│   │   └── ManufacturerFilter.tsx # メーカーフィルタ
│   │
│   ├── comparison/              # 比較ページ用コンポーネント
│   │   ├── ComparisonTable.tsx # 比較テーブル
│   │   ├── ComparisonCharts.tsx # 比較チャート
│   │   └── LensSelector.tsx    # レンズ選択UI
│   │
│   ├── timeline/                # タイムライン用コンポーネント
│   │   ├── TimelineView.tsx    # タイムライン表示
│   │   ├── DesignTypeTimeline.tsx # 設計タイプ別タイムライン
│   │   └── EvolutionChart.tsx  # 進化チャート
│   │
│   └── ui/                      # 汎用UIコンポーネント（既存）
│       └── Icons.tsx
│
├── lib/                         # ビジネスロジック層
│   ├── data/                    # データ取得層
│   │   ├── lenses.ts          # レンズデータ取得関数
│   │   ├── filters.ts         # フィルタリング関数
│   │   └── metadata.ts        # メタデータ取得（generateStaticParams用）
│   │
│   ├── types/                   # 型定義
│   │   ├── lens.ts            # レンズ型定義
│   │   ├── filter.ts          # フィルタ型定義
│   │   └── chart.ts           # チャート用型定義
│   │
│   ├── utils/                   # ユーティリティ関数
│   │   ├── rendering.ts       # rendering_characteristics 数値マッピング
│   │   ├── aberrations.ts     # aberrations 数値マッピング
│   │   ├── date.ts            # 日付関連ユーティリティ
│   │   └── slug.ts            # slug生成・検証
│   │
│   └── constants/               # 定数定義
│       ├── design-types.ts    # design_type 定数
│       ├── eras.ts            # era 定数
│       └── manufacturers.ts   # manufacturer 定数
│
├── data/                        # データソース
│   └── lenses/                 # レンズJSONファイル
│       ├── *.json             # 各レンズのJSONデータ
│
└── public/                      # 静的アセット
    └── images/
        └── lenses/            # レンズ画像・光学図
```

---

## 3. 型定義設計

### 3.1 レンズ型定義 (`lib/types/lens.ts`)

```typescript
// JSONスキーマに完全対応した型定義
export interface LensMeta {
  id: string;
  name: string;
  slug: string;
  manufacturer_id: string;
  mount_id: string;
  release_year: number;
  production_period: string;
  country: string;
}

export interface LensClassification {
  focal_length_type: string;
  design_type: string;
  era: string;
  category_tags: string[];
}

export interface OpticalConstruction {
  elements: number;
  groups: number;
  diagram_notes?: string;
}

export interface Coating {
  type: string;
  multi_layer: boolean;
  notes?: string;
}

export interface Specifications {
  focal_length_mm: number;
  max_aperture: number;
  min_aperture: number;
  aperture_blades: number;
  min_focus_distance_m: number;
  filter_diameter_mm: number;
  weight_g: number;
  focus_type: string;
  aperture_control: string;
}

export interface RenderingCharacteristics {
  sharpness: {
    wide_open: string;
    stopped_down: string;
  };
  bokeh: string;
  contrast: string;
  color: string;
  flare_resistance: string;
  ghosting: string;
}

export interface Aberrations {
  chromatic_aberration: string;
  spherical_aberration: string;
  distortion: string;
  vignetting: string;
}

export interface MarketInfo {
  price_range_jpy: {
    min: number;
    max: number;
  };
  availability: string;
  common_issues: string[];
}

export interface Compatibility {
  adaptable_to: string[];
  infinity_focus_possible: boolean;
}

export interface Media {
  sample_images: string[];
  optical_diagram?: string;
}

export interface Editorial {
  summary: string;
  historical_notes?: string;
}

export interface Lens {
  meta: LensMeta;
  classification: LensClassification;
  optical_construction: OpticalConstruction;
  coating: Coating;
  specifications: Specifications;
  rendering_characteristics: RenderingCharacteristics;
  aberrations: Aberrations;
  market_info: MarketInfo;
  compatibility: Compatibility;
  media: Media;
  editorial: Editorial;
}

// 一覧ページ用の軽量型
export interface LensSummary {
  meta: LensMeta;
  classification: LensClassification;
  specifications: Pick<Specifications, 'focal_length_mm' | 'max_aperture'>;
  editorial: Pick<Editorial, 'summary'>;
}
```

### 3.2 フィルタ型定義 (`lib/types/filter.ts`)

```typescript
export interface LensFilters {
  era?: string[];
  design_type?: string[];
  manufacturer?: string[];
  focal_length_type?: string[];
  mount?: string[];
  min_year?: number;
  max_year?: number;
}

export interface FilterOptions {
  eras: string[];
  design_types: string[];
  manufacturers: string[];
  focal_length_types: string[];
  mounts: string[];
  year_range: {
    min: number;
    max: number;
  };
}
```

### 3.3 チャート用型定義 (`lib/types/chart.ts`)

```typescript
// rendering_characteristics の数値マッピング用
export interface RenderingMetrics {
  sharpness: number;      // 0-100
  bokeh: number;          // 0-100
  contrast: number;       // 0-100
  color: number;          // 0-100 (warm/cool傾向)
  flare_resistance: number; // 0-100
  ghosting_resistance: number; // 0-100 (ghostingの逆)
}

// aberrations の数値マッピング用
export interface AberrationMetrics {
  chromatic_aberration: number;  // 0-100 (低いほど良い)
  spherical_aberration: number;  // 0-100
  distortion: number;            // 0-100
  vignetting: number;            // 0-100
}

// レーダーチャート用データポイント
export interface ChartDataPoint {
  label: string;
  value: number;
  maxValue: number;
}
```

---

## 4. データ取得層の設計

### 4.1 レンズデータ取得 (`lib/data/lenses.ts`)

**設計思想**:
- ビルド時に全JSONファイルを読み込み、メモリにキャッシュ
- 型安全な取得関数を提供
- フィルタリング・ソート機能を分離

**主要関数**:
```typescript
// 全レンズデータ取得（ビルド時）
export function getAllLenses(): Lens[]

// slugから単一レンズ取得
export function getLensBySlug(slug: string): Lens | null

// フィルタ適用
export function getFilteredLenses(filters: LensFilters): Lens[]

// メタデータ取得（generateStaticParams用）
export function getAllLensSlugs(): string[]

// ユニークな値の取得（フィルタオプション生成用）
export function getUniqueEras(): string[]
export function getUniqueDesignTypes(): string[]
export function getUniqueManufacturers(): string[]
```

**実装方針**:
- `fs.readdirSync` + `fs.readFileSync` でビルド時に全JSONを読み込み
- JSON.parse + Zod等でバリデーション（オプション）
- メモ化してパフォーマンス最適化

### 4.2 フィルタリング (`lib/data/filters.ts`)

**設計思想**:
- 関数型アプローチでフィルタを合成可能に
- 各フィルタ条件を独立した関数として実装

**主要関数**:
```typescript
export function filterByEra(lenses: Lens[], eras: string[]): Lens[]
export function filterByDesignType(lenses: Lens[], types: string[]): Lens[]
export function filterByManufacturer(lenses: Lens[], manufacturers: string[]): Lens[]
export function filterByYearRange(lenses: Lens[], min: number, max: number): Lens[]

// 複合フィルタ
export function applyFilters(lenses: Lens[], filters: LensFilters): Lens[]
```

### 4.3 メタデータ取得 (`lib/data/metadata.ts`)

**設計思想**:
- `generateStaticParams` 用の軽量なメタデータ取得
- 全JSONを読み込まず、ファイル名からslugを生成可能なら最適化

**主要関数**:
```typescript
// 全slug取得（generateStaticParams用）
export function getAllSlugs(): string[]

// 必要に応じて、追加メタデータも取得可能
export function getSlugsWithMetadata(): Array<{ slug: string; year: number }>
```

---

## 5. 数値マッピング設計

### 5.1 rendering_characteristics の数値マッピング (`lib/utils/rendering.ts`)

**設計思想**:
- テキストベースの特性を0-100の数値にマッピング
- 主観的な評価を標準化
- チャート表示用に正規化

**マッピングルール**:

```typescript
// sharpness: "wide_open" と "stopped_down" を統合評価
// "very sharp" → 90-100
// "sharp" → 70-89
// "good" → 50-69
// "moderate" → 30-49
// "soft" → 0-29

// bokeh: テキストから数値化
// "creamy", "smooth" → 80-100
// "natural", "pleasant" → 60-79
// "firm", "busy" → 40-59
// "harsh" → 0-39

// contrast: 
// "high" → 80-100
// "moderate-high" → 60-79
// "moderate" → 50-59
// "moderate-low" → 40-49
// "low" → 0-39

// color: warm/cool傾向を数値化
// "warm tendency" → 60-80 (warm側)
// "neutral" → 40-60
// "cool tendency" → 20-40 (cool側)

// flare_resistance: 抵抗性（高いほど良い）
// "excellent" → 90-100
// "good" → 70-89
// "moderate" → 50-69
// "weak" → 30-49
// "poor" → 0-29

// ghosting: 抵抗性（低いほど良い → 逆転して数値化）
// "none" → 100
// "minimal" → 80-99
// "visible" → 50-79
// "strong" → 0-49
```

**実装関数**:
```typescript
export function mapRenderingToMetrics(
  rendering: RenderingCharacteristics
): RenderingMetrics

export function parseSharpnessText(text: string): number
export function parseBokehText(text: string): number
export function parseContrastText(text: string): number
export function parseColorText(text: string): number
export function parseFlareResistanceText(text: string): number
export function parseGhostingText(text: string): number
```

### 5.2 aberrations の数値マッピング (`lib/utils/aberrations.ts`)

**設計思想**:
- 収差は「低いほど良い」ので、0-100スケールで「問題の程度」を表現
- 比較チャートでは視覚的に分かりやすく

**マッピングルール**:

```typescript
// chromatic_aberration, spherical_aberration, distortion, vignetting
// "none" / "minimal" → 0-20
// "low" → 21-40
// "moderate" / "present" → 41-60
// "high" / "strong" → 61-80
// "severe" → 81-100
```

**実装関数**:
```typescript
export function mapAberrationsToMetrics(
  aberrations: Aberrations
): AberrationMetrics

export function parseAberrationLevel(text: string): number
```

---

## 6. コンポーネント分割方針

### 6.1 ページコンポーネント (`app/`)

**設計思想**:
- ページコンポーネントは薄く保ち、データ取得とレイアウトのみ
- ビジネスロジックは `lib/` 層に分離
- 表示ロジックは `components/` に分離

**各ページの責務**:

1. **`app/page.tsx`** (トップページ)
   - サイト概要と主要ナビゲーション
   - 最新レンズのハイライト表示

2. **`app/lenses/page.tsx`** (一覧ページ)
   - フィルタ状態の管理（URLSearchParams）
   - フィルタ適用後のレンズ一覧表示
   - ページネーション（必要に応じて）

3. **`app/lenses/[slug]/page.tsx`** (詳細ページ)
   - slugからレンズデータ取得
   - 詳細情報の表示
   - 関連レンズの提案

4. **`app/lenses/compare/page.tsx`** (比較ページ)
   - クエリパラメータから比較対象を取得（例: `?lens1=slug1&lens2=slug2`）
   - 比較テーブル・チャートの表示
   - レンズ選択UI

5. **`app/timeline/page.tsx`** (タイムラインページ)
   - 年表形式での表示
   - design_type 別の色分け
   - インタラクティブなフィルタ

### 6.2 レンズ表示コンポーネント (`components/lenses/`)

**LensCard.tsx**:
- 一覧ページ用のカード表示
- サムネイル、基本情報、タグ表示
- クリックで詳細ページへ遷移

**LensDetail.tsx**:
- 詳細ページのメインコンテナ
- 各セクション（スペック、描写特性、収差等）を統合

**LensSpecs.tsx**:
- スペック表の表示
- レスポンシブなテーブル/グリッドレイアウト

**RenderingChart.tsx**:
- レーダーチャート表示（rendering_characteristics）
- SVGまたはChart.js等のライブラリ使用
- 6軸（sharpness, bokeh, contrast, color, flare_resistance, ghosting_resistance）

**AberrationChart.tsx**:
- 収差の可視化
- バーチャートまたはレーダーチャート
- 4軸（chromatic, spherical, distortion, vignetting）

**OpticalDiagram.tsx**:
- 光学図の表示
- SVG画像の読み込みと表示
- フォールバック処理

### 6.3 フィルタコンポーネント (`components/filters/`)

**FilterBar.tsx**:
- フィルタUIの統合コンテナ
- URLSearchParamsとの同期
- クリア機能

**EraFilter.tsx, DesignTypeFilter.tsx, ManufacturerFilter.tsx**:
- 各フィルタタイプ専用コンポーネント
- チェックボックスまたはマルチセレクト
- 選択状態の視覚的フィードバック

### 6.4 比較コンポーネント (`components/comparison/`)

**ComparisonTable.tsx**:
- サイドバイサイド比較テーブル
- 差分のハイライト表示

**ComparisonCharts.tsx**:
- 複数レンズのレーダーチャートを重ねて表示
- 凡例とインタラクティブなホバー

**LensSelector.tsx**:
- 比較対象レンズの選択UI
- 検索・フィルタ機能付き

### 6.5 タイムラインコンポーネント (`components/timeline/`)

**TimelineView.tsx**:
- 年表形式の表示
- 縦軸：年、横軸：design_type
- インタラクティブなズーム・パン

**DesignTypeTimeline.tsx**:
- design_type 別のタイムライン
- 色分けと凡例

**EvolutionChart.tsx**:
- 設計思想の進化を可視化
- 年ごとの design_type 分布
- スタックバーまたはエリアチャート

---

## 7. SSG実装設計

### 7.1 generateStaticParams

**`app/lenses/[slug]/page.tsx`**:
```typescript
export async function generateStaticParams() {
  const slugs = getAllLensSlugs();
  return slugs.map((slug) => ({ slug }));
}
```

**`app/lenses/compare/page.tsx`**:
- 比較ページは動的ルーティングではなく、クエリパラメータベース
- SSGは不要（必要に応じてISR）

### 7.2 データ取得の最適化

- ビルド時に全JSONを読み込み、型安全なデータ構造に変換
- 詳細ページでは必要なレンズのみ取得
- 一覧ページでは軽量な `LensSummary` 型を使用

---

## 8. 視覚化UI案

### 8.1 レーダーチャート（rendering_characteristics）

**技術選択**:
- **Option 1**: SVG + React（軽量、カスタマイズ容易）
- **Option 2**: Recharts / Chart.js（実績あり、機能豊富）
- **Option 3**: D3.js（高度なカスタマイズ可能）

**推奨**: Recharts（TypeScript対応、Next.jsとの親和性）

**表示項目**:
- Sharpness（シャープネス）
- Bokeh（ボケ）
- Contrast（コントラスト）
- Color（色味）
- Flare Resistance（フレア耐性）
- Ghosting Resistance（ゴースト耐性）

**デザイン**:
- 6角形のレーダーチャート
- 各軸は0-100スケール
- 複数レンズ比較時は重ねて表示、透明度で区別

### 8.2 収差チャート（aberrations）

**表示形式**:
- バーチャート（4項目を横並び）
- またはレーダーチャート（4角形）

**カラーコーディング**:
- 低い値（問題少ない）: 緑系
- 高い値（問題多い）: 赤系

### 8.3 タイムライン表示

**表示形式**:
- 縦軸：年（1960-現在）
- 横軸：design_type（またはメーカー）
- 各レンズを点またはバブルで表示
- クリックで詳細表示

**インタラクション**:
- ズーム・パン機能
- フィルタ（era, manufacturer）で絞り込み
- ホバーでレンズ情報をツールチップ表示

### 8.4 比較ページのレイアウト

**3カラムレイアウト**:
1. 左：レンズ1の詳細
2. 中央：比較チャート・テーブル
3. 右：レンズ2の詳細

**モバイル対応**:
- 縦積みレイアウト
- スワイプで切り替え可能

---

## 9. 拡張性の考慮

### 9.1 100本以上のレンズ追加への対応

**データ層**:
- JSONファイルベースのまま維持可能
- 必要に応じてインデックスファイル（`index.json`）を追加してメタデータを集約

**パフォーマンス**:
- 一覧ページにページネーション実装
- 仮想スクロール（react-window等）を検討
- 画像の遅延読み込み

**検索機能**:
- クライアントサイド検索（Fuse.js等）
- 必要に応じてサーバーサイド検索（Algolia等）も検討

### 9.2 将来的な機能拡張

**想定される追加機能**:
- ユーザーレビュー・評価
- サンプル画像ギャラリー
- レンズマッチング（用途別レンズ推薦）
- 価格トレンド表示
- メーカー別ページ

**設計の柔軟性**:
- コンポーネントを小さく分割し、組み合わせ可能に
- 型定義を拡張可能な構造に
- データ取得層を抽象化し、将来的にAPI化しやすく

---

## 10. パフォーマンス最適化

### 10.1 ビルド時最適化

- JSONファイルの読み込みを一度だけ実行
- 型チェックとバリデーションをビルド時に実施
- 不要なデータの読み込みを避ける

### 10.2 ランタイム最適化

- 画像の最適化（Next.js Image コンポーネント）
- チャートの遅延読み込み
- メモ化による再計算の削減

### 10.3 バンドルサイズ

- チャートライブラリの動的インポート
- 使用しない機能のツリーシェイキング

---

## 11. アクセシビリティ

- セマンティックHTMLの使用
- ARIA属性の適切な設定
- キーボードナビゲーション対応
- スクリーンリーダー対応
- カラーコントラストの確保

---

## 12. 次のステップ

1. **型定義の実装** (`lib/types/`)
2. **データ取得層の実装** (`lib/data/`)
3. **数値マッピング関数の実装** (`lib/utils/`)
4. **基本コンポーネントの実装** (`components/lenses/`)
5. **ページコンポーネントの実装** (`app/`)
6. **フィルタ機能の実装**
7. **チャート表示の実装**
8. **タイムライン表示の実装**
9. **スタイリングの調整**
10. **テストと最適化**

---

## まとめ

この設計は、以下の原則に基づいています：

1. **型安全性**: TypeScriptで完全に型付けされたデータ構造
2. **関心の分離**: データ層、ビジネスロジック層、UI層の明確な分離
3. **拡張性**: 100本以上のレンズ追加に対応可能な構造
4. **パフォーマンス**: SSGによる高速なページ生成
5. **保守性**: 明確なフォルダ構成とコンポーネント分割

この設計に基づいて実装を進めることで、スケーラブルで保守性の高いレンズデータ駆動型サイトを構築できます。
