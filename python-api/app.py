from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import httpx
import os
from dotenv import load_dotenv

# load environment variables from .env file
load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Gemini API configuration
API_KEY = os.getenv("GEMINI_API_KEY")
MODEL = os.getenv("GEMINI_MODEL", "gemini-3.5-flash")

@app.post("/estimate")
async def estimate_car_value(data: dict):
    ymm = data.get("ymm")
    mileage = data.get("mileage")
    condition = data.get("condition")

    if any(val in [None, "", "unknown", "Unknown"] for val in [ymm, mileage]):
        raise HTTPException(status_code=400, detail="Scraped data is incomplete or invalid.")

    prompt = f"You're an expert car appraiser. Estimate the fair private party sale value of a {ymm} (lean towards base specifications) with {mileage} miles in {condition} condition. Respond only with an amount that is 50% into your range. Ensure your accuracy, and respond only with the numerical estimate; this is for use in private auto valuation tools."

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }

    request_payload = {
        "model": MODEL,
        "messages": [
            {"role": "user", "content": prompt}
        ]
    }

    try:
        print("Prompt sent to model:", prompt)
        print("Request payload:", request_payload)
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
                json=request_payload,
                headers=headers,
                timeout=20
            )
        print("📥 Response from model:", response.text)

        if response.status_code == 200:
            completion = response.json()
            message = completion['choices'][0]['message']['content']
            return {"estimated_value": message.strip()}
        else:
            print("Gemini Error Response:", response.text)
            raise HTTPException(status_code=response.status_code, detail="API request failed")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def healthcheck():
    return {"status": "ok"}