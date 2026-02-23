import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllLenses } from "../../../lib/lenses";

function getUniqueTraits(lenses: ReturnType<typeof getAllLenses>): string[] {
  const values = new Set<string>();
  for (const lens of lenses) {
    const rc = (lens as unknown as Record<string, unknown>).rendering_characteristics as
      | { sharpness?: { wide_open?: string; stopped_down?: string }; bokeh?: string; contrast?: string; color?: string; flare_resistance?: string; ghosting?: string }
      | undefined;
    if (!rc) continue;
    const s = rc.sharpness;
    if (s?.wide_open) values.add(s.wide_open);
    if (s?.stopped_down) values.add(s.stopped_down);
    if (rc.bokeh) values.add(rc.bokeh);
    if (rc.contrast) values.add(rc.contrast);
    if (rc.color) values.add(rc.color);
    if (rc.flare_resistance) values.add(rc.flare_resistance);
    if (rc.ghosting) values.add(rc.ghosting);
  }
  return [...values];
}

function lensMatchesTrait(
  lens: ReturnType<typeof getAllLenses>[number],
  trait: string
): boolean {
  const rc = (lens as unknown as Record<string, unknown>).rendering_characteristics as
    | { sharpness?: { wide_open?: string; stopped_down?: string }; bokeh?: string; contrast?: string; color?: string; flare_resistance?: string; ghosting?: string }
    | undefined;
  if (!rc) return false;
  const s = rc.sharpness;
  return (
    s?.wide_open === trait ||
    s?.stopped_down === trait ||
    rc.bokeh === trait ||
    rc.contrast === trait ||
    rc.color === trait ||
    rc.flare_resistance === trait ||
    rc.ghosting === trait
  );
}

export async function generateStaticParams() {
  const lenses = getAllLenses();
  const traits = getUniqueTraits(lenses);
  return traits
    .filter((t): t is string => typeof t === "string" && t.length > 0)
    .map((trait) => ({ trait }));
}

interface PageProps {
  params: Promise<{ trait: string }>;
}

export default async function CharacterDetailPage({ params }: PageProps) {
  const { trait } = await params;
  const traitDecoded = decodeURIComponent(trait);
  const lenses = getAllLenses();

  const filteredLenses = lenses.filter((l) => lensMatchesTrait(l, traitDecoded));

  if (filteredLenses.length === 0) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <h1 className="mb-6 text-2xl font-bold text-[#111111] sm:text-3xl">
        {traitDecoded} のレンズ一覧
      </h1>

      <ul className="space-y-2">
        {filteredLenses.map((lens, i) => {
          const meta = (lens as unknown as Record<string, unknown>).meta as Record<string, unknown> | undefined;
          const slug = meta?.slug as string | undefined;
          const name = meta?.name as string | undefined;
          const rawYear = meta?.release_year ?? (meta?.facts as Record<string, unknown>)?.introduced_year;
          const year = typeof rawYear === "number" || typeof rawYear === "string" ? rawYear : null;
          return (
            <li key={slug ?? String(meta?.id ?? i)}>
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
            </li>
          );
        })}
      </ul>
    </div>
  );
}
