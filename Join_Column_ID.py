import pandas as pd
import json

# --- 1. Process CSV ---
csv_df = pd.read_csv("Puerto_Rico_2024_Modified_v3.csv")

# Create Join_ID by combining Precinct and Unit IDs
csv_df['Join_ID'] = csv_df['Precinct_Digits'].astype(str) + "_" + csv_df['Unit_ID'].astype(str)

# Save Modified CSV
csv_df.to_csv("Puerto_Rico_2024_Modified_v3_with_JoinKey.csv", index=False)
print("Saved CSV with Join_ID")

# --- 2. Process GeoJSON ---
with open("voting_districts.geojson", "r") as f:
    geojson_data = json.load(f)

def create_geojson_key(vtdst):
    """
    Parses VTDST20 (e.g., '0070.5') into '70_5'
    """
    if not isinstance(vtdst, str) or '.' not in vtdst:
        return None
    try:
        parts = vtdst.split('.')
        precinct = int(parts[0]) # Strips leading zeros
        unit = int(parts[1])
        return f"{precinct}_{unit}"
    except ValueError:
        return None

# Iterate and add property
for feature in geojson_data['features']:
    props = feature['properties']
    vtdst = props.get('VTDST20')
    props['Join_ID'] = create_geojson_key(vtdst)

# Save Modified GeoJSON
with open("voting_districts_with_JoinKey.geojson", "w") as f:
    json.dump(geojson_data, f)
print("Saved GeoJSON with Join_ID")
