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

function injectEstimateButton() {
    const priceEl = Array.from(document.querySelectorAll('span[dir="auto"]'))
        .find(el => el.innerText.trim().startsWith("$"));

    if (!priceEl || document.getElementById("marketmileage-btn")) return;

    const btn = document.createElement("button");
    btn.id = "marketmileage-btn";
    btn.innerText = "Estimate with MarketMileage 🤖";
    btn.style.padding = "4px 8px";
    btn.style.background = "#1877F2";
    btn.style.color = "white";
    btn.style.border = "none";
    btn.style.borderRadius = "4px";
    btn.style.cursor = "pointer";
    btn.style.fontSize = "12px";
    btn.style.fontFamily = "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji', sans-serif";

    const resultBox = document.createElement("div");
    resultBox.style.minHeight = "1.2em"; // reserve one line of space
    resultBox.id = "marketmileage-result";
    resultBox.style.marginTop = "6px";
    resultBox.style.fontWeight = "bold";
    resultBox.style.fontFamily = btn.style.fontFamily
    resultBox.innerText = "‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ";

    btn.onclick = async () => {
        const priceText = priceEl?.innerText.trim();
        let listingPrice = null;

        if (priceText) {
            const match = priceText.match(/\$?(\d{1,3}(?:,\d{3})*)/);
            if (match && match[1]) {
                listingPrice = parseInt(match[1].replace(/,/g, ""));
            }
        }
        const { ymm, mileage } = scrapeListingData();
        if (ymm === "Unknown" || mileage === "Unknown") {
            resultBox.innerText = "❌ Incomplete data.";
            resultBox.style.color = "gray";
            return;
        }
        const condition = conditionSelect.value;
        try {
            resultBox.style.color = "black";
            resultBox.innerText = "🔄 Estimating...";
            const response = await fetch("https://marketmileage-production.up.railway.app/estimate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ymm, mileage, condition })
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
            let color, label, background;

            if (ratio < -0.10) {
                color = "#2ac92a";
                label = "🟢 Good! ";
                background = "#dcfae3";
            } else if (ratio > 0.10) {
                color = "#ff3b3b";
                label = "🔴 Poor ";
                background = "#eddada";
            } else {
                color = "#80827a";
                label = "🟡 Fair ";
                background = "#bdbdbd";
            }
            resultBox.style.background = background;
            resultBox.innerText = `AI Valuation: $${estimated.toLocaleString()} | ${label}`;
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
    container.style.alignItems = "center";
    container.style.gap = "12px";
    container.style.marginTop = "6px";

    const conditionSelect = document.createElement("select");
    conditionSelect.id = "marketmileage-condition";
    conditionSelect.style.marginBottom = "6px";
    conditionSelect.style.fontSize = "12px";
    conditionSelect.style.padding = "4px";
    conditionSelect.style.borderRadius = "4px";
    conditionSelect.style.fontFamily = btn.style.fontFamily;

    ["Fair", "Good", "Very Good", "Excellent"].forEach(optionText => {
        const option = document.createElement("option");
        option.value = optionText.toLowerCase(); // lowercase value for backend
        option.innerText = optionText;
        conditionSelect.appendChild(option);
    });
    conditionSelect.value = "good"; // default
    const label = document.createElement("label");
    label.innerText = "Condition: ";
    label.style.fontSize = "12px";
    label.style.marginRight = "4px";
    label.style.fontFamily = btn.style.fontFamily;

    const conditionWrapper = document.createElement("div");
    conditionWrapper.style.display = "flex";
    conditionWrapper.style.alignItems = "center";
    conditionWrapper.style.marginTop = "6px";
    conditionWrapper.style.marginBottom = "2px";
    conditionWrapper.appendChild(label);
    conditionWrapper.appendChild(conditionSelect);

    const actionBox = document.createElement("div");
    actionBox.style.display = "flex";
    actionBox.style.flexDirection = "column";
    actionBox.style.minWidth = "200px"; 
    actionBox.style.alignItems = "flex-start";

    btn.style.padding = "4px 8px";
    btn.style.background = "#1877F2";
    btn.style.color = "white";
    btn.style.border = "none";
    btn.style.borderRadius = "4px";
    btn.style.cursor = "pointer";
    btn.style.alignSelf = "flex-start";
    btn.style.fontSize = "12px";
    btn.style.fontFamily = "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji', sans-serif";

    resultBox.style.marginTop = "6px";
    resultBox.style.fontWeight = "bold";
    resultBox.style.fontSize = "12px";
    resultBox.style.background = "#bdbbb7"
    resultBox.style.borderRadius = "6px";
    resultBox.style.padding = "4px 6px";
    resultBox.style.fontFamily = btn.style.fontFamily;
    resultBox.style.textAlign = "right";

    priceEl.parentElement.insertBefore(container, priceEl);
    container.appendChild(priceEl);
    container.appendChild(actionBox);

    actionBox.appendChild(btn);
    actionBox.appendChild(conditionWrapper);
    actionBox.appendChild(conditionSelect);
    actionBox.appendChild(resultBox);
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
function waitForElement(selectorFn, timeout = 5000, interval = 300) {
    return new Promise((resolve, reject) => {
        const start = Date.now();

        const check = () => {
            const el = selectorFn();
            if (el) return resolve(el);
            if (Date.now() - start > timeout) return reject("Element not found in time");
            setTimeout(check, interval);
        };

        check();
    });
}

waitForElement(() => document.querySelector('span[dir="auto"]'))
    .then(() => {
        injectEstimateButton();
    })
    .catch(err => {
        console.warn("MarketMileage failed to inject:", err);
    });
console.log("content.js loaded");