import Link from "next/link";
import { getAllLenses } from "../../lib/lenses";
import { PageContainer } from "../../components/ui/PageContainer";

export default function DesignPage() {
  const lenses = getAllLenses();
  const designTypes = [...new Set(lenses.map((l) => l.classification.design_type))].sort();

  return (
    <PageContainer className="max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-[#111111] sm:text-3xl">
        設計タイプ一覧
      </h1>

      <ul className="space-y-2">
        {designTypes.map((type) => (
          <li key={type}>
            <Link
              href={`/design/${type}`}
              className="rounded-lg px-3 py-2 text-[#111111] transition-colors hover:bg-gray-100 hover:text-blue-500"
            >
              {type}
            </Link>
          </li>
        ))}
      </ul>
    </PageContainer>
  );
}
