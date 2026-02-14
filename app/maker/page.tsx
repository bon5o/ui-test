import Link from "next/link";
import { getAllLenses } from "../../lib/lenses";
import { PageContainer } from "../../components/ui/PageContainer";

export default function MakerPage() {
  const lenses = getAllLenses();
  const makers = [...new Set(lenses.map((l) => l.meta.manufacturer_id))].sort();

  return (
    <PageContainer className="max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-[#111111] sm:text-3xl">
        メーカー別一覧
      </h1>

      <ul className="space-y-2">
        {makers.map((maker) => (
          <li key={maker}>
            <Link
              href={`/maker/${maker}`}
              className="rounded-lg px-3 py-2 text-[#111111] transition-colors hover:bg-gray-100 hover:text-blue-500"
            >
              {maker}
            </Link>
          </li>
        ))}
      </ul>
    </PageContainer>
  );
}
