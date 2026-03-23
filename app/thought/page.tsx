import Link from "next/link";
import { getThoughtsSortedByDateDesc } from "@/lib/thoughts";
import { PageContainer } from "@/components/ui/PageContainer";

export default function ThoughtIndexPage() {
  const articles = getThoughtsSortedByDateDesc();

  return (
    <PageContainer className="max-w-3xl">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-[#111111] sm:text-3xl">思想</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-gray-600">
          文章はすべて仮です。日付も適当です。
        </p>
      </header>

      <ul className="space-y-6 border-t border-gray-200/80 pt-6">
        {articles.map((a) => (
          <li key={a.slug} className="border-b border-gray-100 pb-6 last:border-b-0 last:pb-0">
            <time
              dateTime={a.date}
              className="text-xs font-medium tabular-nums text-gray-400"
            >
              {a.date}
            </time>
            <h2 className="mt-1 text-lg font-semibold text-gray-900">
              <Link
                href={`/thought/${a.slug}`}
                className="text-[#2C4466] underline decoration-[#7D9CD4]/35 underline-offset-2 transition-colors hover:text-[#1E3350] hover:decoration-[#7D9CD4]/55"
              >
                {a.title}
              </Link>
            </h2>
            {a.summary && (
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{a.summary}</p>
            )}
          </li>
        ))}
      </ul>
    </PageContainer>
  );
}
