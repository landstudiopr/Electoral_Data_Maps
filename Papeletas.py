import pandas as pd
import re

# 1. Load Data
df = pd.read_csv("Puerto_Rico_2024_Modified_v3_with_JoinKey.csv")

# 2. Sanitize Filename Function
def sanitize_filename(name):
    name = re.sub(r'[^\w\s-]', '', name).strip().lower()
    return re.sub(r'[-\s]+', '_', name)

# 3. Process Each Position
for position in df['Position'].unique():
    print(f"Creating file for: {position}")

    # Filter by position
    pos_df = df[df['Position'] == position].copy()

    # Create unique column headers (Party_Candidate)
    pos_df['Col_Header'] = pos_df['Party'].astype(str) + "_" + pos_df['Candidate'].astype(str)

    # Pivot to Wide Format
    # Index = Map Geometries, Columns = Candidates, Values = Votes
    pivot_df = pos_df.pivot_table(
        index=['Join_ID', 'Precinct_Digits', 'Unit_ID', 'Town_Name', 'Precinct_Name'],
        columns='Col_Header',
        values='Votes',
        aggfunc='sum',
        fill_value=0
    )

    # Reset index to flatten the file
    pivot_df = pivot_df.reset_index()

    # Add Total Votes Column (Sum of all candidate columns)
    candidate_cols = [c for c in pivot_df.columns if c not in ['Join_ID', 'Precinct_Digits', 'Unit_ID', 'Town_Name', 'Precinct_Name']]
    pivot_df['Total_Votes'] = pivot_df[candidate_cols].sum(axis=1)

    # Save to CSV
    filename = f"Results_{sanitize_filename(position)}.csv"
    pivot_df.to_csv(filename, index=False)
