// chrome.scripting.executeScript でページに注入する関数。
// 関数単体でシリアライズされるため、外側のスコープを参照してはいけない。

export function extractClauses(): string[] {
  const MIN_LENGTH = 20;
  const MAX_LENGTH = 4000;
  const MAX_CLAUSES = 400;
  const ID = "data-jev-tos-id";

  document.querySelectorAll(`[${ID}]`).forEach((el) => el.removeAttribute(ID));

  const textOf = (el: Element) => (el as HTMLElement).innerText.replace(/\s+/g, " ").trim();
  const isList = (el: Element | null) => el?.tagName === "UL" || el?.tagName === "OL";

  const clauses: string[] = [];
  const add = (text: string, elements: Element[]) => {
    if (text.length < MIN_LENGTH || clauses.length >= MAX_CLAUSES) return;
    elements.forEach((el) => el.setAttribute(ID, String(clauses.length)));
    clauses.push(text.slice(0, MAX_LENGTH));
  };

  for (const el of Array.from(document.querySelectorAll("p, dd, td, ul, ol"))) {
    // 箇条書きの中身はリスト単位でまとめて扱う。ナビゲーションなどページの枠も除く
    if (el.parentElement?.closest("li, nav, header, footer")) continue;
    if (el.getClientRects().length === 0) continue;

    if (isList(el)) {
      // 箇条書きの1項目だけでは文脈がわからないので、前置きの段落とまとめて1つの条項にする
      const lead = el.previousElementSibling?.tagName === "P" ? el.previousElementSibling : null;
      const lis = Array.from(el.children).filter((li) => li.tagName === "LI");
      // 項目がすべてリンクだけのリストは目次やメニューなので除く
      if (lis.every((li) => { const a = li.querySelector("a"); return a !== null && textOf(a) === textOf(li); })) continue;
      const items = lis.map((li) => `- ${textOf(li)}`);
      add([lead ? textOf(lead) : "", ...items].join("\n").trim(), lead ? [lead, el] : [el]);
      continue;
    }
    // 直後のリストの前置きになっている段落は、リスト側で扱う
    if (el.tagName === "P" && isList(el.nextElementSibling)) continue;
    // 入れ子のブロックは内側だけを条項として扱う
    if (el.querySelector("p, dd, td, ul, ol")) continue;
    add(textOf(el), [el]);
  }
  return clauses;
}

export function revealClause(id: number): void {
  document.querySelectorAll<HTMLElement>("[data-jev-tos-active]").forEach((el) => {
    el.style.outline = el.getAttribute("data-jev-tos-active") ?? "";
    el.removeAttribute("data-jev-tos-active");
  });
  const elements = document.querySelectorAll<HTMLElement>(`[data-jev-tos-id="${id}"]`);
  elements.forEach((el) => {
    el.setAttribute("data-jev-tos-active", el.style.outline);
    el.style.outline = "3px solid #e5484d";
  });
  elements[0]?.scrollIntoView({ behavior: "smooth", block: "center" });
}
