// content.js
if (window.hasRunMarketMileage) {
    console.log("MarketMileage content script already loaded, skipping...");
} else {
    window.hasRunMarketMileage = true;
    let currentUrl = location.href;
    function scrapeListingData(root = document) {
        let mileage = "Unknown";
        let ymm = "Unknown";

        const yearRegex = /^(19|20)\d{2}/;
        const candidates = Array.from(root.querySelectorAll('span[dir="auto"]')); //title

        for (const el of candidates) {
            const text = el.innerText?.trim();
            if (text && yearRegex.test(text)) {
                ymm = text;
                break;
            }
        }

        const mileageRegex = /(\d{1,3}(?:,\d{3})?)\s*miles?/i;
        const possibleMileageElements = Array.from(root.querySelectorAll("span, div")) //mileage
            .filter(el => el.innerText?.toLowerCase().includes("mile"));

        for (const el of possibleMileageElements) {
            const match = el.innerText.match(mileageRegex);
            if (match && match[1]) {
                mileage = match[1].replace(/,/g, "");
                break;
            }
        }

        console.log("Scraped listing data:", { ymm, mileage }); //debug logging
        return { ymm, mileage };
    }
    function detectListingContainer() {
        const popup = document.querySelector('div[role="dialog"][aria-label="Marketplace Listing Viewer"]');
        if (popup) return popup;

        const fullPageTitle = document.querySelector('h1');
        if (fullPageTitle) {
            let container = fullPageTitle.parentElement;
            while (container && container.tagName !== 'MAIN') {
                container = container.parentElement;
            }
            return container || document.querySelector('div[role="main"]');
        }

        return null;
    }

    function injectEstimateButton(root) {
        const priceEl = Array.from(root.querySelectorAll('span[dir="auto"]'))
            .find(el => el.innerText.trim().startsWith("$"));

        if (!priceEl || root.querySelector("marketmileage-btn")) return;

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
        btn.style.transition = "all 0.3s ease";
        btn.style.opacity = "0";
        btn.style.transform = "translateY(-10px)";

        const resultBox = document.createElement("div");
        resultBox.style.minHeight = "1.2em"; // reserve one line of space
        resultBox.id = "marketmileage-result";
        resultBox.style.marginTop = "6px";
        resultBox.style.fontWeight = "bold";
        resultBox.style.fontFamily = btn.style.fontFamily
        resultBox.innerText = "‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ";
        resultBox.style.opacity = "0";
        resultBox.style.transition = "opacity 0.3s ease";

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
        conditionSelect.style.opacity = "0";
        conditionSelect.style.transition = "opacity 0.3s ease";

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
        conditionWrapper.style.opacity = "0";
        conditionWrapper.style.transition = "opacity 0.3s ease";
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
        resultBox.style.background = "#d4d4d4"
        resultBox.style.borderRadius = "6px";
        resultBox.style.padding = "4px 6px";
        resultBox.style.fontFamily = btn.style.fontFamily;
        resultBox.style.textAlign = "right";

        setTimeout(() => {
        btn.style.opacity = "1";
        btn.style.transform = "translateY(0)";
        conditionWrapper.style.opacity = "1";
        conditionSelect.style.opacity = "1";
        resultBox.style.opacity = "1";
        }, 100);

        priceEl.parentElement.insertBefore(container, priceEl);
        container.appendChild(priceEl);
        container.appendChild(actionBox);

        actionBox.appendChild(btn);
        actionBox.appendChild(conditionWrapper);
        actionBox.appendChild(conditionSelect);
        actionBox.appendChild(resultBox);

        const style = document.createElement("style");
        style.textContent = `
            @keyframes pulse {
                0% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.05); opacity: 0.9; }
                100% { transform: scale(1); opacity: 1; }
            }
            .pulse {
                animation: pulse 0.6s ease-in-out;
            }
            @keyframes sparkleMove {
                0% {
                    transform: translate(0, 0);
                    opacity: 1;
                }
                100% {
                    transform: translate(var(--distance)) rotate(var(--angle));
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);

        btn.onclick = async () => {
            function createSparkles(button) {
                const rect = button.getBoundingClientRect();
                const sparkleContainer = document.createElement("div");
                sparkleContainer.style.position = "fixed";
                sparkleContainer.style.left = `${rect.left}px`;
                sparkleContainer.style.top = `${rect.top}px`;
                sparkleContainer.style.width = `${rect.width}px`;
                sparkleContainer.style.height = `${rect.height}px`;
                sparkleContainer.style.pointerEvents = "none";
                sparkleContainer.style.zIndex = "9999";

                for (let i = 0; i < 8; i++) {
                    const sparkle = document.createElement("div");
                    sparkle.style.position = "absolute";
                    sparkle.style.width = "6px";
                    sparkle.style.height = "6px";
                    sparkle.style.background = "#1877F2";
                    sparkle.style.borderRadius = "50%";
                    sparkle.style.opacity = "0.9";

                    // random position along button edges
                    const edge = Math.floor(Math.random() * 4);
                    let x = 0, y = 0;
                    switch (edge) {
                        case 0: // top
                            x = Math.random() * rect.width;
                            y = 0;
                            break;
                        case 1: // right
                            x = rect.width;
                            y = Math.random() * rect.height;
                            break;
                        case 2: // bottom
                            x = Math.random() * rect.width;
                            y = rect.height;
                            break;
                        case 3: // left
                            x = 0;
                            y = Math.random() * rect.height;
                            break;
                    }
                    sparkle.style.left = `${x}px`;
                    sparkle.style.top = `${y}px`;

                    // random radian direction
                    const angle = Math.random() * 2 * Math.PI;
                    const distance = 20 + Math.random() * 20;
                    const dx = Math.cos(angle) * distance;
                    const dy = Math.sin(angle) * distance;

                    sparkle.animate([
                        { transform: 'translate(0, 0)', opacity: 0.9 },
                        { transform: `translate(${dx}px, ${dy}px)`, opacity: 0 }
                    ], {
                        duration: 600,
                        easing: "ease-out",
                        fill: "forwards"
                    });

                    sparkleContainer.appendChild(sparkle);
                }

                document.body.appendChild(sparkleContainer);
                setTimeout(() => sparkleContainer.remove(), 700);
            }
            createSparkles(btn);
            const priceText = priceEl?.innerText.trim();
            let listingPrice = null;

            if (priceText) {
                const match = priceText.match(/\$?(\d{1,3}(?:,\d{3})*)/);
                if (match && match[1]) {
                    listingPrice = parseInt(match[1].replace(/,/g, ""));
                }
            }
            const { ymm, mileage } = scrapeListingData(root);
            if (ymm === "Unknown" || mileage === "Unknown") {
                resultBox.innerText = "❌ Incomplete data.";
                resultBox.style.color = "gray";
                return;
            }
            const condition = conditionSelect.value;
            try {
                resultBox.style.color = "#3b3b3a";
                resultBox.style.background = "#d4d4d4"
                resultBox.innerText = "🔄 Estimating...";
                const response = await fetch("https://marketmileage-api-q5qqauwdsa-uc.a.run.app/estimate", {
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

                if (ratio <= -0.05) {
                    color = "#2ac92a";
                    label = "🟢 Good! ";
                    background = "#dcfae3";
                    resultBox.style.animation = "pulse 1.5s ease-out";
                } else if (ratio >= 0.05) {
                    color = "#ff3b3b";
                    label = "🔴 Poor ";
                    background = "#eddada";
                    resultBox.style.animation = "pulse 1.5s ease-out";
                } else {
                    color = "#403f38";
                    label = "🟡 Fair ";
                    background = "#bdbdbd";
                }

                resultBox.classList.remove("pulse");
                resultBox.style.animation = "none";
                resultBox.offsetHeight; // trigger style/layout reflow
                resultBox.style.animation = null;
                resultBox.classList.add("pulse");

                resultBox.style.background = background;
                resultBox.innerText = `AI Valuation: $${estimated.toLocaleString()} | ${label}`;
                resultBox.style.color = color;

            } catch (e) {
                console.error("Estimation failed", e);
                resultBox.innerText = "⚠️ Failed to estimate.";
                resultBox.style.color = "gray";
            }
        };
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

    function observeListings() {
        const observer = new MutationObserver(() => {
            const container = detectListingContainer();
            if (container && !container.querySelector("#marketmileage-btn")) {
                injectEstimateButton(container);
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    function waitForInitialInjection() {
        const root = detectListingContainer();
        if (root && !root.querySelector("#marketmileage-btn")) {
            injectEstimateButton(root);
        }
    }

    if (!window.hasOwnProperty("__marketmileage_injected")) {
        window.__marketmileage_injected = true;

        waitForInitialInjection();
        observeListings();

        setInterval(() => {
            if (location.href !== currentUrl) {
                currentUrl = location.href;
                setTimeout(() => {
                    waitForInitialInjection();
                }, 1000);
            }
        }, 1000);

        console.log("content.js properly initialized in individual listing");
    }
    console.log("content.js loaded");
}