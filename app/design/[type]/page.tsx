import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDesignById, getAllDesignIds } from "../../../lib/designs";
import { TERM_LINKS } from "../../../lib/termLinks";
import { PageContainer } from "../../../components/ui/PageContainer";
import { CollapsibleSection } from "../../../components/ui/CollapsibleSection";

type TextItem = { text: string; citations?: number[] };
type TextItems = TextItem | TextItem[];

const SECTION_TITLES: Record<string, string> = {
  origin: "由来",
  historical_development: "歴史的発展",
  basic_structure: "基本構成",
  optical_characteristics: "光学特性",
  rendering_character: "描写特性",
  operational_characteristics: "使用面での特性",
  variants: "バリエーション",
  modern_evolution: "現代的展開",
  references: "参考文献",
  lens_list: "レンズ一覧"
};

const SUBSECTION_LABELS: Record<string, Record<string, string>> = {
  basic_structure: {
    typical_configurations: "典型構成",
    symmetry: "対称性",
    design_philosophy: "設計思想"
  },
  optical_characteristics: {
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
    contrast: "コントラスト",
    aberrations: "収差",
    sharpness: "シャープネス"
  },
  rendering_character: {
    bokeh: "ボケ",
    three_dimensionality: "立体感",
    flare_resistance: "フレア耐性",
    color_rendering: "色再現"
  },
  operational_characteristics: {
    size_and_weight: "サイズ・重量",
    typical_focal_length: "典型焦点距離",
    manufacturing_cost: "製造コスト"
  },
  modern_evolution: {
    digital_optimization: "デジタル最適化",
    current_position: "現代的地位"
  }
};

function renderDescriptionWithTermLinks(description: string): React.ReactNode {
  const regex = new RegExp(`(${TERM_LINKS.map((t) => t.term).join("|")})`, "g");
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;
  let key = 0;
  while ((match = regex.exec(description)) !== null) {
    parts.push(<span key={key++}>{description.slice(lastIndex, match.index)}</span>);
    const term = match[0];
    const linkDef = TERM_LINKS.find((t) => t.term === term);
    parts.push(
      <Link
        key={key++}
        href={`/terms/${linkDef?.slug ?? ""}`}
        className="text-[#88A3D4] underline decoration-[#88A3D4]/25 underline-offset-2 hover:decoration-[#88A3D4]/50"
      >
        {term}
      </Link>
    );
    lastIndex = regex.lastIndex;
  }
  parts.push(<span key={key++}>{description.slice(lastIndex)}</span>);
  return <>{parts}</>;
}

