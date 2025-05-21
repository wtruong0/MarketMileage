// content.js
function scrapeListingData() {

    let mileage = "Unknown";
    let ymm = "Unknown";
    // title scraping
    const titleElement = document.querySelector('[data-testid="marketplace-item-title"]');
    const title = titleElement?.innerText?.trim();

    if (title) {
    ymm = title;
    }
    
    // mileage scraping
    const possibleMileageElements = Array.from(document.querySelectorAll("span, div"))
        .filter(el => el.innerText?.toLowerCase().includes("mile"));

    for (let el of possibleMileageElements) {
        const match = el.innerText.match(/\d{1,3}(,\d{3})*/);
        if (match) {
            mileage = match[0].replace(/,/g, "");
            break;
        }
    }

    // debug logging
    console.log("Scraped listing data:", { ymm, mileage });

    return { ymm, mileage };
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "scrapeData") {
        const listingData = scrapeListingData();
        sendResponse(listingData);
    }
});