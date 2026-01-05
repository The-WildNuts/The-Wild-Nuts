
import sheets
import re

print("\n--- FIXING USERS EMAILS ---")

try:
    client = sheets.get_sheets_client()
    spreadsheet = client.open_by_key(sheets.SHEET_ID)
    sheet = spreadsheet.worksheet("Users")
    
    records = sheet.get_all_records()
    print(f"Total Records: {len(records)}")
    
    updates_made = 0
    
    for i, r in enumerate(records):
        raw_email = str(r.get('Email', '')).strip()
        idx = i + 2 # Header is row 1, records start row 2
        
        # Check for .com.com typo
        if raw_email.endswith('.com.com'):
            clean_email = raw_email[:-4] # Remove last .com
            print(f"Found typo: '{raw_email}' at row {idx}. Fixing to '{clean_email}'...")
            sheet.update_cell(idx, 1, clean_email)
            updates_made += 1
        elif raw_email.endswith('@gmail.com.com'): # Specific case seen
             clean_email = raw_email.replace('@gmail.com.com', '@gmail.com')
             print(f"Found specific typo: '{raw_email}' at row {idx}. Fixing to '{clean_email}'...")
             sheet.update_cell(idx, 1, clean_email)
             updates_made += 1
        elif raw_email == 'ragul': # If strictly just name
             # This is risky unless we know the domain, but per conversation context...
             print(f"Found 'ragul' as email. Leaving it alone as we don't know the domain for sure, or it's a test user.")
        
    if updates_made == 0:
        print("No obvious typos found to fix.")
    else:
        print(f"Fixed {updates_made} typos.")

except Exception as e:
    print(f"ERROR: {e}")