function renderTextItems(items: TextItems | undefined): React.ReactNode {
  if (!items) return null;
  const arr = Array.isArray(items) ? items : [items];
  return (
    <ul className="space-y-2 text-base font-normal leading-relaxed text-gray-700">
      {arr.map((item, i) => (
        <li key={i}>
          {item.text}
          {item.citations && item.citations.length > 0 && (
            <span className="ml-1 whitespace-nowrap">
              {item.citations.map((n) => (
                <sup key={n} className="text-xs align-super text-[#88A3D4]">
                  <a href={`#ref-${n}`} className="no-underline hover:underline">
                    [{n}]
                  </a>
                </sup>
              ))}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}

function isTextItemArray(val: unknown): val is TextItem[] {
  return Array.isArray(val) && val.length > 0 && typeof val[0] === "object" && val[0] !== null && "text" in val[0];
}

function isTimelineItem(val: unknown): val is { year?: number; period?: string; designer?: string; description: string } {
  return typeof val === "object" && val !== null && "description" in val;
}

function isVariantItem(val: unknown): val is { name: string; description: TextItem[] } {
  return typeof val === "object" && val !== null && "name" in val && "description" in val;
}

function isReferenceItem(val: unknown): val is { id: number; title: string; author_or_source: string; url?: string } {
  return typeof val === "object" && val !== null && "id" in val && "title" in val;
}

function renderDesignSection(key: string, value: unknown): React.ReactNode {
  if (value == null) return null;

  const title = SECTION_TITLES[key] ?? key.replace(/_/g, " ");

  // historical_development: timeline
  if (Array.isArray(value) && value.length > 0 && isTimelineItem(value[0])) {
    return (
      <CollapsibleSection key={key} title={title}>
        <div className="pl-6 space-y-3">
          <div className="relative ml-3 border-l border-[#88A3D4]/30 pl-7">
            {value.map((item, i) => (
              <div key={i} className="relative pb-7 last:pb-0">
                <span className="absolute -left-[calc(1.75rem+3.5px)] top-1.5 h-[7px] w-[7px] rounded-full border-[1.5px] border-[#88A3D4]/50 bg-white" />
                <p className="text-lg font-medium text-gray-800">
                  {item.year ?? item.period}
                  {"designer" in item && item.designer && (
                    <span className="ml-2 font-normal text-gray-400">{item.designer}</span>
                  )}
                </p>
                <p className="mt-1.5 text-base font-normal leading-relaxed text-gray-700">
                  {renderDescriptionWithTermLinks(item.description)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </CollapsibleSection>
    );
  }

  // variants: array of {name, description}
  if (Array.isArray(value) && value.length > 0 && isVariantItem(value[0])) {
    return (
      <CollapsibleSection key={key} title={title}>
        <div className="space-y-5">
          {value.map((v, i) => (
            <div key={i} className="pl-6 space-y-3">
              <h4 className="text-lg font-medium text-gray-800">{v.name}</h4>
              {renderTextItems(v.description)}
            </div>
          ))}
        </div>
      </CollapsibleSection>
    );
  }

  // references
  if (Array.isArray(value) && value.length > 0 && isReferenceItem(value[0])) {
    return (
      <CollapsibleSection key={key} title={title}>
        <ol className="pl-6 space-y-3 text-base font-normal leading-relaxed text-gray-700">
          {value.map((ref) => (
            <li key={ref.id} id={`ref-${ref.id}`} className="flex gap-3 scroll-mt-4">
              <span className="shrink-0 font-mono text-xs text-[#88A3D4]/60">[{ref.id}]</span>
              <span>
                {ref.url ? (
                  <a
                    href={ref.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-700 underline decoration-[#88A3D4]/25 underline-offset-2 transition-colors hover:text-[#88A3D4] hover:decoration-[#88A3D4]/50"
                  >
                    {ref.title}
                  </a>
                ) : (
                  <span className="text-gray-700">{ref.title}</span>
                )}
                <span className="ml-1 text-gray-400"> &mdash; {ref.author_or_source}</span>
              </span>
            </li>
          ))}
        </ol>
      </CollapsibleSection>
    );
  }

  // basic_structure: nested object
  if (key === "basic_structure" && typeof value === "object" && value !== null && !Array.isArray(value)) {
    const entries = Object.entries(value);
    if (entries.length === 0) return null;
    return (
      <>
        {entries.map(([subKey, subVal]) => {
          const subTitle = SUBSECTION_LABELS.basic_structure?.[subKey] ?? subKey;
          if (subKey === "typical_configurations" && Array.isArray(subVal) && subVal.length > 0) {
            return (
              <CollapsibleSection key={`${key}-${subKey}`} title={subTitle}>
                <ul className="pl-6 space-y-3 text-base font-normal leading-relaxed text-gray-700">
                  {subVal.map((s: string, i: number) => (
                    <li key={i} className="flex gap-3">
                      <span className="mt-[0.65em] h-1 w-1 shrink-0 rounded-full bg-[#88A3D4]/50" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </CollapsibleSection>
            );
          }
          if (subKey === "symmetry" && typeof subVal === "object" && subVal !== null && "text" in subVal) {
            return (
              <CollapsibleSection key={`${key}-${subKey}`} title={subTitle}>
                <p className="pl-6 text-base font-normal leading-relaxed text-gray-700">{(subVal as { text: string }).text}</p>
              </CollapsibleSection>
            );
          }
          if (subKey === "design_philosophy" && Array.isArray(subVal) && subVal.length > 0) {
            return (
              <CollapsibleSection key={`${key}-${subKey}`} title={subTitle}>
                <div className="space-y-5">
                  {subVal.map((item: { section: string; points: TextItem[] }, i: number) => (
                    <div key={i} className="pl-6 space-y-3">
                      <h4 className="text-lg font-medium text-gray-800">{item.section}</h4>
                      {renderTextItems(item.points)}
                    </div>
                  ))}
                </div>
              </CollapsibleSection>
            );
          }
          return null;
        })}
      </>
    );
  }

  // optical_characteristics: nested object with text arrays
  if (key === "optical_characteristics" && typeof value === "object" && value !== null && !Array.isArray(value)) {
    const items: { label: string; content: React.ReactNode }[] = [];
    const labels = SUBSECTION_LABELS.optical_characteristics ?? {};
    for (const [k, v] of Object.entries(value)) {
      if (!v) continue;
      if (isTextItemArray(v)) {
        items.push({ label: labels[k] ?? k, content: renderTextItems(v) });
      } else if (typeof v === "object" && v !== null && !Array.isArray(v)) {
        for (const [subK, subV] of Object.entries(v)) {
          if (isTextItemArray(subV)) {
            items.push({ label: labels[subK] ?? subK, content: renderTextItems(subV) });
          }
        }
      }
    }
    if (items.length === 0) return null;
    return (
      <CollapsibleSection key={key} title={title}>
        <div className="space-y-5">
          {items.map(({ label, content }) => (
            <div key={label} className="pl-6 space-y-3">
              <h4 className="text-lg font-medium text-gray-800">{label}</h4>
              {content}
            </div>
          ))}
        </div>
      </CollapsibleSection>
    );
  }

  // rendering_character, operational_characteristics, modern_evolution: object with text arrays
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    const labels = SUBSECTION_LABELS[key as keyof typeof SUBSECTION_LABELS] ?? {};
    const entries = Object.entries(value).filter(([, v]) => isTextItemArray(v));
    if (entries.length === 0) return null;
    return (
      <CollapsibleSection key={key} title={title}>
        <div className="space-y-5">
          {entries.map(([subKey, subVal]) => (
            <div key={subKey} className="pl-6 space-y-3">
              <h4 className="text-lg font-medium text-gray-800">
                {labels[subKey] ?? subKey.replace(/_/g, " ")}
              </h4>
              {renderTextItems(subVal)}
            </div>
          ))}
        </div>
      </CollapsibleSection>
    );
  }

  // lens_list: array of {name, slug?} - link to lens detail pages
  if (key === "lens_list" && Array.isArray(value) && value.length > 0) {
    const first = value[0];
    if (typeof first === "object" && first !== null && "name" in first) {
      return (
        <CollapsibleSection key={key} title={title}>
          <ul className="pl-6 space-y-3 text-base font-normal leading-relaxed text-gray-700">
            {value.map((item, i) => {
              const lensItem = item as { name: string; slug?: string; [key: string]: unknown };
              const displayName = lensItem.name;
              const slug = lensItem.slug;
              return (
                <li key={i}>
                  {slug ? (
                    <Link
                      href={`/lenses/${slug}`}
                      className="text-[#88A3D4] underline decoration-[#88A3D4]/25 underline-offset-2 hover:decoration-[#88A3D4]/50"
                    >
                      {displayName}
                    </Link>
                  ) : (
                    <span>{displayName}</span>
                  )}
                </li>
              );
            })}
          </ul>
        </CollapsibleSection>
      );
    }
  }

  // Fallback: array of strings or primitives
  if (Array.isArray(value) && value.length > 0) {
    const first = value[0];
    if (typeof first === "object" && first !== null) {
      const nameKey = ["name", "title", "label", "slug"].find((k) => k in first);
      return (
        <CollapsibleSection key={key} title={title}>
          <ul className="pl-6 space-y-3 text-base font-normal leading-relaxed text-gray-700">
            {value.map((item, i) => (
              <li key={i}>
                {nameKey && item && typeof item === "object" && nameKey in item
                  ? String((item as Record<string, unknown>)[nameKey])
                  : JSON.stringify(item)}
              </li>
            ))}
          </ul>
        </CollapsibleSection>
      );
    }
    return (
      <CollapsibleSection key={key} title={title}>
        <ul className="pl-6 space-y-3 text-base font-normal leading-relaxed text-gray-700">
          {value.map((item, i) => (
            <li key={i}>{String(item)}</li>
          ))}
        </ul>
      </CollapsibleSection>
    );
  }

  // Fallback: object
  if (typeof value === "object" && value !== null) {
    const entries = Object.entries(value).filter(([, v]) => v != null);
    if (entries.length > 0) {
      return (
        <CollapsibleSection key={key} title={title}>
          <dl className="pl-6 space-y-2 text-base font-normal leading-relaxed text-gray-700">
            {entries.map(([k, v]) => (
              <div key={k}>
                <dt className="font-medium text-gray-800">{k.replace(/_/g, " ")}</dt>
                <dd className="mt-0.5">{typeof v === "object" ? JSON.stringify(v) : String(v)}</dd>
              </div>
            ))}
          </dl>
        </CollapsibleSection>
      );
    }
  }

  return null;
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

  const { meta } = design;
  const media = meta.media as {
    optical_formula?: Array<{ src: string; caption?: string; elements?: number; groups?: number }>;
  } | undefined;

  const designEntries = Object.entries(design).filter(([key]) => key !== "meta");

  return (
    <PageContainer className="!max-w-[800px]">
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

      <div className="divide-y divide-gray-100 border-t border-gray-100">
        {meta.origin && (
          <CollapsibleSection title="由来">
            <dl className="pl-6 space-y-3">
              {"base_design" in meta.origin && meta.origin.base_design && (
                <div className="space-y-1">
                  <dt className="text-lg font-medium text-gray-800">基本設計</dt>
                  <dd className="text-base font-normal leading-relaxed text-gray-700">{meta.origin.base_design}</dd>
                </div>
              )}
              {"photographic_adaptation" in meta.origin && meta.origin.photographic_adaptation && (
                <div className="space-y-1">
                  <dt className="text-lg font-medium text-gray-800">写真用適応</dt>
                  <dd className="text-base font-normal leading-relaxed text-gray-700">{meta.origin.photographic_adaptation}</dd>
                </div>
              )}
            </dl>
          </CollapsibleSection>
        )}

        {designEntries.map(([key, value]) => (
          <React.Fragment key={key}>{renderDesignSection(key, value)}</React.Fragment>
        ))}
      </div>

      <div className="h-16" />
    </PageContainer>
  );
}
