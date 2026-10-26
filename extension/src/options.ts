import { analyzeClauses, errorMessage } from "./analyze";
import { localizePage, t } from "./i18n";
import { loadSettings, saveSettings, type Settings } from "./settings";

const form = document.getElementById("form") as HTMLFormElement;
const apiKeyInput = document.getElementById("apiKey") as HTMLInputElement;
const serverUrlInput = document.getElementById("serverUrl") as HTMLInputElement;
const saveButton = document.getElementById("save") as HTMLButtonElement;
const messageEl = document.getElementById("message") as HTMLParagraphElement;

function selectedMode(): Settings["mode"] {
  return (form.elements.namedItem("mode") as RadioNodeList).value as Settings["mode"];
}

function showMessage(text: string, ok: boolean): void {
  messageEl.textContent = text;
  messageEl.className = ok ? "ok" : "error";
}

function updateFields(): void {
  const mode = selectedMode();
  apiKeyInput.closest(".field")!.toggleAttribute("hidden", mode !== "apiKey");
  serverUrlInput.closest(".field")!.toggleAttribute("hidden", mode !== "server");
}

async function save(): Promise<void> {
  let settings: Settings;
  if (selectedMode() === "apiKey") {
    const apiKey = apiKeyInput.value.trim();
    if (!apiKey) return showMessage(t("errorEmpty"), false);
    settings = { mode: "apiKey", apiKey };
  } else {
    let url: URL;
    try {
      url = new URL(serverUrlInput.value.trim());
    } catch {
      return showMessage(t("errorInvalidUrl"), false);
    }
    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return showMessage(t("errorInvalidUrl"), false);
    }
    // ユーザー操作の直後に呼ぶ必要があるので、ここより前で await しない
    const granted = await chrome.permissions.request({
      origins: [`${url.protocol}//${url.hostname}/*`],
    });
    if (!granted) return showMessage(t("errorPermissionDenied"), false);
    settings = { mode: "server", serverUrl: url.origin };
  }

  saveButton.disabled = true;
  showMessage(t("saving"), true);
  try {
    await analyzeClauses(["This is a connection test."], settings, () => {});
    await saveSettings(settings);
    showMessage(t("saved"), true);
  } catch (e) {
    showMessage(errorMessage(e), false);
  } finally {
    saveButton.disabled = false;
  }
}

localizePage();
form.addEventListener("change", updateFields);
form.addEventListener("submit", (e) => {
  e.preventDefault();
  save();
});
loadSettings().then((settings) => {
  if (settings?.mode === "server") {
    (form.elements.namedItem("mode") as RadioNodeList).value = "server";
    serverUrlInput.value = settings.serverUrl;
  } else if (settings?.mode === "apiKey") {
    apiKeyInput.value = settings.apiKey;
  }
  updateFields();
});
