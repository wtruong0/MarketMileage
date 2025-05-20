from fastapi import FastAPI, HTTPException
import httpx
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = FastAPI()

# OpenRouter API key
LLAMA_API_KEY = os.getenv("LLAMA_API_KEY")

@app.post("/estimate")
async def estimate_car_value(data: dict):
    year = data.get("year")
    make = data.get("make")
    model = data.get("model")
    mileage = data.get("mileage")
    condition = data.get("condition")

    if not all([year, make, model, mileage, condition]):
        raise HTTPException(status_code=400, detail="Incomplete data")

    prompt = f"Quickly and accurately estimate the value of a {year} {make} {model} with {mileage} miles in {condition} condition. Provide a dollar estimate only."

    headers = {
        "Authorization": f"Bearer {LLAMA_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost",
        "X-Title": "MarketMileage"
    }

    request_payload = {
        "model": "deepseek/deepseek-r1-distill-llama-70b:free",
        "messages": [
            {"role": "user", "content": prompt}
        ]
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                json=request_payload,
                headers=headers,
                timeout=20
            )

        if response.status_code == 200:
            completion = response.json()
            message = completion['choices'][0]['message']['content']
            return {"estimated_value": message.strip()}
        else:
            print("OpenRouter Error Response:", response.text)
            raise HTTPException(status_code=response.status_code, detail="API request failed")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
