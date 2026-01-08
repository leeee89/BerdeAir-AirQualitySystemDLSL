import pandas as pd

INPUT_CSV = "processed_data.csv"   # your existing CSV file
OUTPUT_CSV = "cleaned_predictions.csv"

# Load CSV
df = pd.read_csv(INPUT_CSV)

# Required columns we keep
keep_cols = ["timestamp", "co", "pm25", "pm10","device_id"]

# Filter only these columns if they exist
cleaned_df = df[[col for col in keep_cols if col in df.columns]]

# Save cleaned CSV
cleaned_df.to_csv(OUTPUT_CSV, index=False)

print(f"✅ Cleaned CSV saved as '{OUTPUT_CSV}'")
print(f"Remaining columns: {list(cleaned_df.columns)}")
