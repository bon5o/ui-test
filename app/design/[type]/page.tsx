import { notFound } from "next/navigation";
import { getDesignById, getAllDesignIds } from "../../../lib/designs";
import { PageContainer } from "../../../components/ui/PageContainer";
import { SectionHeading } from "../../../components/ui/SectionHeading";

type TextItem = { text: string; citations?: number[] };
type TextItems = TextItem | TextItem[];

function renderTextItems(items: TextItems | undefined): React.ReactNode {
  if (!items) return null;
  const arr = Array.isArray(items) ? items : [items];
  return (
    <ul className="space-y-2 text-sm text-[#111111]">
      {arr.map((item, i) => (
        <li key={i}>{item.text}</li>
      ))}
    </ul>
  );
}

const OPTIC_LABELS: Record<string, string> = {
  center: "中心",
  peripheral: "周辺",
  spherical: "球面収差",
  coma: "コマ収差",
  astigmatism_and_field_curvature: "非点収差・像面湾曲",
  chromatic_aberration: "色収差",
  field_curvature: "像面湾曲",
  distortion: "歪曲",
  maximum_aperture_evolution: "最大F値の変遷",
  vignetting: "周辺減光",
  sharpness: "シャープネス",
  contrast: "コントラスト",
  aberrations: "収差"
};

function renderOpticalCharacteristics(data: Record<string, unknown> | undefined): React.ReactNode {
  if (!data) return null;
  const items: { label: string; content: React.ReactNode }[] = [];
  for (const [key, value] of Object.entries(data)) {
    if (!value) continue;
    if (Array.isArray(value) && value.length > 0 && typeof value[0] === "object" && value[0] !== null && "text" in value[0]) {
      items.push({ label: OPTIC_LABELS[key] ?? key, content: renderTextItems(value as TextItem[]) });
    } else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      for (const [subKey, subVal] of Object.entries(value)) {
        if (Array.isArray(subVal) && subVal.length > 0 && typeof subVal[0] === "object" && subVal[0] !== null && "text" in subVal[0]) {
          items.push({ label: OPTIC_LABELS[subKey] ?? subKey, content: renderTextItems(subVal as TextItem[]) });
        }
      }
    }
  }
  if (items.length === 0) return null;
  return (
    <section className="mb-8">
      <SectionHeading>光学特性</SectionHeading>
      <div className="space-y-4">
        {items.map(({ label, content }) => (
          <div key={label}>
            <h4 className="mb-1 font-medium text-gray-600">{label}</h4>
            {content}
          </div>
        ))}
      </div>
    </section>
  );
}

export async function generateStaticParams() {
  const ids = getAllDesignIds();
  return ids.map((type) => ({ type }));
}

interface PageProps {
  params: Promise<{ type: string }>;
}

