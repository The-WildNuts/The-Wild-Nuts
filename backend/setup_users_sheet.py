import sheets
import gspread

def setup_users_sheet():
    print("Checking for 'Users' sheet...")
    client = sheets.get_sheets_client()
    # HACK: Access the private creds to print the email for the user
    import json
    with open(sheets.CREDENTIALS_PATH, 'r') as f:
        creds = json.load(f)
    print(f"\nIMPORTANT: Please share the Google Sheet with this email:\n   {creds['client_email']}\n")
    
    spreadsheet = client.open_by_key(sheets.SHEET_ID)
    
    try:
        sheet = spreadsheet.worksheet("Users")
        print(" 'Users' sheet already exists.")
        print(f" Headers: {sheet.row_values(1)}")
    except gspread.WorksheetNotFound:
        print(" 'Users' sheet NOT found. Creating it...")
        sheet = spreadsheet.add_worksheet(title="Users", rows=100, cols=10)
        # Add headers
        headers = ['Email', 'Password', 'Name', 'Phone', 'JoinedAt', 'LastLogin']
        sheet.append_row(headers)
        print(" 'Users' sheet created successfully with headers.")
    except Exception as e:
        print(f"Error checking/creating sheet: {e}")

if __name__ == "__main__":
    setup_users_sheet()
