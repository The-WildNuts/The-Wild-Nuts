
import sheets
import json

print("\n--- DEBUGGING USERS SHEET V2 ---")

try:
    client = sheets.get_sheets_client()
    spreadsheet = client.open_by_key(sheets.SHEET_ID)
    sheet = spreadsheet.worksheet("Users")
    
    records = sheet.get_all_records()
    print(f"Total Records: {len(records)}")
    
    print("\n[ROW DUMP]")
    print(f"{'Idx':<4} | {'Email (Raw)':<30} | {'Email (Stripped/Lower)':<30} | {'Username'}")
    print("-" * 80)
    
    for i, r in enumerate(records):
        raw_email = str(r.get('Email', ''))
        processed = raw_email.lower().strip()
        username = str(r.get('Username', ''))
        print(f"{i:<4} | {raw_email:<30} | {processed:<30} | {username}")

except Exception as e:
    print(f"ERROR: {e}")
