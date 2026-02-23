/**
 * レンズ一覧用の軽量インデックス型
 * data/lens_index.json のスキーマに対応
 */
export interface LensIndexItem {
  id: string;
  name: string;
  manufacturer?: string;
  mount?: string;
  release_year?: number;
  decade?: string;
  design_type?: string;
  coating?: string;
  price_min?: number;
  price_max?: number;
  characteristics?: string[];
  tags?: string[];
}
