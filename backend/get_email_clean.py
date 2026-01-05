import sheets
import json
with open(sheets.CREDENTIALS_PATH, 'r') as f:
    c = json.load(f)
print("---START---")
print(c['client_email'])
print("---END---")
