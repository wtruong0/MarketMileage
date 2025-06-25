import requests

url = "http://127.0.0.1:8000/estimate"

car_data = {
    "ymm": "2020 Toyota Camry",
    "mileage": "71364",
    "condition": "good"
}

try:
    response = requests.post(url, json=car_data)
    response.raise_for_status()
    result = response.json()
    print("Estimated value received:")
    print(result)
except requests.exceptions.RequestException as e:
    print("API call failed:")
    print(e)