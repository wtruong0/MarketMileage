import requests

url = "http://127.0.0.1:8000/estimate"

car_data = {
    "year": "2018",
    "make": "Honda",
    "model": "Civic",
    "mileage": "50000",
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