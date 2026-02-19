import { notFound } from "next/navigation";
import { getDesignById, getAllDesignIds } from "../../../lib/designs";
import { PageContainer } from "../../../components/ui/PageContainer";
import { SectionHeading } from "../../../components/ui/SectionHeading";

export async function generateStaticParams() {
  const ids = getAllDesignIds();
  return ids.map((type) => ({ type }));
}

interface PageProps {
  params: Promise<{ type: string }>;
}

export default async function DesignDetailPage({ params }: PageProps) {
  const { type } = await params;
  const design = getDesignById(type);

  if (!design) {
    notFound();
  }

  const { meta, basic_structure } = design;

  return (
    <PageContainer className="max-w-3xl">
      <h1 className="mb-2 text-2xl font-bold tracking-tight text-[#111111] sm:text-3xl">
        {meta.name}
      </h1>
      {meta.english_name && (
        <p className="mb-6 text-gray-600">{meta.english_name}</p>
      )}

      {meta.origin && (
        <section className="mb-8">
          <SectionHeading>由来</SectionHeading>
          <dl className="space-y-2 text-sm">
            {meta.origin.base_design && (
              <div>
                <dt className="font-medium text-gray-600">基本設計</dt>
                <dd className="mt-0.5 text-[#111111]">{meta.origin.base_design}</dd>
              </div>
            )}
            {meta.origin.photographic_adaptation && (
              <div>
                <dt className="font-medium text-gray-600">写真用への適応</dt>
                <dd className="mt-0.5 text-[#111111]">
                  {meta.origin.photographic_adaptation}
                </dd>
              </div>
            )}
          </dl>
        </section>
      )}

      {meta.historical_development && meta.historical_development.length > 0 && (
        <section className="mb-8">
          <SectionHeading>歴史的発展</SectionHeading>
          <ul className="space-y-3 text-sm">
            {meta.historical_development.map((item, i) => (
              <li key={i} className="border-l-2 border-gray-200 pl-4">
                <span className="font-medium text-gray-600">
                  {item.year ?? item.period}
                  {item.designer && ` - ${item.designer}`}
                </span>
                <p className="mt-0.5 text-[#111111]">{item.description}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {basic_structure?.typical_configurations &&
        basic_structure.typical_configurations.length > 0 && (
          <section className="mb-8">
            <SectionHeading>典型構成</SectionHeading>
            <ul className="list-inside list-disc space-y-1 text-sm text-[#111111]">
              {basic_structure.typical_configurations.map((config, i) => (
                <li key={i}>{config}</li>
              ))}
            </ul>
          </section>
        )}

      {basic_structure?.symmetry && (
        <section>
          <SectionHeading>対称性</SectionHeading>
          <p className="text-sm text-[#111111]">{basic_structure.symmetry.text}</p>
        </section>
      )}
    </PageContainer>
  );
}
