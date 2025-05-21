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

function getListingPrice() {
    const priceEl = Array.from(document.querySelectorAll('span[dir="auto"]'))
        .find(el => el.innerText.trim().match(/^\\$\\d{1,3}(,\\d{3})*/));
    
    if (priceEl) {
        const match = priceEl.innerText.match(/\\d{1,3}(?:,\\d{3})*/);
        if (match) return parseInt(match[0].replace(/,/g, ""));
    }

    return null;
}
function injectEstimateButton() {
    const priceEl = Array.from(document.querySelectorAll('span[dir="auto"]'))
        .find(el => el.innerText.trim().startsWith("$"));

    if (!priceEl || document.getElementById("marketmileage-btn")) return;

    const btn = document.createElement("button");
    btn.id = "marketmileage-btn";
    btn.innerText = "Estimate with AI 🤖";
    btn.style.marginLeft = "10px";
    btn.style.padding = "4px 8px";
    btn.style.background = "#1877F2";
    btn.style.color = "white";
    btn.style.border = "none";
    btn.style.borderRadius = "4px";
    btn.style.cursor = "pointer";
    btn.style.fontSize = "12px";
    btn.style.fontFamily = "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji', sans-serif";

    const resultBox = document.createElement("div");
    resultBox.id = "marketmileage-result";
    resultBox.style.marginTop = "10px";
    resultBox.style.fontWeight = "bold";
    resultBox.style.fontFamily = "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji', sans-serif";

    btn.onclick = async () => {
        const listingPrice = getListingPrice();
        const { ymm, mileage } = scrapeListingData();
        if (ymm === "Unknown" || mileage === "Unknown") {
            resultBox.innerText = "❌ Incomplete data.";
            resultBox.style.color = "gray";
            return;
        }

        try {
            resultBox.innerText = "🔄 Estimating...";
            const response = await fetch("https://marketmileage-production.up.railway.app/estimate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ymm, mileage, condition: "good" })
            });

            const result = await response.json();

            const match = result.estimated_value.match(/\$?(\d{1,3}(?:,\d{3})*)/);
            if (!match || !match[1]) {
                resultBox.innerText = "⚠️ Invalid estimate";
                resultBox.style.color = "gray";
                return;
            }
            const estimated = parseInt(result.estimated_value.replace(/[^0-9]/g, ""));
            if (estimated < 500 || estimated > 150000) {
                resultBox.innerText = "⚠️ Suspicious estimate";
                resultBox.style.color = "gray";
                return;
            }
            const diff = listingPrice - estimated;
            const ratio = diff / estimated;

            resultBox.innerText = `AI Estimate: $${estimated.toLocaleString()}`;
            resultBox.style.color =
                ratio < -0.1 ? "green" :
                ratio > 0.1 ? "red" : "orange";
        } catch (e) {
            console.error("Estimation failed", e);
            resultBox.innerText = "⚠️ Failed to estimate.";
            resultBox.style.color = "gray";
        }
    };

    priceEl.insertAdjacentElement("afterend", btn);
    btn.insertAdjacentElement("afterend", resultBox);
    console.log("injectEstimateButton() ran");
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
injectEstimateButton();
console.log("content.js loaded");