import { notFound } from "next/navigation";
import { getAllSlugs, getLensBySlug } from "../../../lib/lenses";
import { PageContainer } from "../../../components/ui/PageContainer";
import { SectionHeading } from "../../../components/ui/SectionHeading";

export async function generateStaticParams() {
  const slugs = getAllSlugs();
  return slugs.map((slug) => ({
    slug,
  }));
}

interface PageProps {
  params: Promise<{ slug: string }>;
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
          <dd>{lens.meta.release_year}</dd>
          <dt className="font-medium text-gray-600">設計タイプ</dt>
          <dd>{lens.classification.design_type}</dd>
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
            {lens.editorial.summary}
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
              <dd>{lens.optical_construction.diagram_notes}</dd>
            </>
          )}
        </dl>
      </section>

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
        </dl>
      </section>

      <section className="mb-8">
        <SectionHeading className="mb-4">描写特性</SectionHeading>
        <div className="flex flex-wrap gap-2">
          <span className="rounded bg-gray-50 px-3 py-1 text-sm">
            <span className="font-medium text-gray-600">シャープ（開放）:</span>{" "}
            {rc.sharpness.wide_open}
          </span>
          <span className="rounded bg-gray-50 px-3 py-1 text-sm">
            <span className="font-medium text-gray-600">シャープ（絞り）:</span>{" "}
            {rc.sharpness.stopped_down}
          </span>
          <span className="rounded bg-gray-50 px-3 py-1 text-sm">
            <span className="font-medium text-gray-600">ボケ:</span> {rc.bokeh}
          </span>
          <span className="rounded bg-gray-50 px-3 py-1 text-sm">
            <span className="font-medium text-gray-600">コントラスト:</span>{" "}
            {rc.contrast}
          </span>
          <span className="rounded bg-gray-50 px-3 py-1 text-sm">
            <span className="font-medium text-gray-600">色味:</span> {rc.color}
          </span>
          <span className="rounded bg-gray-50 px-3 py-1 text-sm">
            <span className="font-medium text-gray-600">フレア耐性:</span>{" "}
            {rc.flare_resistance}
          </span>
          <span className="rounded bg-gray-50 px-3 py-1 text-sm">
            <span className="font-medium text-gray-600">ゴースト:</span>{" "}
            {rc.ghosting}
          </span>
        </div>
      </section>

      <section>
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
      </section>
    </PageContainer>
  );
}
