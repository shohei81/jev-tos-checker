// 「悪質」である確率がこれ以上の条項だけに印を付ける。
// 一般的な条項で利用者を不安にさせないよう、印は1段階にして高めに置く。評価データで調整する前提。
export const THRESHOLD = 0.7;

export interface Category {
  id: string;
  label: string;
}

export interface Finding {
  clauseIndex: number;
  text: string;
  probability: number;
}

export interface CategoryFindings extends Category {
  findings: Finding[];
}

export function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

// results[i] は clauses[i] に対する各カテゴリの確率
export function groupFindings(
  categories: Category[],
  clauses: string[],
  results: Record<string, number>[],
): CategoryFindings[] {
  return categories.map((category) => {
    const findings: Finding[] = [];
    results.forEach((result, clauseIndex) => {
      const probability = result[category.id];
      if (probability >= THRESHOLD) {
        findings.push({ clauseIndex, text: clauses[clauseIndex], probability });
      }
    });
    findings.sort((a, b) => b.probability - a.probability);
    return { ...category, findings };
  });
}
