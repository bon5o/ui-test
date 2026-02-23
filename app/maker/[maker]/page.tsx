import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllLenses } from "../../../lib/lenses";
import { AutoMediaRenderer } from "../../../components/AutoMediaRenderer";

export async function generateStaticParams() {
  const lenses = getAllLenses();
  const makers = [
    ...new Set(
      lenses
        .map((l) => {
          const meta = (l as unknown as Record<string, unknown>).meta as Record<string, unknown> | undefined;
          return meta?.manufacturer_id as string | undefined;
        })
        .filter((m): m is string => typeof m === "string" && m.length > 0)
    ),
  ];
  return makers.map((maker) => ({ maker }));
}

interface PageProps {
  params: Promise<{ maker: string }>;
}

export default async function MakerDetailPage({ params }: PageProps) {
  const { maker } = await params;
  const lenses = getAllLenses();

  const filteredLenses = lenses.filter((l) => {
    const meta = (l as unknown as Record<string, unknown>).meta as Record<string, unknown> | undefined;
    return meta?.manufacturer_id === maker;
  });

  if (filteredLenses.length === 0) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <h1 className="mb-6 text-2xl font-bold text-[#111111] sm:text-3xl">
        {maker} のレンズ一覧
      </h1>

      <ul className="space-y-2">
        {filteredLenses.map((lens, i) => {
          const meta = (lens as unknown as Record<string, unknown>).meta as Record<string, unknown> | undefined;
          const slug = meta?.slug as string | undefined;
          const name = meta?.name as string | undefined;
          const rawYear = meta?.release_year ?? (meta?.facts as Record<string, unknown>)?.introduced_year;
          const year = typeof rawYear === "number" || typeof rawYear === "string" ? rawYear : null;
          return (
            <li key={slug ?? String(meta?.id ?? i)} className="space-y-2">
              <AutoMediaRenderer data={lens as unknown}>
                <div>
                  {slug ? (
                    <Link
                      href={`/lenses/${slug}`}
                      className="text-blue-500 hover:underline"
                    >
                      {name ?? "—"}
                    </Link>
                  ) : (
                    <span>{name ?? "—"}</span>
                  )}
                  {year != null && (
                    <span className="ml-2 text-sm text-gray-600">({String(year)})</span>
                  )}
                </div>
              </AutoMediaRenderer>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
