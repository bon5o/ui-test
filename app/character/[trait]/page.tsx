import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllLenses } from "../../../lib/lenses";

function getUniqueTraits(lenses: ReturnType<typeof getAllLenses>): string[] {
  const values = new Set<string>();
  for (const lens of lenses) {
    const rc = lens.rendering_characteristics;
    if (rc.sharpness.wide_open) values.add(rc.sharpness.wide_open);
    if (rc.sharpness.stopped_down) values.add(rc.sharpness.stopped_down);
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
  const rc = lens.rendering_characteristics;
  return (
    rc.sharpness.wide_open === trait ||
    rc.sharpness.stopped_down === trait ||
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
  return traits.map((trait) => ({
    trait,
  }));
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
        {filteredLenses.map((lens) => (
          <li key={lens.meta.slug}>
            <Link
              href={`/lenses/${lens.meta.slug}`}
              className="text-blue-500 hover:underline"
            >
              {lens.meta.name}
            </Link>
            <span className="ml-2 text-sm text-gray-600">
              ({lens.meta.release_year})
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
