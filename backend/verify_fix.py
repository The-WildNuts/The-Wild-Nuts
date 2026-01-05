
import sheets
try:
    client = sheets.get_sheets_client()
    spreadsheet = client.open_by_key(sheets.SHEET_ID)
    sheet = spreadsheet.worksheet("Users")
    records = sheet.get_all_records()
    print(f"Total Records: {len(records)}")
    if len(records) > 0:
        print(f"Row 2 Email: '{records[0].get('Email')}'")
except Exception as e:
    print(e)
