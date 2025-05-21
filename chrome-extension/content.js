// content.js
function scrapeListingData() {

    let mileage = "Unknown";
    let ymm = "Unknown";
    // title scraping
    const yearRegex = /^(19|20)\d{2}/;
    const candidates = Array.from(document.querySelectorAll('span[dir="auto"]'));

    for (const el of candidates) {
        const text = el.innerText?.trim();
        if (text && yearRegex.test(text)) {
            ymm = text;
            break;
        }
    }
    
    // mileage scraping
    const mileageRegex = /(\d{1,3}(?:,\d{3})?)\s*miles?/i;
    const possibleMileageElements = Array.from(document.querySelectorAll("span, div"))
        .filter(el => el.innerText?.toLowerCase().includes("mile"));

    for (const el of possibleMileageElements) {
        const match = el.innerText.match(mileageRegex);
        if (match && match[1]) {
            mileage = match[1].replace(/,/g, "");
            break;
        }
    }
    // debug logging
    console.log("Scraped listing data:", { ymm, mileage });
    return { ymm, mileage };
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Received message:", message);
    if (message.action === "scrapeData") {
        const listingData = scrapeListingData();
        console.log("Sending scraped data:", listingData);
        sendResponse(listingData);
    }
    return true;
});
console.log("content.js loaded");