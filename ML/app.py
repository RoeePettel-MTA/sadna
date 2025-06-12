from flask import Flask, request, jsonify
import joblib
import pandas as pd
import os

app = Flask(__name__)
model = joblib.load("model.pkl")

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()
        
        # נבנה DataFrame מה־features עם שמות העמודות
        input_df = pd.DataFrame([data["features"]])
        
        prediction = model.predict(input_df)
        return jsonify({"prediction": int(prediction[0])})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port)
