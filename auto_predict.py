import requests
import pandas as pd
from datetime import datetime

# -----------------------------
# CONFIG
# -----------------------------
API_URL = "http://127.0.0.1:8000/predict"   # FastAPI endpoint
INPUT_CSV = "sensor_data.csv"               # Your input sensor CSV
OUTPUT_CSV = "predictions.csv"              # Where predictions will be saved

# -----------------------------
# LOAD SENSOR DATA
# -----------------------------
df = pd.read_csv(INPUT_CSV)

# Make sure timestamp is string
if 'timestamp' in df.columns:
    df['timestamp'] = df['timestamp'].astype(str)
else:
    # If your CSV doesn't have timestamps, add current time
    df['timestamp'] = datetime.now().isoformat()

# -----------------------------
# SEND DATA TO API
# -----------------------------
results = []

for idx, row in df.iterrows():
    payload = row.to_dict()
    
    try:
        response = requests.post(API_URL, json=payload)
        if response.status_code == 200:
            pred = response.json()
            results.append({**payload, **pred})
            print(f"[{idx}] Success:", pred)
        else:
            print(f"[{idx}] Error {response.status_code}:", response.text)
            results.append({**payload, "error": response.text})
    except Exception as e:
        print(f"[{idx}] Exception:", e)
        results.append({**payload, "error": str(e)})

# -----------------------------
# SAVE RESULTS
# -----------------------------
results_df = pd.DataFrame(results)
results_df.to_csv(OUTPUT_CSV, index=False)
print(f"✅ Predictions saved to {OUTPUT_CSV}")
