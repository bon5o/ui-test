import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDesignById, getAllDesignIds } from "../../../lib/designs";
import { TERM_LINKS } from "../../../lib/termLinks";
import { getLensBySlug } from "../../../lib/lenses";
import { PageContainer } from "../../../components/ui/PageContainer";
import { CollapsibleSection } from "../../../components/ui/CollapsibleSection";

type TextItem = { text: string; citations?: number[] };
type TextItems = TextItem | TextItem[];

type VariantDescriptionItem = { text: string; citations?: number[] };
type VariantItem = {
  name: string;
  description: VariantDescriptionItem[];
};

/** optical_characteristics の新形式: sections + citations */
type OpticalSectionParagraph = { type: "paragraph"; text: string };
type OpticalSectionText = { type: "text"; text: string };
type OpticalSectionList = { type: "list"; items: string[] };
type OpticalSection = OpticalSectionParagraph | OpticalSectionText | OpticalSectionList;
type OpticalCharacteristicSubsection = {
  sections: OpticalSection[];
  citations?: number[];
};

const SECTION_TITLES: Record<string, string> = {
  origin: "由来",
  historical_development: "歴史的発展",
  basic_structure: "基本構成",
  design_philosophy: "設計思想",
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
    center_resolution: "中心解像",
    peripheral_resolution: "周辺解像",
    contrast: "コントラスト",
    spherical_aberration: "球面収差",
    coma_aberration: "コマ収差",
    astigmatism_and_field_curvature: "非点収差・像面湾曲",
    chromatic_aberration: "色収差",
    field_curvature: "像面湾曲",
    distortion: "歪曲",
    maximum_f_number_evolution: "最大F値の変遷",
    peripheral_light_loss: "周辺減光",
    sharpness: "シャープネス",
    center: "中心",
    peripheral: "周辺",
    aberrations: "収差",
    spherical: "球面収差",
    coma: "コマ収差",
    maximum_aperture_evolution: "最大F値の変遷",
    vignetting: "周辺減光"
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

function renderDescriptionWithTermLinks(description: string | unknown): React.ReactNode {
  let descriptionStr: string;
  if (typeof description === "string") {
    descriptionStr = description;
  } else if (typeof description === "object" && description !== null && "text" in description) {
    const textValue = (description as { text: unknown }).text;
    descriptionStr = typeof textValue === "string" ? textValue : String(textValue ?? "");
  } else {
    descriptionStr = String(description ?? "");
  }
  
  const regex = new RegExp(`(${TERM_LINKS.map((t) => t.term).join("|")})`, "g");
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;
  let key = 0;
  while ((match = regex.exec(descriptionStr)) !== null) {
    parts.push(<span key={key++}>{descriptionStr.slice(lastIndex, match.index)}</span>);
    const term = match[0];
    const linkDef = TERM_LINKS.find((t) => t.term === term);
    parts.push(
      <Link
        key={key++}
        href={`/terms/${linkDef?.slug ?? ""}`}
        className="text-[#7D9CD4] underline decoration-[#7D9CD4]/30 underline-offset-2 transition-colors hover:text-[#5E7AB8] hover:decoration-[#7D9CD4]/55"
      >
        {term}
      </Link>
    );
    lastIndex = regex.lastIndex;
  }
  parts.push(<span key={key++}>{descriptionStr.slice(lastIndex)}</span>);
  return <>{parts}</>;
}

/** オブジェクトから表示用テキストを安全に取得 */
function extractTextContent(item: unknown): string {
  if (item == null) return "";
  if (typeof item === "string") return item;
  if (typeof item === "object" && item !== null && "text" in item) {
    const textVal = (item as { text: unknown }).text;
    if (typeof textVal === "string") return textVal;
  }
  return "";
}

/** オブジェクトから citations 配列を安全に取得 */
function extractCitations(item: unknown): number[] | undefined {
  if (typeof item !== "object" || item == null || !("citations" in item)) return undefined;
  const c = (item as { citations?: unknown }).citations;
  return Array.isArray(c) ? c : undefined;
}

function renderTextItems(items: TextItems | undefined): React.ReactNode {
  if (!items) return null;
  const arr = Array.isArray(items) ? items : [items];
  return (
    <ul className="space-y-2 text-base font-normal leading-relaxed text-gray-700">
      {arr.map((item, i) => {
        const textContent = extractTextContent(item);
        const citationsArray = extractCitations(item);
        return (
          <li key={i}>
            {textContent}
            {citationsArray && citationsArray.length > 0 && (
              <span className="ml-1 whitespace-nowrap">
                {citationsArray.map((n) => (
                  <sup key={n} className="text-xs align-super text-[#7D9CD4] hover:text-[#5E7AB8]">
                    <a href={`#ref-${n}`} className="no-underline hover:underline">
                      [{n}]
                    </a>
                  </sup>
                ))}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function isTextItemArray(val: unknown): val is TextItem[] {
  return Array.isArray(val) && val.length > 0 && typeof val[0] === "object" && val[0] !== null && "text" in val[0];
}

function isOpticalCharacteristicSubsection(val: unknown): val is OpticalCharacteristicSubsection {
  if (typeof val !== "object" || val === null || !("sections" in val)) return false;
  const s = (val as OpticalCharacteristicSubsection).sections;
  return Array.isArray(s);
}

function renderOpticalCharacteristicSubsection(sub: OpticalCharacteristicSubsection): React.ReactNode {
  const citations =
    Array.isArray(sub.citations) && sub.citations.length > 0
      ? sub.citations.filter((n): n is number => typeof n === "number")
      : undefined;

  return (
    <div className="space-y-3">
      {sub.sections.map((sec, i) => {
        if (typeof sec !== "object" || sec === null) return null;
        const s = sec as { type?: unknown; text?: unknown; items?: unknown };
        const sectionKey = `${String(s.type ?? "section")}-${i}`;
        if ((s.type === "paragraph" || s.type === "text") && typeof s.text === "string") {
          return (
            <p key={sectionKey} className="text-base font-normal leading-relaxed text-gray-700">
              {renderDescriptionWithTermLinks(s.text)}
            </p>
          );
        }
        if (s.type === "list" && Array.isArray(s.items)) {
          return (
            <ul key={sectionKey} className="list-disc pl-6 space-y-1 text-base font-normal leading-relaxed text-gray-700">
              {(s.items as unknown[]).map((item, j) => (
                <li key={j}>{typeof item === "string" ? renderDescriptionWithTermLinks(item) : null}</li>
              ))}
            </ul>
          );
        }
        return null;
      })}
      {citations && citations.length > 0 && (
        <span className="ml-1 whitespace-nowrap">
          {citations.map((n, nIdx) => (
            <sup key={nIdx} className="text-xs align-super text-[#7D9CD4] hover:text-[#5E7AB8]">
              <a href={`#ref-${n}`} className="no-underline hover:underline">
                [{n}]
              </a>
            </sup>
          ))}
        </span>
      )}
    </div>
  );
}

function isTimelineItem(
  val: unknown
): val is {
  year?: number;
  period?: string;
  designer?: string;
  description: string | { text: string; citations?: number[] };
  citations?: number[];
} {
  return typeof val === "object" && val !== null && "description" in val;
}

function isReferenceItem(val: unknown): val is { id: number; title: string; author_or_source: string; url?: string } {
  return typeof val === "object" && val !== null && "id" in val && "title" in val;
}

function renderDesignSection(key: string, value: unknown): React.ReactNode {
  if (value == null) {
    return null;
  }

  const title = SECTION_TITLES[key] ?? key.replace(/_/g, " ");

  // lens_list: array of {name, slug?} - link to lens detail pages
  if (key === "lens_list") {
    if (Array.isArray(value) && value.length > 0) {
      const first = value[0];
      if (typeof first === "object" && first !== null && "name" in first) {
        return (
          <CollapsibleSection key={key} title={title}>
            <ul className="pl-6 space-y-3 text-base font-normal leading-relaxed text-gray-700">
              {value.map((item, i) => {
                const lensItem = item as { name: unknown; slug?: unknown; description?: unknown; [key: string]: unknown };
                
                let displayName: string;
                if (typeof lensItem.name === "string") {
                  displayName = lensItem.name;
                } else if (typeof lensItem.name === "object" && lensItem.name !== null && "text" in lensItem.name) {
                  displayName = String((lensItem.name as { text: string }).text);
                } else {
                  displayName = String(lensItem.name ?? "");
                }
                
                // JSONにslugが明示的に指定されている場合はそれを使用
                const explicitSlug = typeof lensItem.slug === "string" ? lensItem.slug : undefined;
                
                // TERM_LINKSから一致するtermを検索
                const termLink = TERM_LINKS.find((link) => link.term === displayName);
                
                // リンク先を決定
                let linkHref: string | null = null;
                if (explicitSlug) {
                  // 明示的なslugが指定されている場合はそれを優先
                  linkHref = `/lenses/${explicitSlug}`;
                } else if (termLink) {
                  // TERM_LINKSに一致するtermが見つかった場合
                  const lensExists = getLensBySlug(termLink.slug) !== null;
                  if (lensExists) {
                    // data/lenses/に存在する場合はレンズ詳細ページへ
                    linkHref = `/lenses/${termLink.slug}`;
                  } else {
                    // 存在しない場合は用語ページへ
                    linkHref = `/terms/${termLink.slug}`;
                  }
                }
                
                return (
                  <li key={i}>
                    {linkHref ? (
                      <Link
                        href={linkHref}
                        className="text-[#7D9CD4] underline decoration-[#7D9CD4]/30 underline-offset-2 transition-colors hover:text-[#5E7AB8] hover:decoration-[#7D9CD4]/55"
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
    return null;
  }

  // variants: array of VariantItem - key-based, must come before timeline (timeline items also have "description")
  if (key === "variants" && Array.isArray(value)) {
    const items = value.filter(
      (v): v is VariantItem =>
        typeof v === "object" &&
        v !== null &&
        "name" in v &&
        typeof (v as VariantItem).name === "string" &&
        "description" in v &&
        Array.isArray((v as VariantItem).description)
    );
    if (items.length > 0) {
      return (
        <CollapsibleSection key={key} title={title}>
          <div className="space-y-5">
            {items.map((v, i) => (
              <div key={i} className="pl-6 space-y-3">
                <h4 className="text-lg font-medium text-gray-800">{v.name}</h4>
                <ul className="space-y-2 text-base font-normal leading-relaxed text-gray-700">
                  {v.description.map((descItem, j) => {
                    const text = typeof descItem.text === "string" ? descItem.text : "";
                    const citations = Array.isArray(descItem.citations)
                      ? descItem.citations.filter((n): n is number => typeof n === "number")
                      : undefined;
                    return (
                      <li key={j}>
                        {renderDescriptionWithTermLinks(text)}
                        {citations && citations.length > 0 && (
                          <span className="ml-1 whitespace-nowrap">
                            {citations.map((n, nIdx) => (
                              <sup key={`${j}-${nIdx}`} className="text-xs align-super text-[#7D9CD4] hover:text-[#5E7AB8]">
                                <a href={`#ref-${n}`} className="no-underline hover:underline">
                                  [{n}]
                                </a>
                              </sup>
                            ))}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      );
    }
  }

  // historical_development: timeline
  if (key === "historical_development" && Array.isArray(value) && value.length > 0 && isTimelineItem(value[0])) {
    return (
      <CollapsibleSection key={key} title={title}>
        <div className="pl-6 space-y-3">
          <div className="relative ml-3 border-l border-[#7D9CD4]/30 pl-7">
            {value.map((item, i) => {
              const citations =
                "citations" in item && Array.isArray(item.citations)
                  ? (item.citations as unknown[]).filter((n: unknown): n is number => typeof n === "number")
                  : undefined;
              return (
                <div key={i} className="relative pb-7 last:pb-0">
                  <span className="absolute -left-[calc(1.75rem+3.5px)] top-1.5 h-[7px] w-[7px] rounded-full border-[1.5px] border-[#7D9CD4]/50 bg-white" />
                  <p className="text-lg font-medium text-gray-800">
                    {item.year ?? item.period}
                    {"designer" in item && item.designer && (
                      <span className="ml-2 font-normal text-gray-400">{item.designer}</span>
                    )}
                  </p>
                  <p className="mt-1.5 text-base font-normal leading-relaxed text-gray-700">
                    {renderDescriptionWithTermLinks(item.description)}
                    {citations && citations.length > 0 && (
                      <span className="ml-1 whitespace-nowrap">
                        {citations.map((n: number, nIdx: number) => (
                          <sup
                            key={nIdx}
                            className="text-xs align-super text-[#7D9CD4] hover:text-[#5E7AB8]"
                          >
                            <a href={`#ref-${n}`} className="no-underline hover:underline">
                              [{n}]
                            </a>
                          </sup>
                        ))}
                      </span>
                    )}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </CollapsibleSection>
    );
  }

  // design_philosophy: トップレベル (新形式)
  if (key === "design_philosophy" && Array.isArray(value) && value.length > 0) {
    const items = value.filter(
      (v): v is { section: string; points: Array<{ text: string; citations?: number[] }> } =>
        typeof v === "object" && v !== null && "section" in v && "points" in v && Array.isArray((v as { points: unknown }).points)
    );
    if (items.length > 0) {
      return (
        <CollapsibleSection key={key} title={SECTION_TITLES[key] ?? "設計思想"}>
          <div className="space-y-5">
            {items.map((item, i) => (
              <div key={i} className="pl-6 space-y-3">
                <h4 className="text-lg font-medium text-gray-800">{item.section}</h4>
                {renderTextItems(item.points)}
              </div>
            ))}
          </div>
        </CollapsibleSection>
      );
    }
  }

  // origin: design-level origin (base_design, photographic_adaptation) - meta.origin またはトップレベル
  if (key === "origin" && typeof value === "object" && value !== null && !Array.isArray(value)) {
    const o = value as { base_design?: string; photographic_adaptation?: string; citations?: number[] };
    if (o.base_design || o.photographic_adaptation) {
      const citations =
        Array.isArray(o.citations) && o.citations.length > 0
          ? o.citations.filter((n): n is number => typeof n === "number")
          : undefined;
      return (
        <CollapsibleSection key={key} title="由来">
          <dl className="pl-6 space-y-3">
            {o.base_design && (
              <div className="space-y-1">
                <dt className="text-lg font-medium text-gray-800">基本設計</dt>
                <dd className="text-base font-normal leading-relaxed text-gray-700">
                  {renderDescriptionWithTermLinks(o.base_design)}
                </dd>
              </div>
            )}
            {o.photographic_adaptation && (
              <div className="space-y-1">
                <dt className="text-lg font-medium text-gray-800">写真用適応</dt>
                <dd className="text-base font-normal leading-relaxed text-gray-700">
                  {renderDescriptionWithTermLinks(o.photographic_adaptation)}
                </dd>
              </div>
            )}
            {citations && citations.length > 0 && (
              <span className="ml-1 whitespace-nowrap">
                {citations.map((n) => (
                  <sup key={n} className="text-xs align-super text-[#7D9CD4] hover:text-[#5E7AB8]">
                    <a href={`#ref-${n}`} className="no-underline hover:underline">
                      [{n}]
                    </a>
                  </sup>
                ))}
              </span>
            )}
          </dl>
        </CollapsibleSection>
      );
    }
    return null;
  }

  // references
  if (Array.isArray(value) && value.length > 0 && isReferenceItem(value[0])) {
    return (
      <CollapsibleSection key={key} title={title}>
        <ol className="pl-6 space-y-3 text-base font-normal leading-relaxed text-gray-700">
          {value.map((ref) => (
            <li key={ref.id} id={`ref-${ref.id}`} className="flex gap-3 scroll-mt-4">
              <span className="shrink-0 font-mono text-xs text-[#7D9CD4]/70">[{ref.id}]</span>
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
                <span className="ml-1 text-gray-400"> &mdash; {ref.author_or_source}</span>
              </span>
            </li>
          ))}
        </ol>
      </CollapsibleSection>
    );
  }

  // basic_structure: nested object (layout_overview + design_philosophy)
  if (key === "basic_structure" && typeof value === "object" && value !== null && !Array.isArray(value)) {
    const bs = value as {
      layout_overview?: { title?: string; sections?: Array<{ section: string; content?: string; items?: string[]; citations?: number[] }> };
      design_philosophy?: Array<{ section: string; points: TextItem[] }>;
      typical_configurations?: string[];
      symmetry?: { text: string };
    };

    const parts: React.ReactNode[] = [];

    if (bs.layout_overview?.sections && bs.layout_overview.sections.length > 0) {
      const layoutTitle = bs.layout_overview.title ?? SUBSECTION_LABELS.basic_structure?.layout_overview ?? "基本構成";
      parts.push(
        <CollapsibleSection key={`${key}-layout`} title={layoutTitle}>
          <div className="space-y-5">
            {bs.layout_overview.sections.map((sec, i) => (
              <div key={i} className="pl-6 space-y-3">
                <h4 className="text-lg font-medium text-gray-800">{sec.section}</h4>
                {sec.content && (
                  <p className="text-base font-normal leading-relaxed text-gray-700">
                    {renderDescriptionWithTermLinks(sec.content)}
                  </p>
                )}
                {sec.items && sec.items.length > 0 && (
                  <ul className="list-disc pl-6 space-y-1 text-base font-normal leading-relaxed text-gray-700">
                    {sec.items.map((item, j) => (
                      <li key={j}>{renderDescriptionWithTermLinks(item)}</li>
                    ))}
                  </ul>
                )}
                {sec.citations && sec.citations.length > 0 && (
                  <span className="ml-1 whitespace-nowrap">
                    {sec.citations.map((n, nIdx) => (
                      <sup
                        key={nIdx}
                        className="text-xs align-super text-[#7D9CD4] hover:text-[#5E7AB8]"
                      >
                        <a href={`#ref-${n}`} className="no-underline hover:underline">
                          [{n}]
                        </a>
                      </sup>
                    ))}
                  </span>
                )}
              </div>
            ))}
          </div>
        </CollapsibleSection>
      );
    }

    if (bs.design_philosophy && bs.design_philosophy.length > 0) {
      const subTitle = SUBSECTION_LABELS.basic_structure?.design_philosophy ?? "設計思想";
      parts.push(
        <CollapsibleSection key={`${key}-philosophy`} title={subTitle}>
          <div className="space-y-5">
            {bs.design_philosophy.map((item, i) => (
              <div key={i} className="pl-6 space-y-3">
                <h4 className="text-lg font-medium text-gray-800">{item.section}</h4>
                {renderTextItems(item.points)}
              </div>
            ))}
          </div>
        </CollapsibleSection>
      );
    }

    if (bs.typical_configurations && Array.isArray(bs.typical_configurations) && bs.typical_configurations.length > 0) {
      const subTitle = SUBSECTION_LABELS.basic_structure?.typical_configurations ?? "典型構成";
      parts.push(
        <CollapsibleSection key={`${key}-typical`} title={subTitle}>
          <ul className="pl-6 space-y-3 text-base font-normal leading-relaxed text-gray-700">
            {bs.typical_configurations.map((s, i) => (
              <li key={i} className="flex gap-3">
                <span className="mt-[0.65em] h-1 w-1 shrink-0 rounded-full bg-[#7D9CD4]/50" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </CollapsibleSection>
      );
    }

    if (bs.symmetry && typeof bs.symmetry === "object" && "text" in bs.symmetry) {
      const subTitle = SUBSECTION_LABELS.basic_structure?.symmetry ?? "対称性";
      parts.push(
        <CollapsibleSection key={`${key}-symmetry`} title={subTitle}>
          <p className="pl-6 text-base font-normal leading-relaxed text-gray-700">
            {bs.symmetry.text}
          </p>
        </CollapsibleSection>
      );
    }

    if (parts.length === 0) return null;
    return <>{parts}</>;
  }

  // optical_characteristics: 新形式 (sections+citations) または旧形式 (text arrays / nested)
  if (key === "optical_characteristics" && typeof value === "object" && value !== null && !Array.isArray(value)) {
    const labels = SUBSECTION_LABELS.optical_characteristics ?? {};
    const items: { itemKey: string; label: string; content: React.ReactNode }[] = [];

    const collectItem = (subKey: string, subVal: unknown) => {
      if (!subVal) return;
      if (isOpticalCharacteristicSubsection(subVal)) {
        items.push({
          itemKey: subKey,
          label: labels[subKey] ?? subKey.replace(/_/g, " "),
          content: renderOpticalCharacteristicSubsection(subVal)
        });
      } else if (isTextItemArray(subVal)) {
        items.push({
          itemKey: subKey,
          label: labels[subKey] ?? subKey.replace(/_/g, " "),
          content: renderTextItems(subVal)
        });
      } else if (typeof subVal === "object" && subVal !== null && !Array.isArray(subVal)) {
        for (const [nestedK, nestedV] of Object.entries(subVal)) {
          if (isTextItemArray(nestedV)) {
            items.push({
              itemKey: `${subKey}-${nestedK}`,
              label: labels[nestedK] ?? nestedK.replace(/_/g, " "),
              content: renderTextItems(nestedV)
            });
          }
        }
      }
    };

    for (const [k, v] of Object.entries(value)) {
      collectItem(k, v);
    }

    if (items.length === 0) return null;
    return (
      <CollapsibleSection key={key} title={title}>
        <div className="space-y-5">
          {items.map(({ itemKey, label, content }) => (
            <div key={itemKey} className="pl-6 space-y-3">
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


  // Fallback: array of strings or primitives
  if (Array.isArray(value) && value.length > 0) {
    const first = value[0];
    if (typeof first === "object" && first !== null) {
      const nameKey = ["name", "title", "label", "slug"].find((k) => k in first);
      return (
        <CollapsibleSection key={key} title={title}>
          <ul className="pl-6 space-y-3 text-base font-normal leading-relaxed text-gray-700">
            {value.map((item, i) => {
              if (!item || typeof item !== "object") {
                return <li key={i}>{String(item)}</li>;
              }
              
              if (nameKey && nameKey in item) {
                const nameValue = (item as Record<string, unknown>)[nameKey];
                if (typeof nameValue === "object" && nameValue !== null && "text" in nameValue) {
                  return <li key={i}>{String((nameValue as { text: string }).text)}</li>;
                }
                return <li key={i}>{String(nameValue)}</li>;
              }

              return null;
            })}
          </ul>
        </CollapsibleSection>
      );
    }
    return (
      <CollapsibleSection key={key} title={title}>
        <ul className="pl-6 space-y-3 text-base font-normal leading-relaxed text-gray-700">
          {value
            .filter((item): item is string | number | boolean => typeof item !== "object" || item === null)
            .map((item, i) => (
              <li key={i}>{String(item)}</li>
            ))}
        </ul>
      </CollapsibleSection>
    );
  }

  // Fallback: object
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    const entries = Object.entries(value).filter(([, v]) => {
      if (v == null) return false;
      if (typeof v === "object" && !Array.isArray(v) && !("text" in v)) return false;
      return true;
    });
    if (entries.length > 0) {
      return (
        <CollapsibleSection key={key} title={title}>
          <dl className="pl-6 space-y-2 text-base font-normal leading-relaxed text-gray-700">
            {entries.map(([k, v]) => {
              let displayValue: React.ReactNode;
              if (typeof v === "object" && v !== null && !Array.isArray(v) && "text" in v) {
                displayValue = String((v as { text: string }).text);
              } else if (typeof v === "object" && v !== null) {
                displayValue = null;
              } else {
                displayValue = String(v);
              }
              if (displayValue == null) return null;

              return (
                <div key={k}>
                  <dt className="font-medium text-gray-800">{k.replace(/_/g, " ")}</dt>
                  <dd className="mt-0.5">{displayValue}</dd>
                </div>
              );
            })}
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
  const originValue = meta.origin ?? design.origin;
  const media = meta.media as {
    optical_formula?: Array<{
      src: string;
      variant?: string;
      era?: string;
      caption?: string;
      elements?: number;
      groups?: number;
    }>;
  } | undefined;

  const designEntries = Object.entries(design).filter(([key]) => key !== "meta");
  const entriesToRender: [string, unknown][] =
    originValue
      ? [["origin", originValue], ...designEntries.filter(([k]) => k !== "origin")]
      : designEntries;

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
                {(item.variant || item.era) && (
                  <p className="text-xs font-medium text-gray-500">
                    {[item.variant, item.era].filter(Boolean).join(" · ")}
                  </p>
                )}
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
        {entriesToRender.map(([key, value]) => (
          <React.Fragment key={key}>{renderDesignSection(key, value)}</React.Fragment>
        ))}
      </div>

      <div className="h-16" />
    </PageContainer>
  );
}
