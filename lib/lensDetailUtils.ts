/**
 * chapters から design_type を取得
 * basic_structure -> typical_variations または geometry_definition -> meta.design_type
 * フォールバック: meta.design_type
 */
export function getDesignTypeFromChapters(
  lens: { meta?: Record<string, unknown>; chapters?: Array<{ id: string; sections?: Array<{ id: string; meta?: Record<string, unknown> }> }> }
): string {
  const meta = lens?.meta as Record<string, unknown> | undefined;
  const chBasic = (lens?.chapters ?? []).find((c) => c?.id === "basic_structure");
  const sections = chBasic?.sections ?? [];
  const secTypical = sections.find((s) => s?.id === "typical_variations" || s?.id === "geometry_definition");
  const dt = (secTypical?.meta as Record<string, unknown> | undefined)?.design_type as string | undefined;
  if (dt != null && dt !== "" && dt !== "unknown") return String(dt);
  const metaDt = meta?.design_type as string | undefined;
  if (metaDt != null && metaDt !== "" && metaDt !== "unknown") return String(metaDt);
  return "";
}

/**
 * chapters から sharpness を取得
 * practical_rendering -> sharpness_character -> meta.sharpness
 * フォールバック: meta.sharpness
 */
export function getSharpnessFromChapters(
  lens: { meta?: Record<string, unknown>; chapters?: Array<{ id: string; sections?: Array<{ id: string; meta?: Record<string, unknown> }> }> }
): string {
  const meta = lens?.meta as Record<string, unknown> | undefined;
  const chPractical = (lens?.chapters ?? []).find((c) => c?.id === "practical_rendering");
  const sections = chPractical?.sections ?? [];
  const secSharp = sections.find((s) => s?.id === "sharpness_character");
  const s = (secSharp?.meta as Record<string, unknown> | undefined)?.sharpness as string | undefined;
  if (s != null && s !== "" && s !== "unknown") return String(s);
  const metaSharp = meta?.sharpness as string | undefined;
  if (metaSharp != null && metaSharp !== "" && metaSharp !== "unknown") return String(metaSharp);
  return "";
}
