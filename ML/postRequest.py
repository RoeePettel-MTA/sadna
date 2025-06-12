import requests

url = "https://ml-api-233454991563.us-central1.run.app/predict"
data = {
    "features": [110, 0.58, 0.62]
}

response = requests.post(url, json=data)
print(response.json())
