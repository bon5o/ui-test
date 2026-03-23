import React from "react";
import { notFound } from "next/navigation";
import { getAllSlugs, getLensBySlug } from "../../../lib/lenses";
import { getDesignTypeFromChapters, getSharpnessFromChapters } from "../../../lib/lensDetailUtils";
import { designTypeToLabel } from "../constructionTypes";
import { PageContainer } from "../../../components/ui/PageContainer";
import { HybridContentRenderer } from "../../../components/HybridContentRenderer";
import type { HybridContent, Chapter } from "../../../types/hybridContent";
import { Toc } from "../../../components/Toc";

const FIXED_IDS = [
  "overview",
  "basic_structure",
  "design_philosophy",
  "principle",
  "practical_rendering",
  "pros_cons",
  "historical_development",
  "mechanical_design",
  "digital_compatibility",
  "comparative_analysis",
  "related",
] as const;

type ChapterId = (typeof FIXED_IDS)[number];

const fixedIds = new Set<ChapterId>(FIXED_IDS);

function isChapterId(x: string): x is ChapterId {
  return (FIXED_IDS as readonly string[]).includes(x);
}

export async function generateStaticParams() {
  const slugs = getAllSlugs();
  return slugs.map((slug) => ({ slug }));
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

  const data = lens as unknown as Record<string, unknown>;
  const meta = data.meta as Record<string, unknown> | undefined;
  const rawChapters = data.chapters as Chapter[] | undefined;
  const rawRefs = data.references as HybridContent["references"] | undefined;

  if (!Array.isArray(rawChapters) || rawChapters.length === 0) {
    return (
      <PageContainer className="max-w-3xl">
        <h1 className="mb-8 text-3xl font-bold tracking-tight text-[#111111] sm:text-4xl">
          {(meta?.name as string) ?? "—"}
        </h1>
        <p className="text-gray-500">コンテンツがありません。</p>
      </PageContainer>
    );
  }

  const chapterMap = new Map<string, Chapter>();
  for (const ch of rawChapters) {
    if (ch?.id) chapterMap.set(ch.id, ch);
  }

  const orderedChapters: Chapter[] = [];
  for (const id of FIXED_IDS) {
    const ch = chapterMap.get(id);
    if (ch) orderedChapters.push(ch);
  }
  for (const ch of rawChapters) {
    if (ch?.id && !isChapterId(ch.id)) orderedChapters.push(ch);
  }

  const content: HybridContent = {
    meta: meta as HybridContent["meta"],
    chapters: orderedChapters,
    references: rawRefs,
  };

  const name = (meta?.name as string) ?? "—";
  const englishName = meta?.english_name as string | undefined;
  const summary = meta?.summary as string | undefined;
  const tags = meta?.tags as string[] | undefined;
  const aliases = meta?.aliases as string[] | undefined;
  const designType = getDesignTypeFromChapters(data);
  const sharpness = getSharpnessFromChapters(data);

  return (
    <PageContainer className="max-w-3xl">
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-[#111111] sm:text-4xl">
          {name}
        </h1>
        {englishName && (
          <p className="mt-2 text-[15px] tracking-[0.04em] text-gray-500 font-sans">
            {englishName}
          </p>
        )}
        {summary && (
          <p className="mt-4 text-base leading-relaxed text-gray-700 whitespace-pre-line">
            {summary}
          </p>
        )}
        {(tags?.length ?? 0) > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {tags!.map((tag, i) => (
              <span
                key={i}
                className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        {aliases && aliases.length > 0 && (
          <p className="mt-3 text-sm text-gray-500">
            別名: {aliases.join(" / ")}
          </p>
        )}
        {(designType || sharpness) && (
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
            {designType && (
              <span>
                設計型: <strong>{designTypeToLabel[designType] ?? designType}</strong>
              </span>
            )}
            {sharpness && (
              <span>
                シャープネス傾向: <strong>{sharpness}</strong>
              </span>
            )}
          </div>
        )}
      </header>

      <Toc content={content} />
      <HybridContentRenderer content={content} currentPathname={`/lenses/${slug}`} />

      {rawRefs && rawRefs.length > 0 && (
        <section id="references" className="mt-12 mb-8 scroll-mt-4">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            参考文献
          </h2>
          <ol className="space-y-3 text-sm">
            {rawRefs.map((ref) => (
              <li
                key={ref.id}
                id={`ref-${ref.id}`}
                className="flex gap-3 scroll-mt-4"
              >
                <span className="shrink-0 font-mono text-xs text-[#7D9CD4]/70">
                  [{ref.id}]
                </span>
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
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500">
                    {ref.author_or_source && <span>{ref.author_or_source}</span>}
                    {ref.type && (
                      <>
                        <span className="text-gray-400">•</span>
                        <span className="rounded bg-gray-100 px-2 py-0.5">
                          {ref.type}
                        </span>
                      </>
                    )}
                    {typeof ref.reliability === "number" && (
                      <>
                        <span className="text-gray-400">•</span>
                        <span className="flex items-center gap-0.5">
                          {"★".repeat(ref.reliability)}
                          {"☆".repeat(5 - ref.reliability)}
                        </span>
                      </>
                    )}
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
