document.getElementById("estimateButton").addEventListener("click", async () => {
    // handles ui interactions
    // send message to content.js to scrape data
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: "scrapeData" }, (response) => {
            if (response) {
                document.getElementById("result").innerText = JSON.stringify(response, null, 2);
            } else {
                document.getElementById("result").innerText = "Failed to scrape data.";
            }
        });
    });
});