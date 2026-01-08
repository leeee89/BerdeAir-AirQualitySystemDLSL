import requests
import pandas as pd
from datetime import datetime
from supabase import create_client
from dotenv import load_dotenv
import os

# -----------------------------
# LOAD ENV + SUPABASE
# -----------------------------
load_dotenv()

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_ROLE_KEY")
)

# -----------------------------
# CONFIG
# -----------------------------
API_URL = "http://127.0.0.1:8000/predict"
INPUT_CSV = "sensor_data.csv"
OUTPUT_CSV = "predictions.csv"

# -----------------------------
# LOAD SENSOR DATA
# -----------------------------
df = pd.read_csv(INPUT_CSV)

# Ensure timestamp exists
if "timestamp" not in df.columns:
    df["timestamp"] = datetime.now().isoformat()

df["timestamp"] = df["timestamp"].astype(str)

# -----------------------------
# SEND DATA TO API + SUPABASE
# -----------------------------
results = []

for idx, row in df.iterrows():
    payload = row.to_dict()

    try:
        response = requests.post(API_URL, json=payload)

        if response.status_code == 200:
            pred = response.json()

            # Save locally
            combined = {**payload, **pred}
            results.append(combined)

            print(f"[{idx}] Success:", pred)

            # ⬇⬇⬇ INSERT INTO SUPABASE ⬇⬇⬇
            supabase.table("ml_predictions").insert({
                "timestamp": payload["timestamp"],
                "co": pred.get("co"),
                "pm25": pred.get("pm25"),
                "pm10": pred.get("pm10"),
                "source": "local_ml"
            }).execute()

        else:
            print(f"[{idx}] API Error {response.status_code}:", response.text)
            results.append({**payload, "error": response.text})

    except Exception as e:
        print(f"[{idx}] Exception:", e)
        results.append({**payload, "error": str(e)})

# -----------------------------
# SAVE RESULTS LOCALLY
# -----------------------------
results_df = pd.DataFrame(results)
results_df.to_csv(OUTPUT_CSV, index=False)
print(f"✅ Predictions saved to {OUTPUT_CSV}")
print("✅ Predictions inserted into Supabase")
