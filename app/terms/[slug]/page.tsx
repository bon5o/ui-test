import { notFound } from "next/navigation";
import Link from "next/link";
import { getTermBySlug } from "../../../lib/terms";
import { PageContainer } from "../../../components/ui/PageContainer";

export async function generateStaticParams() {
  return [
    { slug: "positive_meniscus" },
    { slug: "negative_meniscus" }
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

  return (
    <PageContainer className="max-w-3xl">
      <nav className="mb-6 text-sm text-gray-600">
        <Link href="/design" className="text-gray-600 transition-colors hover:text-[#5E7AB8] hover:underline">
          ← 構成型一覧
        </Link>
      </nav>

      <article>
        <h1 className="mb-6 text-2xl font-medium tracking-tight text-gray-900 sm:text-3xl">
          {term.title}
        </h1>
        <div className="whitespace-pre-line text-base font-normal leading-relaxed text-gray-700">
          {term.content}
        </div>
      </article>
    </PageContainer>
  );
}
