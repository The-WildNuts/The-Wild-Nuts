"""
Debug script to check the actual column names in the Master sheet
"""
import sys
sys.path.append('.')
from sheets import get_sheet_data

# Get raw data from Master sheet
data = get_sheet_data("Master")

if data and len(data) > 0:
    print("Column names in Master sheet:")
    print(list(data[0].keys()))
    
    print("\n\nFirst row data:")
    for key, value in data[0].items():
        print(f"{key}: {value}")
else:
    print("No data found in Master sheet")
