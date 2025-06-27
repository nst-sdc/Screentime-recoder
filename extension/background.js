console.log("Background script running...");

// Example of basic listener
chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed");
});
