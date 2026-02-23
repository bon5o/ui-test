import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTermBySlug, getAllTerms, type CitedText, type Term } from "../../../lib/terms";
import { getDesignById } from "../../../lib/designs";
import { isHybridContent } from "../../../lib/isHybridContent";
import { TERM_LINKS } from "../../../lib/termLinks";
import type { Reference } from "../../../types/hybridContent";
import { BackButton } from "../../../components/ui/BackButton";
import { PageContainer } from "../../../components/ui/PageContainer";
import { SectionHeading } from "../../../components/ui/SectionHeading";
import { AutoMediaRenderer } from "../../../components/AutoMediaRenderer";
import { HybridContentRenderer } from "../../../components/HybridContentRenderer";
import { CollapsibleSection } from "../../../components/ui/CollapsibleSection";

function renderTextWithTermLinks(text: string): React.ReactNode {
  const regex = new RegExp(`(${TERM_LINKS.map((t) => t.term).join("|")})`, "g");
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;
  let key = 0;
  while ((match = regex.exec(text)) !== null) {
    parts.push(<span key={key++}>{text.slice(lastIndex, match.index)}</span>);
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
  parts.push(<span key={key++}>{text.slice(lastIndex)}</span>);
  return <>{parts}</>;
}

function renderCitations(citations: number[] | undefined): React.ReactNode {
  if (!citations?.length) return null;
  const filtered = citations.filter((n): n is number => typeof n === "number");
  if (filtered.length === 0) return null;
  return (
    <span className="ml-1 whitespace-nowrap">
      {filtered.map((n) => (
        <sup key={n} className="text-xs align-super text-[#7D9CD4] hover:text-[#5E7AB8]">
          <a href={`#ref-${n}`} className="no-underline hover:underline">
            [{n}]
          </a>
        </sup>
      ))}
    </span>
  );
}

function CitedTextList({ items, className = "" }: { items: CitedText[]; className?: string }) {
  return (
    <ul className={className || "space-y-2 text-base font-normal leading-relaxed text-gray-700"}>
      {items.map((item, i) => (
        <li key={i}>
          {renderTextWithTermLinks(item.text)}
          {renderCitations(item.citations)}
        </li>
      ))}
    </ul>
  );
}

function StringList({ items }: { items: string[] }) {
  if (!items?.length) return null;
  return (
    <ul className="list-disc pl-6 space-y-1 text-base font-normal leading-relaxed text-gray-700">
        {items.map((s, i) => (
          <li key={i}>{renderTextWithTermLinks(s)}</li>
        ))}
      </ul>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10 mb-8">
      <SectionHeading className="mb-4">{title}</SectionHeading>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

export async function generateStaticParams() {
  const terms = getAllTerms();
  return terms.map((t) => ({ slug: t.slug }));
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function TermPage({ params }: PageProps) {
  const { slug } = await params;
  const term = getTermBySlug(slug);

  if (!term) {
    notFound();
  }

  // ハイブリッド形式（chapters）の場合は HybridContentRenderer で描画
  if (isHybridContent(term)) {
    const meta = term.meta as {
      title?: string;
      name?: string;
      english_name?: string;
      category?: string;
      field?: string[];
    } | undefined;
    const title = meta?.title ?? meta?.name ?? slug;
    const englishName = meta?.english_name;
    const category = meta?.category;
    const field = meta?.field;
    const refs = term.references;

    return (
      <PageContainer className="max-w-3xl">
        <nav className="mb-6 text-sm text-gray-600">
          <BackButton />
        </nav>
        <article>
          <header className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-[#111111] sm:text-3xl">
              {title}
            </h1>
            {englishName && (
              <p className="mt-2 text-[15px] tracking-[0.04em] text-gray-500 font-sans">
                {englishName}
              </p>
            )}
            {(category || (field && field.length > 0)) && (
              <div className="mt-3 flex flex-wrap gap-2 text-sm text-gray-600">
                {category && (
                  <span className="rounded bg-gray-100 px-2 py-1">{category}</span>
                )}
                {field?.map((f, i) => (
                  <span key={i} className="rounded bg-gray-100 px-2 py-1">
                    {f}
                  </span>
                ))}
              </div>
            )}
          </header>

          <HybridContentRenderer content={term} />

          {Array.isArray(refs) && refs.length > 0 && (
            <div className="mt-12">
              <CollapsibleSection title="参考文献" defaultOpen={false}>
                <ol className="space-y-3 text-base font-normal leading-relaxed text-gray-700">
                  {(refs as Reference[]).map((ref) => (
                    <li
                      key={ref.id ?? String(ref)}
                      id={ref.id != null ? `ref-${ref.id}` : undefined}
                      className="flex flex-col gap-1"
                    >
                      <span className="flex flex-wrap items-baseline gap-x-1">
                        {ref.id != null && (
                          <span className="shrink-0 font-mono text-xs text-[#7D9CD4]/70">
                            [{ref.id}]
                          </span>
                        )}
                        <span>{ref.title ?? ""}</span>
                        {ref.author_or_source && (
                          <span className="text-gray-500">/ {ref.author_or_source}</span>
                        )}
                        {ref.type && (
                          <span className="text-gray-400">/ {ref.type}</span>
                        )}
                        {ref.url && (
                          <a
                            href={ref.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#7D9CD4] underline decoration-[#7D9CD4]/30 underline-offset-2 hover:text-[#5E7AB8]"
                          >
                            {ref.url}
                          </a>
                        )}
                      </span>
                    </li>
                  ))}
                </ol>
              </CollapsibleSection>
            </div>
          )}
        </article>
      </PageContainer>
    );
  }

  // 非ハイブリッド（旧形式）: 従来の AutoMediaRenderer 表示を維持
  const termData = term as Term;
  const LABELS: Record<string, string> = {
    overview: "概要",
    principle: "原理",
    structure: "構造",
    correction_target: "補正対象",
    uncorrected_aberrations: "未補正収差",
    advantages: "利点",
    disadvantages: "欠点",
    historical_background: "歴史的背景",
    applications: "応用",
    comparison: "比較",
    related_terms: "関連用語",
    see_also: "関連型",
    diagrams: "図表",
    references: "参考文献",
  };

  return (
    <PageContainer className="max-w-3xl">
      <nav className="mb-6 text-sm text-gray-600">
        <BackButton />
      </nav>

      <article>
        <header className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-[#111111] sm:text-3xl">
            {termData.title}
          </h1>
          {termData.english_name && (
            <p className="mt-2 text-[15px] tracking-[0.04em] text-gray-500 font-sans">
              {termData.english_name}
            </p>
          )}
          {(termData.category || (termData.field && termData.field.length > 0)) && (
            <div className="mt-3 flex flex-wrap gap-2 text-sm text-gray-600">
              {termData.category && (
                <span className="rounded bg-gray-100 px-2 py-1">{termData.category}</span>
              )}
              {termData.field?.map((f, i) => (
                <span key={i} className="rounded bg-gray-100 px-2 py-1">
                  {f}
                </span>
              ))}
            </div>
          )}
        </header>

        {termData.media?.optical_formula && termData.media.optical_formula.length > 0 && (
          <Section title="光学構成図">
            <AutoMediaRenderer data={termData.media}>
              <div className="space-y-6">
                {termData.media.optical_formula.map((item, i) => (
                  <figure key={i}>
                    {item.src && (
                      <Image
                        src={item.src}
                        alt={item.caption ?? "光学構成図"}
                        width={600}
                        height={300}
                        unoptimized
                        className="max-w-full rounded border border-gray-100 bg-gray-50/50 p-3"
                      />
                    )}
                    {(item.variant || item.era || item.caption) && (
                      <figcaption className="mt-2.5 space-y-0.5 text-xs text-gray-500">
                        {(item.variant || item.era) && (
                          <p className="font-medium">
                            {[item.variant, item.era].filter(Boolean).join(" · ")}
                          </p>
                        )}
                        {item.caption && (
                          <p className="leading-relaxed text-gray-400">{item.caption}</p>
                        )}
                      </figcaption>
                    )}
                  </figure>
                ))}
              </div>
            </AutoMediaRenderer>
          </Section>
        )}

        {termData.overview && termData.overview.length > 0 && (
          <Section title={LABELS.overview}>
            <AutoMediaRenderer data={termData.overview}>
              <CitedTextList items={termData.overview} />
            </AutoMediaRenderer>
          </Section>
        )}

        {termData.principle && termData.principle.length > 0 && (
          <Section title={LABELS.principle}>
            <AutoMediaRenderer data={termData.principle}>
              <CitedTextList items={termData.principle} />
            </AutoMediaRenderer>
          </Section>
        )}

        {termData.structure && (
          <Section title={LABELS.structure}>
            <AutoMediaRenderer data={termData.structure}>
              <div className="grid grid-cols-[120px_1fr] gap-x-4 gap-y-2 text-[15px]">
                {termData.structure.elements != null && (
                  <>
                    <div className="text-gray-600">枚数</div>
                    <div>{termData.structure.elements}枚</div>
                  </>
                )}
                {termData.structure.cemented != null && (
                  <>
                    <div className="text-gray-600">貼り合わせ</div>
                    <div>{termData.structure.cemented ? "あり" : "なし"}</div>
                  </>
                )}
                {termData.structure.typical_combination &&
                  termData.structure.typical_combination.length > 0 && (
                  <>
                    <div className="text-gray-600">典型的な構成</div>
                    <div>
                      <ul className="list-disc pl-6 space-y-1">
                        {termData.structure.typical_combination.map((s, i) => (
                          <li key={i}>{renderTextWithTermLinks(s)}</li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
              </div>
            </AutoMediaRenderer>
          </Section>
        )}

        {termData.correction_target && termData.correction_target.length > 0 && (
          <Section title={LABELS.correction_target}>
            <AutoMediaRenderer data={termData.correction_target}>
              <StringList items={termData.correction_target} />
            </AutoMediaRenderer>
          </Section>
        )}

        {termData.uncorrected_aberrations && termData.uncorrected_aberrations.length > 0 && (
          <Section title={LABELS.uncorrected_aberrations}>
            <AutoMediaRenderer data={termData.uncorrected_aberrations}>
              <StringList items={termData.uncorrected_aberrations} />
            </AutoMediaRenderer>
          </Section>
        )}

        {termData.advantages && termData.advantages.length > 0 && (
          <Section title={LABELS.advantages}>
            <AutoMediaRenderer data={termData.advantages}>
              <CitedTextList
                items={termData.advantages}
                className="list-disc pl-6 space-y-1 text-base font-normal leading-relaxed text-gray-700"
              />
            </AutoMediaRenderer>
          </Section>
        )}

        {termData.disadvantages && termData.disadvantages.length > 0 && (
          <Section title={LABELS.disadvantages}>
            <AutoMediaRenderer data={termData.disadvantages}>
              <CitedTextList
                items={termData.disadvantages}
                className="list-disc pl-6 space-y-1 text-base font-normal leading-relaxed text-gray-700"
              />
            </AutoMediaRenderer>
          </Section>
        )}

        {termData.historical_background && (
          <Section title={LABELS.historical_background}>
            <div className="space-y-4">
              {termData.historical_background.first_developed && (
                <div>
                  <h3 className="text-base font-medium text-gray-800">初出・発展</h3>
                  <AutoMediaRenderer data={termData.historical_background.first_developed}>
                    <p className="mt-1 text-base font-normal leading-relaxed text-gray-700">
                      {renderTextWithTermLinks(termData.historical_background.first_developed.text)}
                      {renderCitations(termData.historical_background.first_developed.citations)}
                    </p>
                  </AutoMediaRenderer>
                </div>
              )}
              {termData.historical_background.inventor && (
                <div>
                  <h3 className="text-base font-medium text-gray-800">発明者</h3>
                  <AutoMediaRenderer data={termData.historical_background.inventor}>
                    <p className="mt-1 text-base font-normal leading-relaxed text-gray-700">
                      {renderTextWithTermLinks(termData.historical_background.inventor.text)}
                      {renderCitations(termData.historical_background.inventor.citations)}
                    </p>
                  </AutoMediaRenderer>
                </div>
              )}
              {termData.historical_background.notes && (
                <div>
                  <h3 className="text-base font-medium text-gray-800">備考</h3>
                  <AutoMediaRenderer data={termData.historical_background.notes}>
                    <p className="mt-1 text-base font-normal leading-relaxed text-gray-700">
                      {renderTextWithTermLinks(termData.historical_background.notes.text)}
                      {renderCitations(termData.historical_background.notes.citations)}
                    </p>
                  </AutoMediaRenderer>
                </div>
              )}
            </div>
          </Section>
        )}

        {termData.applications && termData.applications.length > 0 && (
          <Section title={LABELS.applications}>
            <AutoMediaRenderer data={termData.applications}>
              <CitedTextList
                items={termData.applications}
                className="list-disc pl-6 space-y-1 text-base font-normal leading-relaxed text-gray-700"
              />
            </AutoMediaRenderer>
          </Section>
        )}

        {termData.comparison && Object.keys(termData.comparison).length > 0 && (
          <Section title={LABELS.comparison}>
            <div className="space-y-4">
              {Object.entries(termData.comparison).map(([key, val]) => {
                if (!val?.text) return null;
                const label = key.replace(/^vs_/, "vs ").replace(/_/g, " ");
                return (
                  <div key={key}>
                    <h3 className="text-base font-medium text-gray-800">{label}</h3>
                    <AutoMediaRenderer data={val}>
                      <p className="mt-1 text-base font-normal leading-relaxed text-gray-700">
                        {renderTextWithTermLinks(val.text)}
                        {renderCitations(val.citations)}
                      </p>
                    </AutoMediaRenderer>
                  </div>
                );
              })}
            </div>
          </Section>
        )}

        {termData.related_terms && termData.related_terms.length > 0 && (
          <Section title={LABELS.related_terms}>
            <AutoMediaRenderer data={termData.related_terms}>
              <div className="flex flex-wrap gap-2">
                {termData.related_terms.map((s, i) => (
                  <Link
                    key={i}
                    href={`/terms/${s}`}
                    className="rounded bg-[#7D9CD4]/15 px-2 py-1 text-sm text-[#5E7AB8] transition-colors hover:bg-[#7D9CD4]/25"
                  >
                    {s.replace(/_/g, " ")}
                  </Link>
                ))}
              </div>
            </AutoMediaRenderer>
          </Section>
        )}

        {termData.see_also && termData.see_also.length > 0 && (
          <Section title={LABELS.see_also}>
            <AutoMediaRenderer data={termData.see_also}>
              <div className="flex flex-wrap gap-2">
                {termData.see_also.map((s, i) => {
                  const designSlug = s.replace(/_/g, "-");
                  const designExists = getDesignById(designSlug) !== null;
                  const label = s.replace(/_/g, " ");
                  return designExists ? (
                    <Link
                      key={i}
                      href={`/design/${designSlug}`}
                      className="rounded bg-[#7D9CD4]/15 px-2 py-1 text-sm text-[#5E7AB8] transition-colors hover:bg-[#7D9CD4]/25"
                    >
                      {label}
                    </Link>
                  ) : (
                    <span
                      key={i}
                      className="rounded bg-[#7D9CD4]/15 px-2 py-1 text-sm text-[#5E7AB8]"
                    >
                      {label}
                    </span>
                  );
                })}
              </div>
            </AutoMediaRenderer>
          </Section>
        )}

        {termData.diagrams && termData.diagrams.length > 0 && (
          <Section title={LABELS.diagrams}>
            <ul className="space-y-3 text-base font-normal leading-relaxed text-gray-700">
              {termData.diagrams.map((d, i) => (
                <li key={i}>
                  <AutoMediaRenderer data={d}>
                    <>
                      {d.type && <span className="font-medium text-gray-800">{d.type}: </span>}
                      {d.description && renderTextWithTermLinks(d.description)}
                      {renderCitations(d.citations)}
                    </>
                  </AutoMediaRenderer>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {termData.references && termData.references.length > 0 && (
          <Section title={LABELS.references}>
            <ol className="space-y-3 text-base font-normal leading-relaxed text-gray-700">
              {termData.references.map((ref) => (
                <li key={ref.id} id={`ref-${ref.id}`} className="flex flex-col gap-2 scroll-mt-4">
                  <AutoMediaRenderer data={ref}>
                    <div className="flex gap-3 scroll-mt-4">
                      <span className="shrink-0 font-mono text-xs text-[#7D9CD4]/70">[{ref.id}]</span>
                      <span>
                        {ref.url ? (
                          <a
                            href={ref.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-700 underline decoration-[#7D9CD4]/30 underline-offset-2 transition-colors hover:text-[#5E7AB8]"
                          >
                            {ref.title}
                          </a>
                        ) : (
                          <span className="text-gray-700">{ref.title}</span>
                        )}
                        <span className="ml-1 text-gray-400"> &mdash; {ref.author_or_source}</span>
                      </span>
                    </div>
                  </AutoMediaRenderer>
                </li>
              ))}
            </ol>
          </Section>
        )}
      </article>
    </PageContainer>
  );
}
