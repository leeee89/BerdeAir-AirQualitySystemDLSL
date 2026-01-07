import joblib
import pandas as pd

# ---- Load models ----
rf_co = joblib.load("fastapi_model/rf_co_model.joblib")
rf_pm25 = joblib.load("fastapi_model/rf_pm25_model.joblib")
rf_pm10 = joblib.load("fastapi_model/rf_pm10_model.joblib")

# ---- Print expected features ----
print("\n=== MODEL FEATURE CHECK ===")

print("CO model features:")
print(rf_co.feature_names_in_)

print("\nPM2.5 model features:")
print(rf_pm25.feature_names_in_)

print("\nPM10 model features:")
print(rf_pm10.feature_names_in_)
