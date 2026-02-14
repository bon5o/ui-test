import Link from "next/link";
import { getAllLenses } from "../../lib/lenses";
import { PageContainer } from "../../components/ui/PageContainer";

export default function EraPage() {
  const lenses = getAllLenses();
  const eras = [...new Set(lenses.map((l) => l.classification.era))].sort();

  return (
    <PageContainer className="max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-[#111111] sm:text-3xl">
        年代別一覧
      </h1>

      <ul className="space-y-2">
        {eras.map((era) => (
          <li key={era}>
            <Link
              href={`/era/${era}`}
              className="rounded-lg px-3 py-2 text-[#111111] transition-colors hover:bg-gray-100 hover:text-blue-500"
            >
              {era}
            </Link>
          </li>
        ))}
      </ul>
    </PageContainer>
  );
}
