"""
Google Sheets Setup Script for Authentication System
This script creates the required sheets with correct column headers
"""

import gspread
from oauth2client.service_account import ServiceAccountCredentials
import json
import os

# Google Sheets Setup
SHEET_ID = "1Ynl2Z_55tbjIsoGX5rY884tdanb2--TjRGnaKstzQLw"
CREDENTIALS_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".env"))

def get_sheets_client():
    scope = ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/drive"]
    with open(CREDENTIALS_PATH, 'r') as f:
        creds_dict = json.load(f)
    creds = ServiceAccountCredentials.from_json_keyfile_dict(creds_dict, scope)
    client = gspread.authorize(creds)
    return client

def setup_users_sheet():
    """Create or update Users sheet with correct headers"""
    print("\n" + "="*60)
    print("Setting up Users Sheet")
    print("="*60)
    
    client = get_sheets_client()
    spreadsheet = client.open_by_key(SHEET_ID)
    
    # Try to get existing sheet or create new one
    try:
        sheet = spreadsheet.worksheet("Users")
        print("✓ Found existing 'Users' sheet")
        
        # Check if it has data
        all_values = sheet.get_all_values()
        if len(all_values) > 1:
            print(f"⚠ Sheet has {len(all_values)-1} existing rows")
            response = input("Do you want to keep existing data? (y/n): ")
            if response.lower() != 'y':
                sheet.clear()
                print("✓ Cleared existing data")
        else:
            sheet.clear()
            
    except:
        print("✗ 'Users' sheet not found, creating new one...")
        sheet = spreadsheet.add_worksheet(title="Users", rows="1000", cols="13")
        print("✓ Created 'Users' sheet")
    
    # Set headers
    headers = [
        "Email",
        "Username", 
        "Password_Hash",
        "Full_Name",
        "Phone",
        "Address",
        "City",
        "State",
        "Pincode",
        "Created_At",
        "Last_Login",
        "Session_Token",
        "Profile_Complete"
    ]
    
    sheet.update('A1:M1', [headers])
    print(f"✓ Set headers: {', '.join(headers)}")
    
    # Format header row
    sheet.format('A1:M1', {
        "backgroundColor": {"red": 0.36, "green": 0.17, "blue": 0.10},
        "textFormat": {"foregroundColor": {"red": 1, "green": 1, "blue": 1}, "bold": True},
        "horizontalAlignment": "CENTER"
    })
    print("✓ Formatted header row")
    
    return sheet

def setup_otp_codes_sheet():
    """Create or update OTP_Codes sheet with correct headers"""
    print("\n" + "="*60)
    print("Setting up OTP_Codes Sheet")
    print("="*60)
    
    client = get_sheets_client()
    spreadsheet = client.open_by_key(SHEET_ID)
    
    try:
        sheet = spreadsheet.worksheet("OTP_Codes")
        print("✓ Found existing 'OTP_Codes' sheet")
        sheet.clear()
    except:
        print("✗ 'OTP_Codes' sheet not found, creating new one...")
        sheet = spreadsheet.add_worksheet(title="OTP_Codes", rows="1000", cols="5")
        print("✓ Created 'OTP_Codes' sheet")
    
    # Set headers
    headers = [
        "Email",
        "OTP_Code",
        "Created_At",
        "Expires_At",
        "Used"
    ]
    
    sheet.update('A1:E1', [headers])
    print(f"✓ Set headers: {', '.join(headers)}")
    
    # Format header row
    sheet.format('A1:E1', {
        "backgroundColor": {"red": 0.36, "green": 0.17, "blue": 0.10},
        "textFormat": {"foregroundColor": {"red": 1, "green": 1, "blue": 1}, "bold": True},
        "horizontalAlignment": "CENTER"
    })
    print("✓ Formatted header row")
    
    return sheet

