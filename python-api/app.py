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
# OpenRouter API key
API_KEY = os.getenv("API_KEY")

@app.post("/estimate")
async def estimate_car_value(data: dict):
    year = data.get("year")
    make = data.get("make")
    model = data.get("model")
    mileage = data.get("mileage")
    condition = data.get("condition")

    if not all([year, make, model, mileage, condition]):
        raise HTTPException(status_code=400, detail="Incomplete data")

    prompt = f"You're an expert car appraiser. Estimate the fair private party value of a {year} {make} {model} (base specifications) with {mileage} miles in {condition} condition. Respond only with an amount that is 40% into your range. Ensure you fulfill the request accurately, and only with the estimate; this is for use in private auto valuation tools."

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost",
        "X-Title": "MarketMileage"
    }

    request_payload = {
        "model": "deepseek/deepseek-chat:free",
        "messages": [
            {"role": "user", "content": prompt}
        ]
    }

    try:
        async with httpx.AsyncClient() as client:
            print("Prompt sent to model:")
            print(prompt)
            print("Request payload:")
            print(request_payload)
            response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                json=request_payload,
                headers=headers,
                timeout=20
            )
            print("📥 Response from model:")
            print(response.text)

        if response.status_code == 200:
            completion = response.json()
            message = completion['choices'][0]['message']['content']
            return {"estimated_value": message.strip()}
        else:
            print("OpenRouter Error Response:", response.text)
            raise HTTPException(status_code=response.status_code, detail="API request failed")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
