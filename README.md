# MarketMileage 🔍🚗

**MarketMileage** is a lightweight Chrome extension that uses Gemini 3.5 Flash to estimate fair private-party car values within Facebook Marketplace listings.

---

## 🚀 Features
- ✅ Automatically scrapes listing details (YMM, mileage, listing price)
- 🧠 Condition dropdown for user-defined tuning
- 🤖 Uses a Gemini API to provide fast price estimations
- 🟢 Color-coded labels: Valued as [Good / Fair / Poor]
- 📍 Embedded UI: No popup required, an inline overlay

---

## 🛠 How to Install & Use

1. [Download the extension folder](https://drive.google.com/uc?export=download&id=1UEzqDddQZyFUYpp_xOmvHxI3qTnWD-4N).
2. Extract the **chrome-extension** folder from inside **MarketMileage.zip** that you just downloaded.
3. Open Chrome and navigate to`chrome://extensions`, or find the Extensions page in settings.
4. Enable **Developer Mode** (via toggle bar in the top right).
5. Click **"Load unpacked"** and select the **"chrome-extension"** folder you just extracted.
6. Navigate to any **Facebook Marketplace** car listing.
7. Click **"Estimate with AI 🤖"** next to the price — and enjoy using MarketMileage!


[**Click here for a Full Tutorial**](https://youtu.be/cY7Afdfjq6U)

---

## 📷 How It Works
Once installed, MarketMileage embeds directly into Facebook Marketplace listings.

It:
- Scrapes the listing title and mileage
- Sends that data to an AI valuation backend
- Returns a fair estimate with deal quality related to the actual listing price

---

## 🔧 Tech Stack
- Chrome Extensions platform (Manifest v3)
- JavaScript Document Object Module (DOM) injection
- Python FastAPI backend
  - Server-side hosting through Google Cloud Run
- Gemini Flash 3.5 Model integration

---

## 📎 Links
- [🔗 Original GitHub Repository](https://github.com/wtruong0/MarketMileage)
- [📇 LinkedIn](https://www.linkedin.com/in/truongw)

---

## ✍️ Credits
Created by **Will Truong**
Feel free to notify me by email at willtruong0@gmail.com if you find new issues. As of 7/11/2026, I had to revive the project through lots of trial and error with new backend hosts and model providers. The current Gemini model is ~2 seconds slower, but is quite accurate in my testing so far.
Licensed under MIT
