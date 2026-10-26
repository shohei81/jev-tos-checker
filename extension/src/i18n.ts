export function t(key: string, substitutions?: string | string[]): string {
  return chrome.i18n.getMessage(key, substitutions);
}

// data-i18n 属性を持つ要素の textContent をメッセージで置き換える
export function localizePage(): void {
  document.documentElement.lang = chrome.i18n.getUILanguage();
  document.querySelectorAll<HTMLElement>("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n!);
  });
}
