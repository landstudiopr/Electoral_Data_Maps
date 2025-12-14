import pandas as pd

# Load the file
df = pd.read_csv("Results_gobernador.csv")

# 1. Identify Candidate Columns automatically
# We exclude metadata and the existing Total_Votes column
metadata_cols = ['Join_ID', 'Precinct_Digits', 'Unit_ID', 'Town_Name', 'Precinct_Name', 'Total_Votes']
candidates = [c for c in df.columns if c not in metadata_cols]

# 2. Determine the Winner
# Finds the column with the highest votes for each row
df['Winner_Column'] = df[candidates].idxmax(axis=1)

# Extract just the Party Name (e.g., "PNP_JGC" -> "PNP")
df['Winner_Party'] = df['Winner_Column'].apply(lambda x: x.split('_')[0] if isinstance(x, str) else "No Votes")

# 3. Calculate Percentages
for cand in candidates:
    pct_col = f"{cand}_PCT"
    # Calculate %, handle division by zero, round to 2 decimals
    df[pct_col] = ((df[cand] / df['Total_Votes']).fillna(0) * 100).round(2)

# Save the new file
df.to_csv("Results_gobernador_Calculated.csv", index=False)
print("File created: Results_gobernador_Calculated.csv")
