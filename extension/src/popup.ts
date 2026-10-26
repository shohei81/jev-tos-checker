import { CATEGORIES } from "../../core/categories";
import { analyzeClauses, errorMessage } from "./analyze";
import { groupFindings, type CategoryFindings } from "./classify";
import { localizePage, t } from "./i18n";
import { extractClauses, revealClause } from "./page";
import { loadSettings } from "./settings";

const setupEl = document.getElementById("setup") as HTMLDivElement;
const startEl = document.getElementById("start") as HTMLDivElement;
const hintEl = document.getElementById("hint") as HTMLParagraphElement;
const analyzeButton = document.getElementById("analyze") as HTMLButtonElement;
const progressEl = document.getElementById("progress") as HTMLProgressElement;
const summaryEl = document.getElementById("summary") as HTMLParagraphElement;
const statusEl = document.getElementById("status") as HTMLParagraphElement;
const resultsEl = document.getElementById("results") as HTMLDivElement;
const clearEl = document.getElementById("clear") as HTMLParagraphElement;

const categories = CATEGORIES.map(({ id }) => ({ id, label: t(`category_${id}`) }));

function showStatus(text: string, isError = false): void {
  statusEl.textContent = text;
  statusEl.className = isError ? "error" : "";
}

function resetResults(): void {
  summaryEl.hidden = true;
  clearEl.hidden = true;
  resultsEl.replaceChildren();
  showStatus("");
}

function render(groups: CategoryFindings[], total: number, tabId: number): void {
  const flagged = groups.filter((g) => g.findings.length > 0);
  const clear = groups.filter((g) => g.findings.length === 0);
  const markedClauses = new Set(flagged.flatMap((g) => g.findings.map((f) => f.clauseIndex)));

  summaryEl.textContent =
    markedClauses.size > 0
      ? t("summaryFound", [String(total), String(markedClauses.size)])
      : t("summaryNone", String(total));
  summaryEl.hidden = false;

  // 該当の多いカテゴリを先に並べる
  flagged.sort((a, b) => b.findings.length - a.findings.length);

  for (const group of flagged) {
    const section = document.createElement("section");
    const heading = document.createElement("h2");
    const label = document.createElement("span");
    label.textContent = group.label;
    const count = document.createElement("span");
    count.className = "count";
    count.textContent = String(group.findings.length);
    heading.append(label, count);

    const list = document.createElement("ul");
    for (const finding of group.findings) {
      const button = document.createElement("button");
      button.className = "clause high";

      const verdict = document.createElement("span");
      verdict.className = "verdict";
      const level = document.createElement("span");
      level.textContent = t("levelHigh");
      const likelihood = document.createElement("span");
      likelihood.className = "likelihood";
      likelihood.textContent = `${Math.round(finding.probability * 100)}%`;
      verdict.append(level, likelihood);

      const quote = document.createElement("span");
      quote.className = "quote";
      quote.textContent = finding.text;

      button.append(verdict, quote);
      button.addEventListener("click", () => {
        chrome.scripting.executeScript({
          target: { tabId },
          func: revealClause,
          args: [finding.clauseIndex],
        });
      });
      const item = document.createElement("li");
      item.append(button);
      list.append(item);
    }
    section.append(heading, list);
    resultsEl.append(section);
  }

  if (clear.length > 0) {
    clearEl.textContent = t(
      "nothingFoundFor",
      clear.map((g) => g.label).join(t("listSeparator")),
    );
    clearEl.hidden = false;
  }
}

async function analyze(): Promise<void> {
  const settings = await loadSettings();
  if (!settings) return;
  analyzeButton.disabled = true;
  hintEl.hidden = true;
  resetResults();
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const tabId = tab.id!;
    const [{ result: clauses }] = await chrome.scripting.executeScript({
      target: { tabId },
      func: extractClauses,
    });
    if (!clauses || clauses.length === 0) {
      showStatus(t("statusNoClauses"));
      return;
    }

    const total = clauses.length;
    progressEl.max = total;
    progressEl.value = 0;
    progressEl.hidden = false;
    showStatus(t("statusAnalyzing", ["0", String(total)]));
    const results = await analyzeClauses(clauses, settings, (done) => {
      progressEl.value = done;
      showStatus(t("statusAnalyzing", [String(done), String(total)]));
    });
    showStatus("");
    render(groupFindings(categories, clauses, results), total, tabId);
  } catch (e) {
    showStatus(errorMessage(e), true);
  } finally {
    progressEl.hidden = true;
    analyzeButton.disabled = false;
  }
}

localizePage();
for (const el of document.querySelectorAll(".open-settings")) {
  el.addEventListener("click", () => chrome.runtime.openOptionsPage());
}
analyzeButton.addEventListener("click", analyze);
loadSettings().then((settings) => {
  setupEl.hidden = settings !== null;
  startEl.hidden = settings === null;
});
