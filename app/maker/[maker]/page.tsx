import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllLenses } from "../../../lib/lenses";
import { AutoMediaRenderer } from "../../../components/AutoMediaRenderer";

export async function generateStaticParams() {
  const lenses = getAllLenses();
  const makers = [...new Set(lenses.map((l) => l.meta.manufacturer_id))];
  return makers.map((maker) => ({
    maker,
  }));
}

interface PageProps {
  params: Promise<{ maker: string }>;
}

export default async function MakerDetailPage({ params }: PageProps) {
  const { maker } = await params;
  const lenses = getAllLenses();

  const filteredLenses = lenses.filter((l) => l.meta.manufacturer_id === maker);

  if (filteredLenses.length === 0) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <h1 className="mb-6 text-2xl font-bold text-[#111111] sm:text-3xl">
        {maker} のレンズ一覧
      </h1>

      <ul className="space-y-2">
        {filteredLenses.map((lens) => (
          <li key={lens.meta.slug} className="space-y-2">
            <AutoMediaRenderer data={lens as unknown}>
              <div>
                <Link
                  href={`/lenses/${lens.meta.slug}`}
                  className="text-blue-500 hover:underline"
                >
                  {lens.meta.name}
                </Link>
                <span className="ml-2 text-sm text-gray-600">
                  ({lens.meta.release_year})
                </span>
              </div>
            </AutoMediaRenderer>
          </li>
        ))}
      </ul>
    </div>
  );
}
