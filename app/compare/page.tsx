import Link from "next/link";
import { PageContainer } from "../../components/ui/PageContainer";

const items = [
  {
    href: "/compare/lenses",
    title: "レンズ比較",
    description: "レンズ同士の比較（準備中）",
  },
  {
    href: "/compare/designs",
    title: "構成型比較",
    description: "構成型（設計タイプ）の比較（準備中）",
  },
  {
    href: "/compare/makers",
    title: "メーカー比較",
    description: "メーカー別の比較（準備中）",
  },
] as const;

export default function CompareIndexPage() {
  return (
    <PageContainer className="max-w-3xl">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-[#111111] sm:text-3xl">
          比較一覧
        </h1>
        <p className="mt-2 text-[15px] text-gray-600">
          比較機能は準備中です。まずは導線のみ実装しています。
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((it) => (
          <Link
            key={it.href}
            href={it.href}
            className="group rounded-xl border border-gray-200 bg-white p-4 transition-colors hover:bg-gray-50/60"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-base font-semibold text-gray-900">
                  {it.title}
                </div>
                <div className="mt-1 text-sm text-gray-600">
                  {it.description}
                </div>
              </div>
              <span
                className="shrink-0 text-gray-400 transition-colors group-hover:text-gray-600"
                aria-hidden="true"
              >
                →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </PageContainer>
  );
}

