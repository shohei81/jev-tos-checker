import { CATEGORIES } from "../../core/categories";
import { analyzeClauses, errorMessage } from "./analyze";
import { groupFindings, type CategoryFindings } from "./classify";
import { localizePage, t } from "./i18n";
import { extractClauses, revealClause } from "./page";
import { loadSettings } from "./settings";

const analyzeButton = document.getElementById("analyze") as HTMLButtonElement;
const setupEl = document.getElementById("setup") as HTMLDivElement;
const statusEl = document.getElementById("status") as HTMLParagraphElement;
const resultsEl = document.getElementById("results") as HTMLDivElement;

const categories = CATEGORIES.map(({ id }) => ({ id, label: t(`category_${id}`) }));

function render(groups: CategoryFindings[], tabId: number): void {
  resultsEl.replaceChildren();
  for (const group of groups) {
    const section = document.createElement("section");
    const heading = document.createElement("h2");
    const high = group.findings.filter((f) => f.level === "high").length;
    const review = group.findings.length - high;
    heading.textContent = group.label;
    const summary = document.createElement("span");
    summary.className = "summary";
    summary.textContent =
      group.findings.length === 0
        ? t("noIssues")
        : t("summaryCounts", [String(high), String(review)]);
    heading.append(summary);
    section.append(heading);

    const list = document.createElement("ul");
    for (const finding of group.findings) {
      const item = document.createElement("li");
      const button = document.createElement("button");
      button.className = `finding ${finding.level}`;
      const badge = document.createElement("span");
      badge.className = "badge";
      badge.textContent = `${t(finding.level === "high" ? "levelHigh" : "levelReview")} ${Math.round(finding.noul * 100)}%`;
      const text = document.createElement("span");
      text.className = "text";
      text.textContent = finding.text;
      button.append(badge, text);
      button.addEventListener("click", () => {
        chrome.scripting.executeScript({
          target: { tabId },
          func: revealClause,
          args: [finding.clauseIndex],
        });
      });
      item.append(button);
      list.append(item);
    }
    section.append(list);
    resultsEl.append(section);
  }
}

async function analyze(): Promise<void> {
  const settings = await loadSettings();
  if (!settings) return;
  analyzeButton.disabled = true;
  resultsEl.replaceChildren();
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const tabId = tab.id!;
    const [{ result: clauses }] = await chrome.scripting.executeScript({
      target: { tabId },
      func: extractClauses,
    });
    if (!clauses || clauses.length === 0) {
      statusEl.textContent = t("statusNoClauses");
      return;
    }

    const total = String(clauses.length);
    statusEl.textContent = t("statusAnalyzing", ["0", total]);
    const results = await analyzeClauses(clauses, settings, (done) => {
      statusEl.textContent = t("statusAnalyzing", [String(done), total]);
    });
    statusEl.textContent = t("statusDone", total);
    render(groupFindings(categories, clauses, results), tabId);
  } catch (e) {
    statusEl.textContent = errorMessage(e);
  } finally {
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
  analyzeButton.hidden = settings === null;
});
