
import sheets
import json

print("--- DEBUGGING USERS SHEET ---")

try:
    client = sheets.get_sheets_client()
    spreadsheet = client.open_by_key(sheets.SHEET_ID)
    sheet = spreadsheet.worksheet("Users")
    
    # 1. Print Raw Headers
    print("\n[1] Raw Rows (First 2):")
    all_values = sheet.get_all_values()
    if len(all_values) > 0:
        print(f"Header Row: {all_values[0]}")
    if len(all_values) > 1:
        print(f"First Data Row: {all_values[1]}")
        
    # 2. Print Records (gspread parsing)
    print("\n[2] get_all_records() output (First 2):")
    records = sheet.get_all_records()
    for i, r in enumerate(records[:2]):
        print(f"Record {i}: {r}")

    # 3. Test exact match logic
    print("\n[3] Testing get_user_by_email logic:")
    if len(records) > 0:
        # Pick an email from the records to test
        test_email = str(records[0].get('Email', '')).strip()
        if not test_email and 'email' in records[0]:
             test_email = str(records[0].get('email', '')).strip()
             
        print(f"Testing find for email: '{test_email}'")
        user = sheets.get_user_by_email(test_email)
        if user:
            print(f"SUCCESS: Found user: {user['email']}")
        else:
            print(f"FAILURE: Could not find user '{test_email}' using sheets.get_user_by_email")

except Exception as e:
    print(f"CRITICAL ERROR: {e}")
