import gspread
from oauth2client.service_account import ServiceAccountCredentials
import os

SHEET_ID = "1Ynl2Z_55tbjIsoGX5rY884tdanb2--TjRGnaKstzQLw"
CREDENTIALS_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".env"))

scope = ['https://spreadsheets.google.com/feeds', 'https://www.googleapis.com/auth/drive']
creds = ServiceAccountCredentials.from_json_keyfile_name(CREDENTIALS_PATH, scope)
client = gspread.authorize(creds)
spreadsheet = client.open_by_key(SHEET_ID)

print("Available worksheets:")
for sheet in spreadsheet.worksheets():
    print(f"  - '{sheet.title}'")
