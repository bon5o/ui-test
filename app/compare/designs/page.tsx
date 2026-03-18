import { PageContainer } from "../../../components/ui/PageContainer";
import type { DesignComparisonData } from "../../../components/compare/DesignCompareClient";
import { DesignCompareClient } from "../../../components/compare/DesignCompareClient";
import raw from "../../../data/compare/designs.json";

export default function CompareDesignsPage() {
  const data = raw as unknown as DesignComparisonData;
  return (
    <PageContainer className="max-w-5xl">
      <DesignCompareClient data={data} />
    </PageContainer>
  );
}

