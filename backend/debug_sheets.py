import gspread
from oauth2client.service_account import ServiceAccountCredentials
import json
import os

# Google Sheets Setup
SHEET_ID = "1Ynl2Z_55tbjIsoGX5rY884tdanb2--TjRGnaKstzQLw"
CREDENTIALS_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".env"))

def debug_sheets():
    try:
        scope = ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/drive"]
        with open(CREDENTIALS_PATH, 'r') as f:
            creds_dict = json.load(f)
        creds = ServiceAccountCredentials.from_json_keyfile_dict(creds_dict, scope)
        client = gspread.authorize(creds)
        
        spreadsheet = client.open_by_key(SHEET_ID)
        worksheets = spreadsheet.worksheets()
        print("Available Worksheets:")
        for ws in worksheets:
            print(f"- {ws.title}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    debug_sheets()
