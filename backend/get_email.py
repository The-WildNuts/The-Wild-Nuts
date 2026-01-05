import sheets
import json
try:
    with open(sheets.CREDENTIALS_PATH, 'r') as f:
        creds = json.load(f)
    print(f"EMAIL:{creds['client_email']}")
except Exception as e:
    print(e)
