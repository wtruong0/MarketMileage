// content.js

function scrapeListingData() {
    // locate data fields on the listing page
    let title = document.querySelector('[data-testid="marketplace-item-title"]')?.innerText || "Unknown";
    let price = document.querySelector('[data-testid="marketplace-item-price"]')?.innerText || "Unknown";
    let details = document.querySelectorAll('[data-testid="marketplace-item-condition"]');

    let year = "Unknown";
    let make = "Unknown";
    let model = "Unknown";
    let mileage = "Unknown";
    let condition = "Unknown";

    details.forEach(detail => {
        let text = detail.innerText.toLowerCase();
        if (text.includes("year")) year = text.split(":")[1].trim();
        if (text.includes("make")) make = text.split(":")[1].trim();
        if (text.includes("model")) model = text.split(":")[1].trim();
        if (text.includes("mileage")) mileage = text.split(":")[1].trim();
        if (text.includes("condition")) condition = text.split(":")[1].trim();
    });

    return { title, price, year, make, model, mileage, condition };
}

// Listen for messages from the popup script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "scrapeData") {
        const listingData = scrapeListingData();
        sendResponse(listingData);
    }
});