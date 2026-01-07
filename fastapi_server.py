# fastapi_server.py
from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import pandas as pd
import numpy as np
import os

# -----------------------------
# 0) App instance
# -----------------------------
app = FastAPI(
    title="Air Quality Correction API",
    version="0.1.0"
)

# -----------------------------
# 1) Load models
# -----------------------------
MODEL_DIR = "fastapi_model"

rf_co = joblib.load(os.path.join(MODEL_DIR, "rf_co_model.joblib"))
rf_pm25 = joblib.load(os.path.join(MODEL_DIR, "rf_pm25_model.joblib"))
rf_pm10 = joblib.load(os.path.join(MODEL_DIR, "rf_pm10_model.joblib"))

# -----------------------------
# 2) Define request schema
# -----------------------------
class SensorReading(BaseModel):
    co_raw: float
    co_conv_linear_ppm: float  # can ignore, will recalc
    no2_raw: float
    no2_mv: float
    pm25_raw: float
    pm10_raw: float
    temperature: float
    humidity: float
    timestamp: str  # ISO format: "YYYY-MM-DD HH:MM:SS"

# -----------------------------
# 3) Preprocessing function
# -----------------------------
def preprocess_input(data_json):
    timestamp = pd.to_datetime(data_json['timestamp'])
    # Example MQ-7 CO conversion: adjust if your calibration changes
    S_co = 0.02
    Vbaseline_co = 0.2
    co_conv_ppm = (data_json['co_raw'] - Vbaseline_co) / S_co

    df = pd.DataFrame({
        'co_raw': [data_json['co_raw']],
        'co_conv_ppm': [co_conv_ppm],
        'no2_raw': [data_json['no2_raw']],
        'no2_mv': [data_json['no2_mv']],
        'no2_mv_log': [np.log1p(data_json['no2_mv'])],
        'pm25_raw': [data_json['pm25_raw']],
        'pm10_raw': [data_json['pm10_raw']],
        'temperature': [data_json['temperature']],
        'humidity': [data_json['humidity']],
        'hour': [timestamp.hour],
        'dayofweek': [timestamp.dayofweek]
    })

    return df

# -----------------------------
# 4) Prediction endpoint
# -----------------------------
@app.post("/predict")
def predict(sensor: SensorReading):
    try:
        df = preprocess_input(sensor.dict())

        co_pred = rf_co.predict(df)[0]
        pm25_pred = rf_pm25.predict(df)[0]
        pm10_pred = rf_pm10.predict(df)[0]

        return {
            "co": co_pred,
            "pm25": pm25_pred,
            "pm10": pm10_pred
        }

    except Exception as e:
        print("❌ PREDICTION ERROR:", e)
        return {"error": str(e)}

# -----------------------------
# 5) Root endpoint
# -----------------------------
@app.get("/")
def root():
    return {"message": "Air Quality Correction API is running!"}
