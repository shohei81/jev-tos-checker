// chrome.scripting.executeScript でページに注入する関数。
// 関数単体でシリアライズされるため、外側のスコープを参照してはいけない。

export function extractClauses(): string[] {
  const BLOCKS = "p, li, dd, td";
  const MIN_LENGTH = 20;
  const MAX_LENGTH = 4000;
  const MAX_CLAUSES = 400;

  document
    .querySelectorAll("[data-jev-tos-id]")
    .forEach((el) => el.removeAttribute("data-jev-tos-id"));

  const clauses: string[] = [];
  for (const el of Array.from(document.querySelectorAll<HTMLElement>(BLOCKS))) {
    if (clauses.length >= MAX_CLAUSES) break;
    // 入れ子のブロックは内側だけを条項として扱う
    if (el.querySelector(BLOCKS) || el.getClientRects().length === 0) continue;
    const text = el.innerText.replace(/\s+/g, " ").trim();
    if (text.length < MIN_LENGTH) continue;
    el.setAttribute("data-jev-tos-id", String(clauses.length));
    clauses.push(text.slice(0, MAX_LENGTH));
  }
  return clauses;
}

export function revealClause(id: number): void {
  const prev = document.querySelector<HTMLElement>("[data-jev-tos-active]");
  if (prev) {
    prev.style.outline = prev.getAttribute("data-jev-tos-active") ?? "";
    prev.removeAttribute("data-jev-tos-active");
  }
  const el = document.querySelector<HTMLElement>(`[data-jev-tos-id="${id}"]`);
  if (!el) return;
  el.setAttribute("data-jev-tos-active", el.style.outline);
  el.style.outline = "3px solid #e5484d";
  el.scrollIntoView({ behavior: "smooth", block: "center" });
}
