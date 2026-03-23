import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllThoughtSlugs, getThoughtBySlug } from "@/lib/thoughts";
import { PageContainer } from "@/components/ui/PageContainer";

export async function generateStaticParams() {
  return getAllThoughtSlugs().map((slug) => ({ slug }));
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ThoughtArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = getThoughtBySlug(slug);

  if (!article) {
    notFound();
  }

  const paragraphs = article.body.split(/\n\n+/).filter((p) => p.trim() !== "");

  return (
    <PageContainer className="max-w-3xl">
      <nav className="mb-6 text-sm text-gray-600">
        <Link
          href="/thought"
          className="transition-colors hover:text-[#5E7AB8] hover:underline"
        >
          ← 思想一覧へ
        </Link>
      </nav>

      <article>
        <header className="mb-8 border-b border-gray-200/80 pb-6">
          <time
            dateTime={article.date}
            className="text-xs font-medium tabular-nums text-gray-400"
          >
            {article.date}
          </time>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#111111] sm:text-3xl">
            {article.title}
          </h1>
          {article.summary && (
            <p className="mt-4 text-base leading-relaxed text-gray-600">{article.summary}</p>
          )}
        </header>

        <div className="space-y-4 text-base leading-relaxed text-gray-800">
          {paragraphs.map((p, i) => (
            <p key={i} className="whitespace-pre-line">
              {p.trim()}
            </p>
          ))}
        </div>

        <p className="mt-10 text-sm text-gray-500">
          <Link href="/thought" className="text-[#5E7AB8] underline underline-offset-2">
            一覧へ戻る
          </Link>
        </p>
      </article>
    </PageContainer>
  );
}
