from sheets import get_sheet_data
import json

print("Fetching keys from Master sheet...")
try:
    data = get_sheet_data("Master")
    if data:
        print(f"Found {len(data)} rows. Keys:")
        for k in data[0].keys():
            print(f"- {k}")
    else:
        print("Master sheet returned no data.")
except Exception as e:
    print(f"Error: {e}")
