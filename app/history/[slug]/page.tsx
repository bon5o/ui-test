import { notFound } from "next/navigation";
import { getHistoryBySlug, getAllHistorySlugs } from "../../../lib/history";
import type { Reference } from "../../../types/hybridContent";
import { HybridContentRenderer } from "../../../components/HybridContentRenderer";
import { PageContainer } from "../../../components/ui/PageContainer";
import { BackButton } from "../../../components/ui/BackButton";
import { Toc } from "../../../components/Toc";
import { CollapsibleSection } from "../../../components/ui/CollapsibleSection";

export async function generateStaticParams() {
  return getAllHistorySlugs().map((slug) => ({ slug }));
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function HistoryDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const content = getHistoryBySlug(slug);

  if (!content) {
    notFound();
  }

  const meta = content.meta as
    | {
        name?: string;
        english_name?: string;
        category?: string;
        summary?: string;
        updated_at?: string;
      }
    | undefined;

  const title = typeof meta?.name === "string" ? meta.name : slug;
  const englishName =
    typeof meta?.english_name === "string" ? meta.english_name : undefined;
  const refs = content.references;

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
        </header>

        <Toc content={content} />
        <HybridContentRenderer
          content={content}
          currentPathname={`/history/${slug}`}
        />

        {Array.isArray(refs) && refs.length > 0 && (
          <div id="references" className="mt-12 scroll-mt-4">
            <CollapsibleSection title="参考文献" defaultOpen={false}>
              <ol className="space-y-3 text-base font-normal leading-relaxed text-gray-700">
                {(refs as Reference[]).map((ref, index) => (
                  <li
                    key={`ref-${ref.id ?? index}-${index}`}
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
                        <span className="text-gray-500">
                          / {ref.author_or_source}
                        </span>
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
