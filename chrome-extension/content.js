// content.js
function scrapeListingData() {
    let year = "Unknown";
    let make = "Unknown";
    let model = "Unknown";
    let mileage = "Unknown";

    // title scraping
    const titleElement = document.querySelector('[data-testid="marketplace-item-title"]');
    const title = titleElement?.innerText?.trim() || "";

    if (title) {
        const tokens = title.split(" ");
        const yearRegex = /^(19|20)\d{2}$/;

        if (tokens.length >= 3 && yearRegex.test(tokens[0])) {
            year = tokens[0];
            make = tokens[1];
            model = tokens[2];
        }
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
    console.log("Scraped listing data:", { year, make, model, mileage });

    return { year, make, model, mileage };
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "scrapeData") {
        const listingData = scrapeListingData();
        sendResponse(listingData);
    }
});