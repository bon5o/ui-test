import Link from "next/link";
import { getAllLenses } from "../../lib/lenses";
import { PageContainer } from "../../components/ui/PageContainer";

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
  return [...values].sort();
}

export default function CharacterPage() {
  const lenses = getAllLenses();
  const traits = getUniqueTraits(lenses);

  return (
    <PageContainer className="max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-[#111111] sm:text-3xl">
        描写傾向別一覧
      </h1>

      <ul className="space-y-2">
        {traits.map((trait) => (
          <li key={trait}>
            <Link
              href={`/character/${encodeURIComponent(trait)}`}
              className="rounded-lg px-3 py-2 text-[#111111] transition-colors hover:bg-gray-100 hover:text-blue-500"
            >
              {trait}
            </Link>
          </li>
        ))}
      </ul>
    </PageContainer>
  );
}
