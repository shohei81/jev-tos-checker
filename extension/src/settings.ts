export type Settings =
  | { mode: "apiKey"; apiKey: string }
  | { mode: "server"; serverUrl: string };

export async function loadSettings(): Promise<Settings | null> {
  const { settings } = await chrome.storage.local.get("settings");
  return (settings as Settings | undefined) ?? null;
}

export async function saveSettings(settings: Settings): Promise<void> {
  await chrome.storage.local.set({ settings });
}
