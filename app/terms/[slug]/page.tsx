import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTermBySlug, type CitedText } from "../../../lib/terms";
import { getDesignById } from "../../../lib/designs";
import { TERM_LINKS } from "../../../lib/termLinks";
import { BackButton } from "../../../components/ui/BackButton";
import { PageContainer } from "../../../components/ui/PageContainer";
import { SectionHeading } from "../../../components/ui/SectionHeading";
import { AutoMediaRenderer } from "../../../components/AutoMediaRenderer";

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
  return [
    { slug: "positive_meniscus" },
    { slug: "negative_meniscus" },
    { slug: "achromat" },
  ];
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
            {term.title}
          </h1>
          {term.english_name && (
            <p className="mt-2 text-[15px] tracking-[0.04em] text-gray-500 font-sans">
              {term.english_name}
            </p>
          )}
          {(term.category || (term.field && term.field.length > 0)) && (
            <div className="mt-3 flex flex-wrap gap-2 text-sm text-gray-600">
              {term.category && (
                <span className="rounded bg-gray-100 px-2 py-1">{term.category}</span>
              )}
              {term.field?.map((f, i) => (
                <span key={i} className="rounded bg-gray-100 px-2 py-1">
                  {f}
                </span>
              ))}
            </div>
          )}
        </header>

        {term.media?.optical_formula && term.media.optical_formula.length > 0 && (
          <Section title="光学構成図">
            <AutoMediaRenderer data={term.media}>
              <div className="space-y-6">
                {term.media.optical_formula.map((item, i) => (
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

        {term.overview && term.overview.length > 0 && (
          <Section title={LABELS.overview}>
            <AutoMediaRenderer data={term.overview}>
              <CitedTextList items={term.overview} />
            </AutoMediaRenderer>
          </Section>
        )}

        {term.principle && term.principle.length > 0 && (
          <Section title={LABELS.principle}>
            <AutoMediaRenderer data={term.principle}>
              <CitedTextList items={term.principle} />
            </AutoMediaRenderer>
          </Section>
        )}

        {term.structure && (
          <Section title={LABELS.structure}>
            <AutoMediaRenderer data={term.structure}>
              <div className="grid grid-cols-[120px_1fr] gap-x-4 gap-y-2 text-[15px]">
                {term.structure.elements != null && (
                  <>
                    <div className="text-gray-600">枚数</div>
                    <div>{term.structure.elements}枚</div>
                  </>
                )}
                {term.structure.cemented != null && (
                  <>
                    <div className="text-gray-600">貼り合わせ</div>
                    <div>{term.structure.cemented ? "あり" : "なし"}</div>
                  </>
                )}
                {term.structure.typical_combination &&
                  term.structure.typical_combination.length > 0 && (
                  <>
                    <div className="text-gray-600">典型的な構成</div>
                    <div>
                      <ul className="list-disc pl-6 space-y-1">
                        {term.structure.typical_combination.map((s, i) => (
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

        {term.correction_target && term.correction_target.length > 0 && (
          <Section title={LABELS.correction_target}>
            <AutoMediaRenderer data={term.correction_target}>
              <StringList items={term.correction_target} />
            </AutoMediaRenderer>
          </Section>
        )}

        {term.uncorrected_aberrations && term.uncorrected_aberrations.length > 0 && (
          <Section title={LABELS.uncorrected_aberrations}>
            <AutoMediaRenderer data={term.uncorrected_aberrations}>
              <StringList items={term.uncorrected_aberrations} />
            </AutoMediaRenderer>
          </Section>
        )}

        {term.advantages && term.advantages.length > 0 && (
          <Section title={LABELS.advantages}>
            <AutoMediaRenderer data={term.advantages}>
              <CitedTextList
                items={term.advantages}
                className="list-disc pl-6 space-y-1 text-base font-normal leading-relaxed text-gray-700"
              />
            </AutoMediaRenderer>
          </Section>
        )}

        {term.disadvantages && term.disadvantages.length > 0 && (
          <Section title={LABELS.disadvantages}>
            <AutoMediaRenderer data={term.disadvantages}>
              <CitedTextList
                items={term.disadvantages}
                className="list-disc pl-6 space-y-1 text-base font-normal leading-relaxed text-gray-700"
              />
            </AutoMediaRenderer>
          </Section>
        )}

        {term.historical_background && (
          <Section title={LABELS.historical_background}>
            <div className="space-y-4">
              {term.historical_background.first_developed && (
                <div>
                  <h3 className="text-base font-medium text-gray-800">初出・発展</h3>
                  <AutoMediaRenderer data={term.historical_background.first_developed}>
                    <p className="mt-1 text-base font-normal leading-relaxed text-gray-700">
                      {renderTextWithTermLinks(term.historical_background.first_developed.text)}
                      {renderCitations(term.historical_background.first_developed.citations)}
                    </p>
                  </AutoMediaRenderer>
                </div>
              )}
              {term.historical_background.inventor && (
                <div>
                  <h3 className="text-base font-medium text-gray-800">発明者</h3>
                  <AutoMediaRenderer data={term.historical_background.inventor}>
                    <p className="mt-1 text-base font-normal leading-relaxed text-gray-700">
                      {renderTextWithTermLinks(term.historical_background.inventor.text)}
                      {renderCitations(term.historical_background.inventor.citations)}
                    </p>
                  </AutoMediaRenderer>
                </div>
              )}
              {term.historical_background.notes && (
                <div>
                  <h3 className="text-base font-medium text-gray-800">備考</h3>
                  <AutoMediaRenderer data={term.historical_background.notes}>
                    <p className="mt-1 text-base font-normal leading-relaxed text-gray-700">
                      {renderTextWithTermLinks(term.historical_background.notes.text)}
                      {renderCitations(term.historical_background.notes.citations)}
                    </p>
                  </AutoMediaRenderer>
                </div>
              )}
            </div>
          </Section>
        )}

        {term.applications && term.applications.length > 0 && (
          <Section title={LABELS.applications}>
            <AutoMediaRenderer data={term.applications}>
              <CitedTextList
                items={term.applications}
                className="list-disc pl-6 space-y-1 text-base font-normal leading-relaxed text-gray-700"
              />
            </AutoMediaRenderer>
          </Section>
        )}

        {term.comparison && Object.keys(term.comparison).length > 0 && (
          <Section title={LABELS.comparison}>
            <div className="space-y-4">
              {Object.entries(term.comparison).map(([key, val]) => {
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

        {term.related_terms && term.related_terms.length > 0 && (
          <Section title={LABELS.related_terms}>
            <AutoMediaRenderer data={term.related_terms}>
              <div className="flex flex-wrap gap-2">
                {term.related_terms.map((s, i) => (
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

        {term.see_also && term.see_also.length > 0 && (
          <Section title={LABELS.see_also}>
            <AutoMediaRenderer data={term.see_also}>
              <div className="flex flex-wrap gap-2">
                {term.see_also.map((s, i) => {
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

        {term.diagrams && term.diagrams.length > 0 && (
          <Section title={LABELS.diagrams}>
            <ul className="space-y-3 text-base font-normal leading-relaxed text-gray-700">
              {term.diagrams.map((d, i) => (
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

        {term.references && term.references.length > 0 && (
          <Section title={LABELS.references}>
            <ol className="space-y-3 text-base font-normal leading-relaxed text-gray-700">
              {term.references.map((ref) => (
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