export default async function DesignDetailPage({ params }: PageProps) {
  const { type } = await params;
  const design = getDesignById(type);

  if (!design) {
    notFound();
  }

  const { meta, basic_structure } = design;
  const media = (design as Record<string, unknown>).media as {
    optical_formula?: Array<{ src: string; caption?: string; elements?: number; groups?: number }>;
  } | undefined;
  const optical_characteristics = (design as Record<string, unknown>).optical_characteristics as Record<string, unknown> | undefined;
  const rendering_character = (design as Record<string, unknown>).rendering_character as Record<string, TextItems> | undefined;
  const operational_characteristics = (design as Record<string, unknown>).operational_characteristics as Record<string, TextItems> | undefined;
  const variants = (design as Record<string, unknown>).variants as Array<{ name: string; description: TextItem[] }> | undefined;
  const modern_evolution = (design as Record<string, unknown>).modern_evolution as Record<string, TextItems> | undefined;
  const references = (design as Record<string, unknown>).references as Array<{
    id: number;
    title: string;
    author_or_source: string;
    url?: string;
    type?: string;
  }> | undefined;

  return (
    <PageContainer className="max-w-3xl">
      <h1 className="mb-2 text-2xl font-bold tracking-tight text-[#111111] sm:text-3xl">
        {meta.name}
      </h1>
      {meta.english_name && (
        <p className="mb-6 text-gray-600">{meta.english_name}</p>
      )}

      {media?.optical_formula && media.optical_formula.length > 0 && (
        <section className="mb-8">
          <SectionHeading>光学構成図</SectionHeading>
          <div className="space-y-3">
            {media.optical_formula.map((item, i) => (
              <div key={i}>
                {item.src && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.src}
                    alt={item.caption ?? "光学構成図"}
                    className="max-w-full rounded border border-gray-200"
                  />
                )}
                {item.caption && (
                  <p className="mt-1 text-sm text-gray-600">{item.caption}</p>
                )}
                {(item.elements || item.groups) && (
                  <p className="text-xs text-gray-500">
                    {item.elements}枚{item.groups ? `${item.groups}群` : ""}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {meta.origin && (
        <section className="mb-8">
          <SectionHeading>由来</SectionHeading>
          <dl className="space-y-2 text-sm">
            {meta.origin.base_design && (
              <div>
                <dt className="font-medium text-gray-600">基本設計</dt>
                <dd className="mt-0.5 text-[#111111]">{meta.origin.base_design}</dd>
              </div>
            )}
            {meta.origin.photographic_adaptation && (
              <div>
                <dt className="font-medium text-gray-600">写真用への適応</dt>
                <dd className="mt-0.5 text-[#111111]">
                  {meta.origin.photographic_adaptation}
                </dd>
              </div>
            )}
          </dl>
        </section>
      )}

      {meta.historical_development && meta.historical_development.length > 0 && (
        <section className="mb-8">
          <SectionHeading>歴史的発展</SectionHeading>
          <ul className="space-y-3 text-sm">
            {meta.historical_development.map((item, i) => (
              <li key={i} className="border-l-2 border-gray-200 pl-4">
                <span className="font-medium text-gray-600">
                  {item.year ?? item.period}
                  {item.designer && ` - ${item.designer}`}
                </span>
                <p className="mt-0.5 text-[#111111]">{item.description}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {basic_structure?.typical_configurations &&
        basic_structure.typical_configurations.length > 0 && (
          <section className="mb-8">
            <SectionHeading>典型構成</SectionHeading>
            <ul className="list-inside list-disc space-y-1 text-sm text-[#111111]">
              {basic_structure.typical_configurations.map((config, i) => (
                <li key={i}>{config}</li>
              ))}
            </ul>
          </section>
        )}

      {basic_structure?.symmetry && (
        <section className="mb-8">
          <SectionHeading>対称性</SectionHeading>
          <p className="text-sm text-[#111111]">{basic_structure.symmetry.text}</p>
        </section>
      )}

      {basic_structure?.design_philosophy &&
        basic_structure.design_philosophy.length > 0 && (
          <section className="mb-8">
            <SectionHeading>設計思想</SectionHeading>
            <div className="space-y-4">
              {basic_structure.design_philosophy.map((item, i) => (
                <div key={i}>
                  <h4 className="mb-2 font-medium text-gray-600">{item.section}</h4>
                  {renderTextItems(item.points)}
                </div>
              ))}
            </div>
          </section>
        )}

      {optical_characteristics && renderOpticalCharacteristics(optical_characteristics)}

      {rendering_character && (
        <section className="mb-8">
          <SectionHeading>描写特性</SectionHeading>
          <div className="space-y-4">
            {Object.entries(rendering_character).map(([key, value]) => {
              const labelMap: Record<string, string> = {
                bokeh: "ボケ",
                three_dimensionality: "立体感",
                flare_resistance: "フレア耐性",
                color_rendering: "色再現"
              };
              return (
                <div key={key}>
                  <h4 className="mb-1 font-medium text-gray-600">
                    {labelMap[key] ?? key}
                  </h4>
                  {renderTextItems(value)}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {operational_characteristics && (
        <section className="mb-8">
          <SectionHeading>使用面での特性</SectionHeading>
          <div className="space-y-4">
            {Object.entries(operational_characteristics).map(([key, value]) => {
              const labelMap: Record<string, string> = {
                size_and_weight: "サイズ・重量",
                typical_focal_length: "典型焦点距離",
                manufacturing_cost: "製造コスト"
              };
              return (
                <div key={key}>
                  <h4 className="mb-1 font-medium text-gray-600">
                    {labelMap[key] ?? key}
                  </h4>
                  {renderTextItems(value)}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {variants && variants.length > 0 && (
        <section className="mb-8">
          <SectionHeading>バリエーション</SectionHeading>
          <ul className="space-y-3">
            {variants.map((v, i) => (
              <li key={i}>
                <h4 className="font-medium text-gray-600">{v.name}</h4>
                {renderTextItems(v.description)}
              </li>
            ))}
          </ul>
        </section>
      )}

      {modern_evolution && (
        <section className="mb-8">
          <SectionHeading>現代的展開</SectionHeading>
          <div className="space-y-4">
            {Object.entries(modern_evolution).map(([key, value]) => {
              const labelMap: Record<string, string> = {
                digital_optimization: "デジタル最適化",
                current_position: "現代的地位"
              };
              return (
                <div key={key}>
                  <h4 className="mb-1 font-medium text-gray-600">
                    {labelMap[key] ?? key}
                  </h4>
                  {renderTextItems(value)}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {references && references.length > 0 && (
        <section>
          <SectionHeading>参考文献</SectionHeading>
          <ul className="space-y-2 text-sm">
            {references.map((ref) => (
              <li key={ref.id}>
                {ref.url ? (
                  <a
                    href={ref.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    {ref.title}
                  </a>
                ) : (
                  <span className="text-[#111111]">{ref.title}</span>
                )}
                <span className="ml-1 text-gray-600">（{ref.author_or_source}）</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </PageContainer>
  );
}
