/**
 * レンズデータの型定義
 * /data/lenses/*.json のスキーマに対応
 */

/**
 * メタ情報
 */
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

/**
 * 分類情報
 */
export interface LensClassification {
  focal_length_type: string;
  design_type: string;
  era: string;
  category_tags: string[];
}

/**
 * 光学構成
 */
export interface OpticalConstruction {
  elements: number;
  groups: number;
  diagram_notes?: string;
}

/**
 * コーティング情報
 */
export interface Coating {
  type: string;
  multi_layer: boolean;
  notes?: string;
}

/**
 * スペック
 */
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

/**
 * シャープネス情報
 */
export interface Sharpness {
  wide_open: string;
  stopped_down: string;
}

/**
 * 描写特性
 */
export interface RenderingCharacteristics {
  sharpness: Sharpness;
  bokeh: string;
  contrast: string;
  color: string;
  flare_resistance: string;
  ghosting: string;
}

/**
 * 収差情報
 */
export interface Aberrations {
  chromatic_aberration: string;
  spherical_aberration: string;
  distortion: string;
  vignetting: string;
}

/**
 * 価格範囲
 */
export interface PriceRange {
  min: number;
  max: number;
}

/**
 * 市場情報
 */
export interface MarketInfo {
  price_range_jpy: PriceRange;
  availability: string;
  common_issues: string[];
}

/**
 * 互換性情報
 */
export interface Compatibility {
  adaptable_to: string[];
  infinity_focus_possible: boolean;
}

/**
 * メディア情報
 */
export interface Media {
  sample_images: string[];
  optical_diagram?: string;
}

/**
 * 編集情報
 */
export interface Editorial {
  summary: string;
  historical_notes?: string;
}

/**
 * レンズデータの完全な型定義
 */
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
