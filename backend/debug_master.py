import gspread
from oauth2client.service_account import ServiceAccountCredentials
import json
import os

# Google Sheets Setup
SHEET_ID = "1Ynl2Z_55tbjIsoGX5rY884tdanb2--TjRGnaKstzQLw"
CREDENTIALS_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".env"))

def debug_master():
    try:
        scope = ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/drive"]
        with open(CREDENTIALS_PATH, 'r') as f:
            creds_dict = json.load(f)
        creds = ServiceAccountCredentials.from_json_keyfile_dict(creds_dict, scope)
        client = gspread.authorize(creds)
        
        spreadsheet = client.open_by_key(SHEET_ID)
        sheet = spreadsheet.worksheet("Master")
        records = sheet.get_all_records()
        print(f"Master sheet row count: {len(records)}")
        if records:
            print("First row keys:", list(records[0].keys()))
            print("First row data:", records[0])
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    debug_master()
