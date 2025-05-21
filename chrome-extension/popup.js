document.getElementById("estimateButton").addEventListener("click", async () => {
    // handles ui interactions
    // send message to content.js to scrape data
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: "scrapeData" }, async (response) => {
            if (chrome.runtime.lastError || !response || Object.values(response).includes("Unknown")) {
                console.warn("Failed to scrape:", response);
                document.getElementById("result").innerText = "Incomplete listing — scraping failed. Please check the page.";
                return;
            }

            // get user input condition
            const userCondition = document.getElementById("condition").value;
            const apiBody = {
                ymm: response.ymm,
                mileage: response.mileage,
                condition: userCondition
            };

            document.getElementById("result").innerText = "Estimating value...";

            try {
                const apiResponse = await fetch("https://marketmileage-production.up.railway.app/estimate", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(response)
                });

                if (!apiResponse.ok) {
                    const errorText = await apiResponse.text();
                    throw new Error("Server error: " + errorText);
                }

                const result = await apiResponse.json();
                document.getElementById("result").innerText =
                    `Estimated Value: ${result.estimated_value}`;
            } catch (err) {
                console.error(err);
                document.getElementById("result").innerText =
                    "Error contacting valuation server. Maybe try again?";
            }
        });
    });
});
