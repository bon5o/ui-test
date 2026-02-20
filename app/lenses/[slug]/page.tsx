import React from "react";
import { notFound } from "next/navigation";
import { getAllSlugs, getLensBySlug } from "../../../lib/lenses";
import { PageContainer } from "../../../components/ui/PageContainer";
import { SectionHeading } from "../../../components/ui/SectionHeading";
import type { Lens } from "../../../types/lens";

export async function generateStaticParams() {
  const slugs = getAllSlugs();
  return slugs.map((slug) => ({
    slug,
  }));
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * 引用番号を表示するコンポーネント
 */
function Citations({ citations }: { citations?: number[] }) {
  if (!citations || citations.length === 0) {
    return null;
  }
  return (
    <span className="ml-1 whitespace-nowrap">
      {citations.map((n) => (
        <sup key={n} className="text-xs align-super text-[#7D9CD4] hover:text-[#5E7AB8]">
          <a href={`#ref-${n}`} className="no-underline hover:underline">
            [{n}]
          </a>
        </sup>
      ))}
    </span>
  );
}

/**
 * テキストと引用番号を表示するコンポーネント
 */
function TextWithCitations({ text, citations }: { text: string; citations?: number[] }) {
  return (
    <>
      {text}
      <Citations citations={citations} />
    </>
  );
}

export default async function LensDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const lens = getLensBySlug(slug);

  if (!lens) {
    notFound();
  }

  const rc = lens.rendering_characteristics;

  return (
    <PageContainer className="max-w-3xl">
      <h1 className="mb-8 text-3xl font-bold tracking-tight text-[#111111] sm:text-4xl">
        {lens.meta.name}
      </h1>

      <section className="mb-8">
        <SectionHeading className="mb-4">基本情報</SectionHeading>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
          <dt className="font-medium text-gray-600">発売年</dt>
          <dd>
            {lens.meta.release_year}
            <Citations citations={lens.meta.citations} />
          </dd>
          <dt className="font-medium text-gray-600">設計タイプ</dt>
          <dd>
            {lens.classification.design_type}
            <Citations citations={lens.classification.citations} />
          </dd>
          <dt className="font-medium text-gray-600">時代</dt>
          <dd>{lens.classification.era}</dd>
          <dt className="font-medium text-gray-600">メーカー</dt>
          <dd>{lens.meta.manufacturer_id}</dd>
          <dt className="font-medium text-gray-600">マウント</dt>
          <dd>{lens.meta.mount_id}</dd>
        </dl>
      </section>

      {lens.editorial.summary && (
        <section className="mb-8">
          <SectionHeading className="mb-4">概要</SectionHeading>
          <p className="text-sm text-gray-700">
            <TextWithCitations text={lens.editorial.summary} citations={lens.editorial.citations} />
          </p>
        </section>
      )}

      {lens.editorial.historical_notes && (
        <section className="mb-8">
          <SectionHeading className="mb-4">歴史的備考</SectionHeading>
          <p className="text-sm text-gray-700">
            <TextWithCitations text={lens.editorial.historical_notes} citations={lens.editorial.citations} />
          </p>
        </section>
      )}

      <section className="mb-8">
        <SectionHeading className="mb-4">光学構成</SectionHeading>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
          <dt className="font-medium text-gray-600">レンズ枚数</dt>
          <dd>{lens.optical_construction.elements}枚</dd>
          <dt className="font-medium text-gray-600">グループ数</dt>
          <dd>{lens.optical_construction.groups}群</dd>
          {lens.optical_construction.diagram_notes && (
            <>
              <dt className="font-medium text-gray-600">備考</dt>
              <dd>
                <TextWithCitations text={lens.optical_construction.diagram_notes} citations={lens.optical_construction.citations} />
              </dd>
            </>
          )}
        </dl>
      </section>

      {lens.coating && (
        <section className="mb-8">
          <SectionHeading className="mb-4">コーティング</SectionHeading>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            <dt className="font-medium text-gray-600">タイプ</dt>
            <dd>{lens.coating.type}</dd>
            <dt className="font-medium text-gray-600">多層コート</dt>
            <dd>{lens.coating.multi_layer ? "あり" : "なし"}</dd>
            {lens.coating.notes && (
              <>
                <dt className="font-medium text-gray-600">備考</dt>
                <dd>
                  <TextWithCitations text={lens.coating.notes} citations={lens.coating.citations} />
                </dd>
              </>
            )}
          </dl>
        </section>
      )}

      <section className="mb-8">
        <SectionHeading className="mb-4">スペック</SectionHeading>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
          <dt className="font-medium text-gray-600">焦点距離</dt>
          <dd>{lens.specifications.focal_length_mm}mm</dd>
          <dt className="font-medium text-gray-600">最大F値</dt>
          <dd>f/{lens.specifications.max_aperture}</dd>
          <dt className="font-medium text-gray-600">最小F値</dt>
          <dd>f/{lens.specifications.min_aperture}</dd>
          <dt className="font-medium text-gray-600">絞り羽根数</dt>
          <dd>{lens.specifications.aperture_blades}枚</dd>
          <dt className="font-medium text-gray-600">最短撮影距離</dt>
          <dd>{lens.specifications.min_focus_distance_m}m</dd>
          <dt className="font-medium text-gray-600">フィルター径</dt>
          <dd>{lens.specifications.filter_diameter_mm}mm</dd>
          <dt className="font-medium text-gray-600">重量</dt>
          <dd>{lens.specifications.weight_g}g</dd>
          {lens.specifications.physical_size && (
            <>
              <dt className="font-medium text-gray-600">全長</dt>
              <dd>{lens.specifications.physical_size.length_mm}mm</dd>
              <dt className="font-medium text-gray-600">直径</dt>
              <dd>{lens.specifications.physical_size.diameter_mm}mm</dd>
            </>
          )}
          <dt className="font-medium text-gray-600">フォーカス方式</dt>
          <dd>{lens.specifications.focus_type}</dd>
          <dt className="font-medium text-gray-600">絞り制御</dt>
          <dd>{lens.specifications.aperture_control}</dd>
        </dl>
        {lens.specifications.citations && (
          <div className="mt-2 text-xs text-gray-500">
            <Citations citations={lens.specifications.citations} />
          </div>
        )}
      </section>

      <section className="mb-8">
        <SectionHeading className="mb-4">描写特性</SectionHeading>
        <div className="space-y-3">
          <div className="rounded bg-gray-50 px-3 py-2 text-sm">
            <span className="font-medium text-gray-600">シャープ（開放）:</span>{" "}
            <TextWithCitations text={rc.sharpness.wide_open} citations={rc.sharpness.citations} />
          </div>
          <div className="rounded bg-gray-50 px-3 py-2 text-sm">
            <span className="font-medium text-gray-600">シャープ（絞り）:</span>{" "}
            <TextWithCitations text={rc.sharpness.stopped_down} citations={rc.sharpness.citations} />
          </div>
          <div className="rounded bg-gray-50 px-3 py-2 text-sm">
            <span className="font-medium text-gray-600">ボケ:</span>{" "}
            {rc.bokeh}
          </div>
          <div className="rounded bg-gray-50 px-3 py-2 text-sm">
            <span className="font-medium text-gray-600">コントラスト:</span>{" "}
            {rc.contrast}
          </div>
          <div className="rounded bg-gray-50 px-3 py-2 text-sm">
            <span className="font-medium text-gray-600">色味:</span>{" "}
            {rc.color}
          </div>
          <div className="rounded bg-gray-50 px-3 py-2 text-sm">
            <span className="font-medium text-gray-600">フレア耐性:</span>{" "}
            {rc.flare_resistance}
          </div>
          <div className="rounded bg-gray-50 px-3 py-2 text-sm">
            <span className="font-medium text-gray-600">ゴースト:</span>{" "}
            {rc.ghosting}
          </div>
        </div>
        {rc.citations && (
          <div className="mt-2 text-xs text-gray-500">
            <Citations citations={rc.citations} />
          </div>
        )}
      </section>

      <section className="mb-8">
        <SectionHeading className="mb-4">収差</SectionHeading>
        <ul className="space-y-2 text-sm">
          <li>
            <span className="font-medium text-gray-600">色収差:</span>{" "}
            {lens.aberrations.chromatic_aberration}
          </li>
          <li>
            <span className="font-medium text-gray-600">球面収差:</span>{" "}
            {lens.aberrations.spherical_aberration}
          </li>
          <li>
            <span className="font-medium text-gray-600">歪曲:</span>{" "}
            {lens.aberrations.distortion}
          </li>
          <li>
            <span className="font-medium text-gray-600">周辺減光:</span>{" "}
            {lens.aberrations.vignetting}
          </li>
        </ul>
        {lens.aberrations.citations && (
          <div className="mt-2 text-xs text-gray-500">
            <Citations citations={lens.aberrations.citations} />
          </div>
        )}
      </section>

      {lens.market_info && (
        <section className="mb-8">
          <SectionHeading className="mb-4">市場情報</SectionHeading>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            <dt className="font-medium text-gray-600">価格帯（円）</dt>
            <dd>
              {lens.market_info.price_range_jpy.min.toLocaleString()}円 〜 {lens.market_info.price_range_jpy.max.toLocaleString()}円
            </dd>
            <dt className="font-medium text-gray-600">入手難易度</dt>
            <dd>{lens.market_info.availability}</dd>
            {lens.market_info.common_issues && lens.market_info.common_issues.length > 0 && (
              <>
                <dt className="font-medium text-gray-600">よくある問題</dt>
                <dd>
                  <ul className="list-disc list-inside space-y-1">
                    {lens.market_info.common_issues.map((issue, i) => (
                      <li key={i}>{issue}</li>
                    ))}
                  </ul>
                </dd>
              </>
            )}
          </dl>
          {lens.market_info.citations && (
            <div className="mt-2 text-xs text-gray-500">
              <Citations citations={lens.market_info.citations} />
            </div>
          )}
        </section>
      )}

      {lens.compatibility && (
        <section className="mb-8">
          <SectionHeading className="mb-4">互換性</SectionHeading>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            <dt className="font-medium text-gray-600">アダプター対応</dt>
            <dd>
              <ul className="list-disc list-inside space-y-1">
                {lens.compatibility.adaptable_to.map((mount, i) => (
                  <li key={i}>{mount}</li>
                ))}
              </ul>
            </dd>
            <dt className="font-medium text-gray-600">無限遠フォーカス</dt>
            <dd>{lens.compatibility.infinity_focus_possible ? "可能" : "不可"}</dd>
            {lens.compatibility.notes && (
              <>
                <dt className="font-medium text-gray-600">備考</dt>
                <dd>{lens.compatibility.notes}</dd>
              </>
            )}
          </dl>
          {lens.compatibility.citations && (
            <div className="mt-2 text-xs text-gray-500">
              <Citations citations={lens.compatibility.citations} />
            </div>
          )}
        </section>
      )}

      {lens.references && lens.references.length > 0 && (
        <section className="mb-8">
          <SectionHeading className="mb-4">参考文献</SectionHeading>
          <ol className="space-y-3 text-sm">
            {lens.references.map((ref) => (
              <li key={ref.id} id={`ref-${ref.id}`} className="flex gap-3 scroll-mt-4">
                <span className="shrink-0 font-mono text-xs text-[#7D9CD4]/70">[{ref.id}]</span>
                <div className="flex-1">
                  <div className="flex items-start gap-2">
                    <span>
                      {ref.url ? (
                        <a
                          href={ref.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-700 underline decoration-[#7D9CD4]/30 underline-offset-2 transition-colors hover:text-[#5E7AB8] hover:decoration-[#7D9CD4]/55"
                        >
                          {ref.title}
                        </a>
                      ) : (
                        <span className="text-gray-700">{ref.title}</span>
                      )}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                    <span>{ref.author_or_source}</span>
                    <span className="text-gray-400">•</span>
                    <span className="rounded bg-gray-100 px-2 py-0.5">{ref.type}</span>
                    <span className="text-gray-400">•</span>
                    <span className="flex items-center gap-0.5">
                      {"★".repeat(ref.reliability)}
                      {"☆".repeat(5 - ref.reliability)}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}
    </PageContainer>
  );
}
