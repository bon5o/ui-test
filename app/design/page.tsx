import Link from "next/link";
import { getAllDesigns, type DesignListItem } from "../../lib/designs";
import { PageContainer } from "../../components/ui/PageContainer";
import { CollapsibleSection } from "../../components/ui/CollapsibleSection";

/** カテゴリパス → 日本語ラベル */
const categoryLabelMap: Record<string, string> = {
  lens_design: "構成・設計",
  "lens_design/design_types": "構成型",
  lens_design_form: "構成型（フォーム）",
  triplet: "トリプレット系",
  lens_element: "レンズ要素",
  "lens_element/singlet_geometry": "単レンズ形状",
  aberrations: "収差",
  optical_principles: "光学原理",
  optical_metrics: "指標・量",
  coatings_stray_light: "コーティング・迷光",
  camera_systems: "カメラシステム",
  rendering_characteristics: "描写特性",
  uncategorized: "未分類",
};

function getCategoryLabel(key: string): string {
  return categoryLabelMap[key] ?? key;
}

interface CategoryChild {
  subKey?: string;
  subLabel?: string;
  items: DesignListItem[];
}

interface CategoryGroup {
  parentKey: string;
  parentLabel: string;
  children: CategoryChild[];
}

/** designs を category で階層グルーピング */
function groupByCategory(items: DesignListItem[]): CategoryGroup[] {
  const map = new Map<string, Map<string, DesignListItem[]>>();

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

function DesignLink({ design }: { design: DesignListItem }) {
  return (
    <Link
      href={`/design/${design.id}`}
      className="block rounded-lg px-3 py-2 text-[#111111] transition-colors hover:bg-gray-100 hover:text-[#5E7AB8]"
    >
      <span>{design.name}</span>
      {design.english_name && (
        <span className="ml-2 text-sm text-gray-500">{design.english_name}</span>
      )}
    </Link>
  );
}

export default function DesignPage() {
  const designs = getAllDesigns();
  const groups = groupByCategory(designs);

  return (
    <PageContainer className="max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-[#111111] sm:text-3xl">
        構成型一覧
      </h1>

      {groups.map((group) => (
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
                    {child.items.map((design) => (
                      <li key={design.id}>
                        <DesignLink design={design} />
                      </li>
                    ))}
                  </ul>
                </CollapsibleSection>
              ) : (
                <ul key="direct" className="space-y-1">
                  {child.items.map((design) => (
                    <li key={design.id}>
                      <DesignLink design={design} />
                    </li>
                  ))}
                </ul>
              )
            )}
          </div>
        </CollapsibleSection>
      ))}
    </PageContainer>
  );
}
