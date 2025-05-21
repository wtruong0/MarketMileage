chrome.runtime.onInstalled.addListener(() => {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
    chrome.declarativeContent.onPageChanged.addRules([
      {
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { hostContains: "facebook.com", pathContains: "marketplace" }
          })
        ],
        actions: [new chrome.declarativeContent.ShowAction()]
      }
    ]);
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (
    tab.url?.includes("facebook.com/marketplace") &&
    changeInfo.status === "complete"
  ) {
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ["content.js"]
    });
  }
});