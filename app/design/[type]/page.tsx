import React from "react";
import { notFound } from "next/navigation";
import { getDesignById, getAllDesignIds, isHybridContent } from "../../../lib/designs";
import type { Reference } from "../../../types/hybridContent";
import { PageContainer } from "../../../components/ui/PageContainer";
import { HybridContentRenderer } from "../../../components/HybridContentRenderer";
import { CollapsibleSection } from "../../../components/ui/CollapsibleSection";

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

  const meta = design.meta as { name?: string; english_name?: string } | undefined;
  const metaName = meta?.name ?? String(type);
  const metaEnglishName = meta?.english_name;

  const refs = design.references;

  if (!isHybridContent(design)) {
    return (
      <PageContainer className="!max-w-[800px]">
        <header className="pb-10">
          <h1 className="text-3xl font-normal tracking-tight text-gray-900 sm:text-[2.25rem] sm:leading-[1.3] text-balance">
            {metaName}
          </h1>
          {metaEnglishName && (
            <p className="mt-3 text-[15px] tracking-[0.04em] text-gray-400 font-sans">
              {metaEnglishName}
            </p>
          )}
        </header>
        <p className="text-gray-500">この設計データはハイブリッド形式（chapters）に未対応です。</p>
        <div className="h-16" />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="!max-w-[800px]">
      <header className="pb-10">
        <h1 className="text-3xl font-normal tracking-tight text-gray-900 sm:text-[2.25rem] sm:leading-[1.3] text-balance">
          {metaName}
        </h1>
        {metaEnglishName && (
          <p className="mt-3 text-[15px] tracking-[0.04em] text-gray-400 font-sans">
            {metaEnglishName}
          </p>
        )}
      </header>

      <HybridContentRenderer content={design} />

      {Array.isArray(refs) && refs.length > 0 && (
        <div className="mt-12">
          <CollapsibleSection title="参考文献" defaultOpen={false}>
            <ol className="space-y-3 text-base font-normal leading-relaxed text-gray-700">
              {(refs as Reference[]).map((ref) => (
                <li key={ref.id ?? String(ref)} id={ref.id != null ? `ref-${ref.id}` : undefined} className="flex flex-col gap-1">
                  <span className="flex flex-wrap items-baseline gap-x-1">
                    {ref.id != null && (
                      <span className="shrink-0 font-mono text-xs text-[#7D9CD4]/70">[{ref.id}]</span>
                    )}
                    <span>{ref.title ?? ""}</span>
                    {ref.author_or_source && <span className="text-gray-500">/ {ref.author_or_source}</span>}
                    {ref.type && <span className="text-gray-400">/ {ref.type}</span>}
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

      <div className="h-16" />
    </PageContainer>
  );
}
