import Link from "next/link";
import { getAllDesigns, getCategories, type DesignListItem } from "../../lib/designs";
import { PageContainer } from "../../components/ui/PageContainer";

function groupByCategory(designs: DesignListItem[]): Map<string, DesignListItem[]> {
  const map = new Map<string, DesignListItem[]>();
  for (const d of designs) {
    const list = map.get(d.category) ?? [];
    list.push(d);
    map.set(d.category, list);
  }
  return map;
}

const OTHER_LABEL = "その他";

export default function DesignPage() {
  const designs = getAllDesigns();
  const categories = getCategories();
  const byCategory = groupByCategory(designs);
  const knownSlugs = new Set(categories.map((c) => c.slug));

  const orderedSections: { slug: string; label: string; items: DesignListItem[] }[] = [];
  for (const cat of categories) {
    const items = (byCategory.get(cat.slug) ?? []).sort((a, b) => a.name.localeCompare(b.name));
    if (items.length > 0) orderedSections.push({ slug: cat.slug, label: cat.label, items });
  }
  const otherItems = designs
    .filter((d) => !knownSlugs.has(d.category))
    .sort((a, b) => a.name.localeCompare(b.name));
  if (otherItems.length > 0) {
    orderedSections.push({ slug: "other", label: OTHER_LABEL, items: otherItems });
  }

  return (
    <PageContainer className="max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-[#111111] sm:text-3xl">
        設計タイプ一覧
      </h1>
      <div className="space-y-8">
        {orderedSections.map(({ slug, label, items }) => (
          <section key={slug}>
            <h2 className="mb-3 text-lg font-semibold text-gray-800">{label}</h2>
            <ul className="space-y-2">
              {items.map((design) => (
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
          </section>
        ))}
      </div>
    </PageContainer>
  );
}
