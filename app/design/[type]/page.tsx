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
    <ul className="space-y-2.5 text-[15px] leading-relaxed text-[#333]">
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
    <section>
      <SectionHeading>光学特性</SectionHeading>
      <div className="mt-6 space-y-6">
        {items.map(({ label, content }) => (
          <div key={label}>
            <h4 className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#666]">{label}</h4>
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
  const media = meta.media as {
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
    <PageContainer className="!max-w-[800px]">
      {/* ── Header ── */}
      <header className="pb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-[#111] sm:text-5xl">
          {meta.name}
        </h1>
        {meta.english_name && (
          <p className="mt-3 text-lg tracking-wide text-[#888]">
            {meta.english_name}
          </p>
        )}
      </header>

      {/* ── Optical Diagram (hero position) ── */}
      {media?.optical_formula && media.optical_formula.length > 0 && (
        <figure className="mb-14">
          {media.optical_formula.map((item, i) => (
            <div key={i}>
              {item.src && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.src}
                  alt={item.caption ?? "Optical diagram"}
                  className="mx-auto max-w-full rounded-lg border border-[#e5e5e5] bg-[#fafafa] p-4"
                />
              )}
              <figcaption className="mt-3 space-y-0.5 text-center">
                {item.caption && (
                  <p className="text-xs leading-relaxed text-[#999]">{item.caption}</p>
                )}
                {(item.elements || item.groups) && (
                  <p className="text-xs font-medium text-[#666]">
                    {item.elements}枚{item.groups ? ` / ${item.groups}群` : ""}
                  </p>
                )}
              </figcaption>
            </div>
          ))}
        </figure>
      )}

      {/* ── Content sections ── */}
      <div className="space-y-14">

        {/* Origin */}
        {meta.origin && (
          <section>
            <SectionHeading>由来</SectionHeading>
            <dl className="mt-6 space-y-4 text-[15px] leading-relaxed">
              {meta.origin.base_design && (
                <div className="grid grid-cols-[7rem_1fr] gap-4">
                  <dt className="text-sm font-semibold text-[#666]">基本設計</dt>
                  <dd className="text-[#333]">{meta.origin.base_design}</dd>
                </div>
              )}
              {meta.origin.photographic_adaptation && (
                <div className="grid grid-cols-[7rem_1fr] gap-4">
                  <dt className="text-sm font-semibold text-[#666]">写真用適応</dt>
                  <dd className="text-[#333]">{meta.origin.photographic_adaptation}</dd>
                </div>
              )}
            </dl>
          </section>
        )}

        {/* Historical Development — Timeline */}
        {meta.historical_development && meta.historical_development.length > 0 && (
          <section>
            <SectionHeading>歴史的発展</SectionHeading>
            <div className="relative mt-8 ml-4 border-l-2 border-[#e0e0e0] pl-8">
              {meta.historical_development.map((item, i) => (
                <div key={i} className="relative pb-8 last:pb-0">
                  {/* Timeline dot */}
                  <span className="absolute -left-[calc(2rem+5px)] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-[#bbb] bg-white" />
                  <p className="text-sm font-semibold tracking-wide text-[#555]">
                    {item.year ?? item.period}
                    {item.designer && (
                      <span className="ml-2 font-normal text-[#999]">{item.designer}</span>
                    )}
                  </p>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-[#333]">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Typical Configurations */}
        {basic_structure?.typical_configurations &&
          basic_structure.typical_configurations.length > 0 && (
            <section>
              <SectionHeading>典型構成</SectionHeading>
              <ul className="mt-6 space-y-2.5 text-[15px] leading-relaxed text-[#333]">
                {basic_structure.typical_configurations.map((config, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-[#ccc]" />
                    <span>{config}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

        {/* Symmetry */}
        {basic_structure?.symmetry && (
          <section>
            <SectionHeading>対称性</SectionHeading>
            <p className="mt-6 text-[15px] leading-relaxed text-[#333]">
              {basic_structure.symmetry.text}
            </p>
          </section>
        )}

        {/* Design Philosophy */}
        {basic_structure?.design_philosophy &&
          basic_structure.design_philosophy.length > 0 && (
            <section>
              <SectionHeading>設計思想</SectionHeading>
              <div className="mt-6 space-y-8">
                {basic_structure.design_philosophy.map((item, i) => (
                  <div key={i}>
                    <h4 className="mb-3 text-base font-semibold text-[#222]">{item.section}</h4>
                    {renderTextItems(item.points)}
                  </div>
                ))}
              </div>
            </section>
          )}

        {/* Optical Characteristics */}
        {optical_characteristics && renderOpticalCharacteristics(optical_characteristics)}

        {/* Rendering Character */}
        {rendering_character && (
          <section>
            <SectionHeading>描写特性</SectionHeading>
            <div className="mt-6 space-y-6">
              {Object.entries(rendering_character).map(([key, value]) => {
                const labelMap: Record<string, string> = {
                  bokeh: "ボケ",
                  three_dimensionality: "立体感",
                  flare_resistance: "フレア耐性",
                  color_rendering: "色再現"
                };
                return (
                  <div key={key}>
                    <h4 className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#666]">
                      {labelMap[key] ?? key}
                    </h4>
                    {renderTextItems(value)}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Operational Characteristics */}
        {operational_characteristics && (
          <section>
            <SectionHeading>使用面での特性</SectionHeading>
            <div className="mt-6 space-y-6">
              {Object.entries(operational_characteristics).map(([key, value]) => {
                const labelMap: Record<string, string> = {
                  size_and_weight: "サイズ・重量",
                  typical_focal_length: "典型焦点距離",
                  manufacturing_cost: "製造コスト"
                };
                return (
                  <div key={key}>
                    <h4 className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#666]">
                      {labelMap[key] ?? key}
                    </h4>
                    {renderTextItems(value)}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Variants */}
        {variants && variants.length > 0 && (
          <section>
            <SectionHeading>バリエーション</SectionHeading>
            <div className="mt-6 space-y-6">
              {variants.map((v, i) => (
                <div key={i} className="rounded-lg border border-[#e8e8e8] bg-[#fcfcfc] px-6 py-5">
                  <h4 className="mb-3 text-base font-semibold text-[#222]">{v.name}</h4>
                  {renderTextItems(v.description)}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Modern Evolution */}
        {modern_evolution && (
          <section>
            <SectionHeading>現代的展開</SectionHeading>
            <div className="mt-6 space-y-6">
              {Object.entries(modern_evolution).map(([key, value]) => {
                const labelMap: Record<string, string> = {
                  digital_optimization: "デジタル最適化",
                  current_position: "現代的地位"
                };
                return (
                  <div key={key}>
                    <h4 className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#666]">
                      {labelMap[key] ?? key}
                    </h4>
                    {renderTextItems(value)}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* References */}
        {references && references.length > 0 && (
          <section>
            <SectionHeading>参考文献</SectionHeading>
            <ol className="mt-6 space-y-3 text-sm leading-relaxed">
              {references.map((ref) => (
                <li key={ref.id} className="flex gap-3 text-[#444]">
                  <span className="shrink-0 font-mono text-xs text-[#aaa]">[{ref.id}]</span>
                  <span>
                    {ref.url ? (
                      <a
                        href={ref.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#2563eb] underline decoration-[#2563eb]/30 underline-offset-2 transition-colors hover:decoration-[#2563eb]"
                      >
                        {ref.title}
                      </a>
                    ) : (
                      <span className="text-[#222]">{ref.title}</span>
                    )}
                    <span className="ml-1 text-[#999]"> &mdash; {ref.author_or_source}</span>
                  </span>
                </li>
              ))}
            </ol>
          </section>
        )}
      </div>

      {/* Bottom spacer */}
      <div className="h-16" />
    </PageContainer>
  );
}
