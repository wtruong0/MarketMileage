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
    resultBox.style.marginTop = "6px";
    resultBox.style.fontWeight = "bold";
    resultBox.style.fontFamily = btn.style.fontFamily

    btn.onclick = async () => {
        const listingPrice = getListingPrice();
        const { ymm, mileage } = scrapeListingData();
        if (ymm === "Unknown" || mileage === "Unknown") {
            resultBox.innerText = "❌ Incomplete data.";
            resultBox.style.color = "gray";
            return;
        }

        try {
            resultBox.style.color = "gray";
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
                resultBox.innerText = "😵‍💫 Suspicious estimate, try again";
                resultBox.style.color = "gray";
                return;
            }

            const ratio = (listingPrice - estimated) / estimated;
            console.log(`📉 Listing: $${listingPrice}, Estimate: $${estimated}, Ratio: ${ratio}`);
            let color, label;

            if (ratio < -0.10) {
                color = "green";
                label = "🟢 Good Value!";
            } else if (ratio > 0.10) {
                color = "red";
                label = "🔴 Poor Value...";
            } else {
                color = "gray";
                label = "🟡 Fair Price";
            }
            resultBox.innerText = `AI Estimate: $${estimated.toLocaleString()} | ${label}`;
            resultBox.style.color = color;

        } catch (e) {
            console.error("Estimation failed", e);
            resultBox.innerText = "⚠️ Failed to estimate.";
            resultBox.style.color = "gray";
        }
    };

    const container = document.createElement("div");
    container.style.display = "flex";
    container.style.justifyContent = "flex-start";
    container.style.alignItems = "flex-start";
    container.style.gap = "14px";
    container.style.marginTop = "6px";

    const rightBox = document.createElement("div");
    rightBox.style.display = "flex";
    rightBox.style.flexDirection = "column";
    rightBox.style.alignItems = "flex-end";

    btn.style.padding = "4px 8px";
    btn.style.background = "#1877F2";
    btn.style.color = "white";
    btn.style.border = "none";
    btn.style.borderRadius = "4px";
    btn.style.cursor = "pointer";
    btn.style.fontSize = "12px";
    btn.style.fontFamily = "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji', sans-serif";

    resultBox.style.marginTop = "4px";
    resultBox.style.fontWeight = "bold";
    resultBox.style.fontFamily = btn.style.fontFamily;
    resultBox.style.textAlign = "right";

    priceEl.parentElement.insertBefore(container, priceEl);
    container.appendChild(priceEl);
    container.appendChild(rightBox);
    rightBox.appendChild(btn);
    rightBox.appendChild(resultBox);
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