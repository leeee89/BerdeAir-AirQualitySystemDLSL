# fastapi_server.py
from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import numpy as np
import pandas as pd
import os

app = FastAPI(title="Air Quality Correction API")

# Ensure paths work on Render
BASE_DIR = os.path.dirname(__file__)

# Load models
rf_co = joblib.load(os.path.join(BASE_DIR, "rf_co_model.joblib"))
rf_pm25 = joblib.load(os.path.join(BASE_DIR, "rf_pm25_model.joblib"))
rf_pm10 = joblib.load(os.path.join(BASE_DIR, "rf_pm10_model.joblib"))

class SensorReading(BaseModel):
    co_raw: float
    co_conv_linear_ppm: float = 0.0
    no2_raw: float = 0.0
    no2_mv: float = 0.0
    pm25_raw: float
    pm10_raw: float
    temperature: float
    humidity: float
    timestamp: str

@app.post("/predict")
def predict(reading: SensorReading):
    # Convert timestamp to hour and day
    ts = pd.to_datetime(reading.timestamp)
    hour = ts.hour
    dayofweek = ts.dayofweek
    no2_mv_log = np.log1p(reading.no2_mv)

    # Prepare features in the same order as training
    features = [
        reading.co_raw,
        reading.co_conv_linear_ppm,
        reading.no2_raw,
        reading.no2_mv,
        no2_mv_log,
        reading.pm25_raw,
        reading.pm10_raw,
        reading.temperature,
        reading.humidity,
        hour,
        dayofweek
    ]

    # Predict
    co_pred = rf_co.predict([features])[0]
    pm25_pred = rf_pm25.predict([features])[0]
    pm10_pred = rf_pm10.predict([features])[0]

    return {
        "co_ppm": float(co_pred),
        "pm25": float(pm25_pred),
        "pm10": float(pm10_pred)
    }

@app.get("/")
def root():
    return {"message": "Air Quality Prediction API is running!"}
