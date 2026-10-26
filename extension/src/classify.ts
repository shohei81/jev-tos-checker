// Noul のしきい値(TypeSafe ドキュメントの推奨初期値)。評価データで調整する前提。
export const HIGH_THRESHOLD = 0.7;
export const REVIEW_THRESHOLD = 0.3;

export type Level = "high" | "review";

export interface Category {
  id: string;
  label: string;
}

export interface Finding {
  clauseIndex: number;
  text: string;
  noul: number;
  level: Level;
}

export interface CategoryFindings extends Category {
  findings: Finding[];
}

export function levelOf(noul: number): Level | null {
  if (noul >= HIGH_THRESHOLD) return "high";
  if (noul >= REVIEW_THRESHOLD) return "review";
  return null;
}

export function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

// results[i] は clauses[i] に対する各カテゴリの Noul 値
export function groupFindings(
  categories: Category[],
  clauses: string[],
  results: Record<string, number>[],
): CategoryFindings[] {
  return categories.map((category) => {
    const findings: Finding[] = [];
    results.forEach((result, clauseIndex) => {
      const noul = result[category.id];
      const level = levelOf(noul);
      if (level) findings.push({ clauseIndex, text: clauses[clauseIndex], noul, level });
    });
    findings.sort((a, b) => b.noul - a.noul);
    return { ...category, findings };
  });
}
