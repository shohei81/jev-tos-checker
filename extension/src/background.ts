// インストール直後に設定画面を開き、最初の接続設定へ誘導する
chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === "install") chrome.runtime.openOptionsPage();
});
