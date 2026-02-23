import Link from "next/link";
import { getAllTerms, type TermListItem } from "../../lib/terms";
import { PageContainer } from "../../components/ui/PageContainer";
import { CollapsibleSection } from "../../components/ui/CollapsibleSection";

/** カテゴリパス → 日本語ラベル */
const categoryLabelMap: Record<string, string> = {
  lens_design: "構成・設計",
  "lens_design/design_types": "構成型",
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
  terms: TermListItem[];
}

interface CategoryGroup {
  parentKey: string;
  parentLabel: string;
  children: CategoryChild[];
}

/** terms を category で階層グルーピング */
function groupTermsByCategory(terms: TermListItem[]): CategoryGroup[] {
  // Map<parent, Map<sub | "__direct__", terms[]>>
  const map = new Map<string, Map<string, TermListItem[]>>();

  for (const term of terms) {
    const cat = term.category?.trim() || "uncategorized";
    const parts = cat.split("/").map((p) => p.trim()).filter(Boolean);
    const parent = parts[0] ?? "uncategorized";
    const sub = parts.length > 1 ? parts[1] : undefined;

    if (!map.has(parent)) {
      map.set(parent, new Map());
    }
    const subMap = map.get(parent)!;
    const subKey = sub ?? "__direct__";
    if (!subMap.has(subKey)) {
      subMap.set(subKey, []);
    }
    subMap.get(subKey)!.push(term);
  }

  // 各グループ内で terms を name 昇順
  for (const subMap of map.values()) {
    for (const arr of subMap.values()) {
      arr.sort((a, b) => a.title.localeCompare(b.title));
    }
  }

  // カテゴリの表示順（categoryLabelMap のキー順 + 未登録は末尾）
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
      children.push({ terms: direct });
    }
    for (const [subKey, terms] of subMap) {
      if (subKey === "__direct__") continue;
      const subLabel =
        categoryLabelMap[`${parentKey}/${subKey}`] ?? subKey;
      children.push({
        subKey,
        subLabel,
        terms,
      });
    }
    return {
      parentKey,
      parentLabel: getCategoryLabel(parentKey),
      children,
    };
  });
}

function TermLink({ term }: { term: TermListItem }) {
  return (
    <Link
      href={`/terms/${term.slug}`}
      className="block rounded-lg px-3 py-2 text-[#111111] transition-colors hover:bg-gray-100 hover:text-[#5E7AB8]"
    >
      {term.title}
    </Link>
  );
}

export default function TermsPage() {
  const terms = getAllTerms();
  const groups = groupTermsByCategory(terms);

  return (
    <PageContainer className="max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-[#111111] sm:text-3xl">
        用語集
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
                    {child.terms.map((term) => (
                      <li key={term.slug}>
                        <TermLink term={term} />
                      </li>
                    ))}
                  </ul>
                </CollapsibleSection>
              ) : (
                <ul key="direct" className="space-y-1">
                  {child.terms.map((term) => (
                    <li key={term.slug}>
                      <TermLink term={term} />
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
