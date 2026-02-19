import { notFound } from "next/navigation";
import { Sawarabi_Mincho } from "next/font/google";
import { getDesignById, getAllDesignIds } from "../../../lib/designs";
import { PageContainer } from "../../../components/ui/PageContainer";
import { CollapsibleSection } from "../../../components/ui/CollapsibleSection";

const sawarabiMincho = Sawarabi_Mincho({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

type TextItem = { text: string; citations?: number[] };
type TextItems = TextItem | TextItem[];

function renderTextItems(items: TextItems | undefined): React.ReactNode {
  if (!items) return null;
  const arr = Array.isArray(items) ? items : [items];
  return (
              <ul className="space-y-2.5 text-[15px] leading-[1.95] text-gray-600">
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
    <CollapsibleSection title="光学特性">
      <div className="space-y-5">
        {items.map(({ label, content }) => (
          <div key={label}>
            <h4 className="mb-1.5 text-sm font-medium text-gray-400">{label}</h4>
            {content}
          </div>
        ))}
      </div>
    </CollapsibleSection>
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
    <PageContainer className={`!max-w-[800px] ${sawarabiMincho.className}`}>
      {/* ── Header ── */}
      <header className="pb-10">
        <h1 className="text-3xl font-normal tracking-tight text-gray-900 sm:text-[2.25rem] sm:leading-[1.3] text-balance">
          {meta.name}
        </h1>
        {meta.english_name && (
          <p className="mt-3 text-[15px] tracking-[0.04em] text-gray-400 font-sans">
            {meta.english_name}
          </p>
        )}
      </header>

      {/* ── Optical Diagram (always visible, near top) ── */}
      {media?.optical_formula && media.optical_formula.length > 0 && (
        <figure className="mb-12 border-b border-gray-100 pb-12">
          {media.optical_formula.map((item, i) => (
            <div key={i}>
              {item.src && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.src}
                  alt={item.caption ?? "Optical diagram"}
                  className="max-w-full rounded border border-gray-100 bg-gray-50/50 p-3"
                />
              )}
              <figcaption className="mt-2.5 space-y-0.5">
                {item.caption && (
                  <p className="text-xs leading-relaxed text-gray-400">{item.caption}</p>
                )}
                {(item.elements || item.groups) && (
                  <p className="text-xs font-medium text-gray-500">
                    {item.elements}枚{item.groups ? ` / ${item.groups}群` : ""}
                  </p>
                )}
              </figcaption>
            </div>
          ))}
        </figure>
      )}

      {/* ── Collapsible content sections ── */}
      <div className="divide-y divide-gray-100 border-t border-gray-100">

        {/* Origin */}
        {meta.origin && (
          <CollapsibleSection title="由来">
            <dl className="space-y-5 text-[15px] leading-[1.95]">
              {meta.origin.base_design && (
                <div className="grid grid-cols-[7rem_1fr] gap-4">
                  <dt className="text-sm font-medium text-gray-400">基本設計</dt>
                  <dd className="text-gray-600">{meta.origin.base_design}</dd>
                </div>
              )}
              {meta.origin.photographic_adaptation && (
                <div className="grid grid-cols-[7rem_1fr] gap-4">
                  <dt className="text-sm font-medium text-gray-400">写真用適応</dt>
                  <dd className="text-gray-600">{meta.origin.photographic_adaptation}</dd>
                </div>
              )}
            </dl>
          </CollapsibleSection>
        )}

        {/* Historical Development — Timeline */}
        {meta.historical_development && meta.historical_development.length > 0 && (
          <CollapsibleSection title="歴史的発展">
            <div className="relative ml-3 border-l border-[#88A3D4]/30 pl-7">
              {meta.historical_development.map((item, i) => (
                <div key={i} className="relative pb-7 last:pb-0">
                  <span className="absolute -left-[calc(1.75rem+3.5px)] top-1.5 h-[7px] w-[7px] rounded-full border-[1.5px] border-[#88A3D4]/50 bg-white" />
                  <p className="text-sm font-medium text-gray-900">
                    {item.year ?? item.period}
                    {item.designer && (
                      <span className="ml-2 font-normal text-gray-400">{item.designer}</span>
                    )}
                  </p>
                  <p className="mt-1.5 text-[15px] leading-[1.95] text-gray-600">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* Typical Configurations */}
        {basic_structure?.typical_configurations &&
          basic_structure.typical_configurations.length > 0 && (
            <CollapsibleSection title="典型構成">
    <ul className="space-y-2.5 text-[15px] leading-[1.95] text-gray-600">
                {basic_structure.typical_configurations.map((config, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="mt-[0.65em] h-1 w-1 shrink-0 rounded-full bg-[#88A3D4]/50" />
                    <span>{config}</span>
                  </li>
                ))}
              </ul>
            </CollapsibleSection>
          )}

        {/* Symmetry */}
        {basic_structure?.symmetry && (
          <CollapsibleSection title="対称性">
            <p className="text-[15px] leading-[1.95] text-gray-600">
              {basic_structure.symmetry.text}
            </p>
          </CollapsibleSection>
        )}

        {/* Design Philosophy */}
        {basic_structure?.design_philosophy &&
          basic_structure.design_philosophy.length > 0 && (
            <CollapsibleSection title="設計思想">
              <div className="space-y-6">
                {basic_structure.design_philosophy.map((item, i) => (
                  <div key={i}>
                    <h4 className="mb-2 text-sm font-semibold text-gray-800">{item.section}</h4>
                    {renderTextItems(item.points)}
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          )}

        {/* Optical Characteristics */}
        {optical_characteristics && renderOpticalCharacteristics(optical_characteristics)}

        {/* Rendering Character */}
        {rendering_character && (
          <CollapsibleSection title="描写特性">
            <div className="space-y-5">
              {Object.entries(rendering_character).map(([key, value]) => {
                const labelMap: Record<string, string> = {
                  bokeh: "ボケ",
                  three_dimensionality: "立体感",
                  flare_resistance: "フレア耐性",
                  color_rendering: "色再現"
                };
                return (
                  <div key={key}>
                    <h4 className="mb-1.5 text-sm font-medium text-gray-400">
                      {labelMap[key] ?? key}
                    </h4>
                    {renderTextItems(value)}
                  </div>
                );
              })}
            </div>
          </CollapsibleSection>
        )}

        {/* Operational Characteristics */}
        {operational_characteristics && (
          <CollapsibleSection title="使用面での特性">
            <div className="space-y-5">
              {Object.entries(operational_characteristics).map(([key, value]) => {
                const labelMap: Record<string, string> = {
                  size_and_weight: "サイズ・重量",
                  typical_focal_length: "典型焦点距離",
                  manufacturing_cost: "製造コスト"
                };
                return (
                  <div key={key}>
                    <h4 className="mb-1.5 text-sm font-medium text-gray-400">
                      {labelMap[key] ?? key}
                    </h4>
                    {renderTextItems(value)}
                  </div>
                );
              })}
            </div>
          </CollapsibleSection>
        )}

        {/* Variants */}
        {variants && variants.length > 0 && (
          <CollapsibleSection title="バリエーション">
            <div className="space-y-5">
              {variants.map((v, i) => (
                <div key={i}>
                  <h4 className="mb-2 text-sm font-semibold text-gray-800">{v.name}</h4>
                  {renderTextItems(v.description)}
                </div>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* Modern Evolution */}
        {modern_evolution && (
          <CollapsibleSection title="現代的展開">
            <div className="space-y-5">
              {Object.entries(modern_evolution).map(([key, value]) => {
                const labelMap: Record<string, string> = {
                  digital_optimization: "デジタル最適化",
                  current_position: "現代的地位"
                };
                return (
                  <div key={key}>
                    <h4 className="mb-1.5 text-sm font-medium text-gray-400">
                      {labelMap[key] ?? key}
                    </h4>
                    {renderTextItems(value)}
                  </div>
                );
              })}
            </div>
          </CollapsibleSection>
        )}

        {/* References */}
        {references && references.length > 0 && (
          <CollapsibleSection title="参考文献">
            <ol className="space-y-3 text-sm leading-[1.85]">
              {references.map((ref) => (
                <li key={ref.id} className="flex gap-3 text-gray-600">
                  <span className="shrink-0 font-mono text-xs text-[#88A3D4]/60">[{ref.id}]</span>
                  <span>
                    {ref.url ? (
                      <a
                        href={ref.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 underline decoration-[#88A3D4]/25 underline-offset-2 transition-colors hover:text-[#88A3D4] hover:decoration-[#88A3D4]/50"
                      >
                        {ref.title}
                      </a>
                    ) : (
                      <span className="text-gray-600">{ref.title}</span>
                    )}
                    <span className="ml-1 text-gray-400"> &mdash; {ref.author_or_source}</span>
                  </span>
                </li>
              ))}
            </ol>
          </CollapsibleSection>
        )}
      </div>

      <div className="h-16" />
    </PageContainer>
  );
}