def setup_wishlist_sheet():
    """Create or update User_Wishlist sheet with correct headers"""
    print("\n" + "="*60)
    print("Setting up User_Wishlist Sheet")
    print("="*60)
    
    client = get_sheets_client()
    spreadsheet = client.open_by_key(SHEET_ID)
    
    try:
        sheet = spreadsheet.worksheet("User_Wishlist")
        print("✓ Found existing 'User_Wishlist' sheet")
        
        # Check if it has data
        all_values = sheet.get_all_values()
        if len(all_values) > 1:
            print(f"⚠ Sheet has {len(all_values)-1} existing rows")
            response = input("Do you want to keep existing data? (y/n): ")
            if response.lower() != 'y':
                sheet.clear()
                print("✓ Cleared existing data")
        else:
            sheet.clear()
    except:
        print("✗ 'User_Wishlist' sheet not found, creating new one...")
        sheet = spreadsheet.add_worksheet(title="User_Wishlist", rows="1000", cols="3")
        print("✓ Created 'User_Wishlist' sheet")
    
    # Set headers
    headers = [
        "Email",
        "Product_ID",
        "Added_At"
    ]
    
    sheet.update('A1:C1', [headers])
    print(f"✓ Set headers: {', '.join(headers)}")
    
    # Format header row
    sheet.format('A1:C1', {
        "backgroundColor": {"red": 0.36, "green": 0.17, "blue": 0.10},
        "textFormat": {"foregroundColor": {"red": 1, "green": 1, "blue": 1}, "bold": True},
        "horizontalAlignment": "CENTER"
    })
    print("✓ Formatted header row")
    
    return sheet

def verify_sheets():
    """Verify all sheets are set up correctly"""
    print("\n" + "="*60)
    print("Verifying Sheet Setup")
    print("="*60)
    
    client = get_sheets_client()
    spreadsheet = client.open_by_key(SHEET_ID)
    
    sheets_to_verify = {
        "Users": ["Email", "Username", "Password_Hash", "Full_Name", "Phone", "Address", 
                  "City", "State", "Pincode", "Created_At", "Last_Login", "Session_Token", "Profile_Complete"],
        "OTP_Codes": ["Email", "OTP_Code", "Created_At", "Expires_At", "Used"],
        "User_Wishlist": ["Email", "Product_ID", "Added_At"]
    }
    
    all_good = True
    
    for sheet_name, expected_headers in sheets_to_verify.items():
        try:
            sheet = spreadsheet.worksheet(sheet_name)
            actual_headers = sheet.row_values(1)
            
            if actual_headers == expected_headers:
                print(f"✓ {sheet_name}: Headers match perfectly")
            else:
                print(f"✗ {sheet_name}: Headers mismatch!")
                print(f"  Expected: {expected_headers}")
                print(f"  Actual:   {actual_headers}")
                all_good = False
        except Exception as e:
            print(f"✗ {sheet_name}: Error - {e}")
            all_good = False
    
    return all_good

def main():
    print("\n" + "="*60)
    print("GOOGLE SHEETS AUTHENTICATION SETUP")
    print("="*60)
    print(f"Spreadsheet ID: {SHEET_ID}")
    
    try:
        # Setup all sheets
        setup_users_sheet()
        setup_otp_codes_sheet()
        setup_wishlist_sheet()
        
        # Verify
        if verify_sheets():
            print("\n" + "="*60)
            print("✅ ALL SHEETS SET UP SUCCESSFULLY!")
            print("="*60)
            print("\nYou can now use the authentication system.")
            print("The following sheets are ready:")
            print("  1. Users - For user accounts")
            print("  2. OTP_Codes - For password reset OTPs")
            print("  3. User_Wishlist - For user wishlists")
        else:
            print("\n" + "="*60)
            print("⚠ SETUP COMPLETED WITH WARNINGS")
            print("="*60)
            print("Please check the errors above.")
            
    except Exception as e:
        print(f"\n✗ Error during setup: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
