import Link from "next/link";
import { getAllHistoryItems } from "../../lib/history";
import { PageContainer } from "../../components/ui/PageContainer";

export default function HistoryPage() {
  const items = getAllHistoryItems();

  return (
    <PageContainer className="max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-[#111111] sm:text-3xl">
        歴史
      </h1>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.slug}>
            <Link
              href={`/history/${item.slug}`}
              className="block rounded-lg px-3 py-3 transition-colors hover:bg-gray-100"
            >
              <span className="text-base font-medium text-[#111111] hover:text-[#5E7AB8]">
                {item.title}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </PageContainer>
  );
}
