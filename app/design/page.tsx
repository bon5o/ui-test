import Link from "next/link";
import { getAllDesigns } from "../../lib/designs";
import { PageContainer } from "../../components/ui/PageContainer";

export default function DesignPage() {
  const designs = getAllDesigns();

  return (
    <PageContainer className="max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-[#111111] sm:text-3xl">
        設計タイプ一覧
      </h1>
      <ul className="space-y-2">
        {designs.map((design) => (
          <li key={design.id}>
            <Link
              href={`/design/${design.id}`}
              className="rounded-lg px-3 py-2 text-[#111111] transition-colors hover:bg-gray-100 hover:text-blue-500"
            >
              {design.name}
            </Link>
          </li>
        ))}
      </ul>
    </PageContainer>
  );
}
