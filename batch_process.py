import pandas as pd
import requests
import time
import os

# -----------------------------
# CONFIG
# -----------------------------
INPUT_CSV = "raw_sensor_data.csv"        # your raw CSV
OUTPUT_CSV = "processed_data.csv"        # final processed file
API_URL = "http://127.0.0.1:8000/predict"
CHUNK_SIZE = 500                          # number of rows per batch
WAIT_BETWEEN_REQUESTS = 0.05             # optional delay between requests (seconds)

# If output file exists from previous run, remove it
if os.path.exists(OUTPUT_CSV):
    os.remove(OUTPUT_CSV)

# -----------------------------
# BATCH PROCESSING
# -----------------------------
for chunk in pd.read_csv(INPUT_CSV, chunksize=CHUNK_SIZE):
    predictions = []

    for _, row in chunk.iterrows():
        payload = {
            "co_raw": row["co_raw"],
            "co_conv_linear_ppm": 0,   # optional, adjust if needed
            "no2_raw": row["no2_raw"],
            "no2_mv": row["no2_mv"],
            "pm25_raw": row["pm25_raw"],
            "pm10_raw": row["pm10_raw"],
            "temperature": row["temperature"],
            "humidity": row["humidity"],
            "timestamp": str(row["timestamp"])
        }

        try:
            response = requests.post(API_URL, json=payload)
            response.raise_for_status()
            pred = response.json()
        except Exception as e:
            print(f"[!] Error on reading_id {row.get('reading_id', '-')}: {e}")
            pred = {"co": None, "pm25": None, "pm10": None}

        # Combine original row with prediction
        pred_row = row.to_dict()
        pred_row.update(pred)
        predictions.append(pred_row)

        time.sleep(WAIT_BETWEEN_REQUESTS)

    # Append predictions to CSV immediately
    pd.DataFrame(predictions).to_csv(OUTPUT_CSV, mode='a', index=False, header=not os.path.exists(OUTPUT_CSV))

    print(f"✅ Processed {len(chunk)} rows. Appended to {OUTPUT_CSV}")

print("🎉 All batches processed!")
