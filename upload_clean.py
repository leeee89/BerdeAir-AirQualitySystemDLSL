import pandas as pd
from supabase import create_client
from dotenv import load_dotenv
import os
from datetime import datetime

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
INPUT_CSV = "cleaned_predictions.csv"
TABLE_NAME = "ml_predictions"

# -----------------------------
# LOAD CLEANED CSV
# -----------------------------
df = pd.read_csv(INPUT_CSV)

# Required columns check
required_cols = {"timestamp", "co", "pm25", "pm10","device_id"}
missing = required_cols - set(df.columns)
if missing:
    raise Exception(f"CSV missing required columns: {missing}")

# Convert timestamp to string (just in case)
df["timestamp"] = df["timestamp"].astype(str)

# -----------------------------
# UPLOAD TO SUPABASE
# -----------------------------
for idx, row in df.iterrows():
    record = {
        "timestamp": row["timestamp"],
        "co": row["co"],
        "pm25": row["pm25"],
        "pm10": row["pm10"],
        "source": "batch_upload"
    }

    try:
        supabase.table(TABLE_NAME).insert(record).execute()
        print(f"[{idx}] Inserted:", record)
    except Exception as e:
        print(f"[{idx}] Insert Error:", e)

print("✅ Finished uploading cleaned data to Supabase!")
