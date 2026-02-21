import Link from "next/link";
import { getAllTerms } from "../../lib/terms";
import { PageContainer } from "../../components/ui/PageContainer";

export default function TermsPage() {
  const terms = getAllTerms();

  return (
    <PageContainer className="max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-[#111111] sm:text-3xl">
        用語集
      </h1>
      <ul className="space-y-2">
        {terms.map((term) => (
          <li key={term.slug}>
            <Link
              href={`/terms/${term.slug}`}
              className="rounded-lg px-3 py-2 text-[#111111] transition-colors hover:bg-gray-100 hover:text-blue-500"
            >
              {term.title}
            </Link>
          </li>
        ))}
      </ul>
    </PageContainer>
  );
}
