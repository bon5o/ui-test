import Link from "next/link";
import { getAllMakers, type MakerListItem } from "../../lib/makers";
import { PageContainer } from "../../components/ui/PageContainer";
import { CollapsibleSection } from "../../components/ui/CollapsibleSection";

/** カテゴリパス → 日本語ラベル */
const categoryLabelMap: Record<string, string> = {
  camera: "カメラメーカー",
  "camera/japan": "日本",
  "camera/germany": "ドイツ",
  "camera/usa": "米国",
  lens: "レンズメーカー",
  optical: "光学機器",
  uncategorized: "未分類",
};

function getCategoryLabel(key: string): string {
  return categoryLabelMap[key] ?? key;
}

interface CategoryChild {
  subKey?: string;
  subLabel?: string;
  items: MakerListItem[];
}

interface CategoryGroup {
  parentKey: string;
  parentLabel: string;
  children: CategoryChild[];
}

/** makers を category で階層グルーピング */
function groupByCategory(items: MakerListItem[]): CategoryGroup[] {
  const map = new Map<string, Map<string, MakerListItem[]>>();

  for (const item of items) {
    const cat = item.category?.trim() || "uncategorized";
    const parts = cat.split("/").map((p) => p.trim()).filter(Boolean);
    const parent = parts[0] ?? "uncategorized";
    const sub = parts.length > 1 ? parts[1] : undefined;
    const subKey = sub ?? "__direct__";

    if (!map.has(parent)) {
      map.set(parent, new Map());
    }
    const subMap = map.get(parent)!;
    if (!subMap.has(subKey)) {
      subMap.set(subKey, []);
    }
    subMap.get(subKey)!.push(item);
  }

  for (const subMap of map.values()) {
    for (const arr of subMap.values()) {
      arr.sort((a, b) => a.name.localeCompare(b.name));
    }
  }

  const knownKeys = Object.keys(categoryLabelMap).filter((k) => k !== "uncategorized");
  const allParents = new Set(map.keys());
  const orderedParents: string[] = [];
  for (const k of knownKeys) {
    const p = k.split("/")[0];
    if (allParents.has(p) && !orderedParents.includes(p)) {
      orderedParents.push(p);
    }
  }
  for (const p of allParents) {
    if (!orderedParents.includes(p)) {
      orderedParents.push(p);
    }
  }

  return orderedParents.map((parentKey) => {
    const subMap = map.get(parentKey)!;
    const children: CategoryChild[] = [];

    const direct = subMap.get("__direct__");
    if (direct && direct.length > 0) {
      children.push({ items: direct });
    }
    for (const [subKey, items] of subMap) {
      if (subKey === "__direct__") continue;
      const subLabel = categoryLabelMap[`${parentKey}/${subKey}`] ?? subKey;
      children.push({ subKey, subLabel, items });
    }
    return {
      parentKey,
      parentLabel: getCategoryLabel(parentKey),
      children,
    };
  });
}

function MakerLink({ maker }: { maker: MakerListItem }) {
  return (
    <Link
      href={`/maker/${maker.id}`}
      className="block rounded-lg px-3 py-2 text-[#111111] transition-colors hover:bg-gray-100 hover:text-[#5E7AB8]"
    >
      <span className="font-medium">{maker.name}</span>
      {maker.english_name && (
        <span className="ml-2 text-sm text-gray-500">{maker.english_name}</span>
      )}
    </Link>
  );
}

export default function MakerPage() {
  const makers = getAllMakers();
  const groups = groupByCategory(makers);

  return (
    <PageContainer className="max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-[#111111] sm:text-3xl">
        メーカー別一覧
      </h1>

      {groups.length === 0 ? (
        <p className="text-gray-500">メーカーデータがありません。data/makers/ に JSON を追加してください。</p>
      ) : (
        groups.map((group) => (
          <CollapsibleSection
            key={group.parentKey}
            title={group.parentLabel}
            defaultOpen={false}
          >
            <div className="space-y-6">
              {group.children.map((child) =>
                child.subKey != null ? (
                  <CollapsibleSection
                    key={child.subKey}
                    title={child.subLabel ?? child.subKey}
                    defaultOpen={false}
                  >
                    <ul className="space-y-1">
                      {child.items.map((maker) => (
                        <li key={maker.id}>
                          <MakerLink maker={maker} />
                        </li>
                      ))}
                    </ul>
                  </CollapsibleSection>
                ) : (
                  <ul key="direct" className="space-y-1">
                    {child.items.map((maker) => (
                      <li key={maker.id}>
                        <MakerLink maker={maker} />
                      </li>
                    ))}
                  </ul>
                )
              )}
            </div>
          </CollapsibleSection>
        ))
      )}
    </PageContainer>
  );
}
