import gspread
from oauth2client.service_account import ServiceAccountCredentials
import json
import os

# Google Sheets Setup
# Google Sheets Setup
SHEET_ID = "1Ynl2Z_55tbjIsoGX5rY884tdanb2--TjRGnaKstzQLw"
# Path to local credentials file
CREDENTIALS_PATH = os.path.join(os.path.dirname(__file__), "google_credentials.json")

def get_sheets_client():
    scope = ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/drive"]
    
    # Check for credentials in environment variable (for Render/Vercel)
    if os.getenv("GOOGLE_CREDENTIALS_JSON"):
        creds_dict = json.loads(os.getenv("GOOGLE_CREDENTIALS_JSON"))
    else:
        # Fallback to local file
        if not os.path.exists(CREDENTIALS_PATH):
            raise FileNotFoundError(f"Credentials not found at {CREDENTIALS_PATH} and GOOGLE_CREDENTIALS_JSON not set.")
        with open(CREDENTIALS_PATH, 'r') as f:
            creds_dict = json.load(f)
            
    creds = ServiceAccountCredentials.from_json_keyfile_dict(creds_dict, scope)
    client = gspread.authorize(creds)
    return client

import time

# Simple in-memory cache
# Format: { 'key': {'data': ..., 'timestamp': ...} }
CACHE = {}
CACHE_DURATION = 300  # 5 minutes in seconds

def invalidate_cache(sheet_name):
    global CACHE
    if sheet_name in CACHE:
        del CACHE[sheet_name]

def get_sheet_data(sheet_name, silent=False):
    global CACHE
    current_time = time.time()
    
    # Check cache first
    if sheet_name in CACHE:
        if current_time - CACHE[sheet_name]['timestamp'] < CACHE_DURATION:
            # print(f"Serving {sheet_name} from cache")
            return CACHE[sheet_name]['data']
    
    try:
        client = get_sheets_client()
        sheet = client.open_by_key(SHEET_ID).worksheet(sheet_name)
        data = sheet.get_all_records()
        
        # Update cache
        CACHE[sheet_name] = {
            'data': data,
            'timestamp': current_time
        }
        return data
    except Exception as e:
        if not silent:
            print(f"Error fetching sheet '{sheet_name}': {e}")
        return []

def get_categories():
    global CACHE
    current_time = time.time()
    # Cache key for derived categories from Master
    cache_key = "categories_derived_master"

    # Check cache
    if cache_key in CACHE:
        if current_time - CACHE[cache_key]['timestamp'] < CACHE_DURATION:
            return CACHE[cache_key]['data']

    try:
        # Source all data from "Master" sheet now
        master_data = get_sheet_data("Master")
        if not master_data:
            return []

        categories_map = {}
        
        for row in master_data:
            # Normalize keys just in case
            safe_row = {str(k).strip(): v for k, v in row.items()}
            
            # Extract category (handles 'Category', 'category', 'Categories', 'categories')
            cat_name = safe_row.get("Category", safe_row.get("category", safe_row.get("Categories", safe_row.get("categories", "")))).strip()
            prod_name = safe_row.get("Product Name", safe_row.get("product name", "")).strip()
            
            if not cat_name:
                continue
                
            # Initialize category if not present
            if cat_name not in categories_map:
                categories_map[cat_name] = {
                    "id": cat_name.lower().replace(" ", "-"),
                    "name": cat_name,
                    "subcategories": []
                }
            
            # Add product name to subcategories if present
            if prod_name and prod_name not in categories_map[cat_name]["subcategories"]:
                categories_map[cat_name]["subcategories"].append(prod_name)
        
        # Convert map values to list
        categories_data = list(categories_map.values())

        # Update cache
        if categories_data:
            CACHE[cache_key] = {
                'data': categories_data,
                'timestamp': current_time
            }
            return categories_data

    except Exception as e:
        print(f"Error fetching categories from Master: {e}")
        return []

    return []

def get_products():
    # Fetch from "Master" sheet
    # Columns expected: 
    # Product Name (id/sub-cat reference), Category, Header Product Name (display name), 
    # 100g, 250g, 500g, 1000g (prices)
    
    data = get_sheet_data("Master")
    if not data:
        return []

    normalized = []
    for raw_row in data:
        # Robust key handling
        row = {str(k).strip(): v for k, v in raw_row.items()}
        
        # Core fields
        p_name = row.get("Product Name", row.get("product name", ""))
        p_header_name = row.get("Header Product Name", row.get("header product name", p_name))
        p_header_name = row.get("Header Product Name", row.get("header product name", p_name))
        cat = row.get("Category", row.get("category", row.get("Categories", row.get("categories", ""))))
        
        # Pricing
        # Helper to parse price safely (handle '100', 100, '$100', etc)
        def parse_price(val):
            if not val: return 0
            if isinstance(val, (int, float)): return val
            try:
                return int(''.join(filter(str.isdigit, str(val))))
            except:
                return 0

        price_100g = parse_price(row.get("Price_100g")) or parse_price(row.get("100g"))
        price_250g = parse_price(row.get("Price_250g")) or parse_price(row.get("250g"))
        price_500g = parse_price(row.get("Price_500g")) or parse_price(row.get("500g"))
        price_1kg = parse_price(row.get("Price_1kg")) or parse_price(row.get("1000g")) or parse_price(row.get("1kg"))

        # Determine a "base" price for listing (e.g., lowest available or 250g)
        display_price = price_250g if price_250g > 0 else (price_100g or price_500g or price_1kg)

        normalized.append({
            "id": p_name, # unique identifier (assumed unique in Master)
            "name": p_name, # Internal name / Sub-category link
            "displayName": p_header_name, # The "Add Card Header Name"
            "category": cat,
            "price": display_price,
            "prices": {
                "100g": price_100g,
                "250g": price_250g,
                "500g": price_500g,
                "1kg": price_1kg, 
                "1000g": price_1kg # Alias
            },
            # Map other potential fields if present, else default
            "image": row.get("Image", row.get("image", "/logo-clean.png")),
            "description": row.get("Description", row.get("description", "Premium quality nuts.")),
            "benefits": row.get("Benefits", row.get("benefits", ""))
        })
        
    return normalized

def get_brands():
    brands = get_sheet_data("Brands", silent=True)
    if not brands:
        # Return fallback brands so the UI doesn't look empty
        return [
            {"name": "Nutraj", "image": "/logo-clean.png"},
            {"name": "The Wild Nuts", "image": "/logo-clean.png"},
            {"name": "Bacture", "image": "/logo-clean.png"}
        ]
    return brands

import datetime

import datetime

def get_users_sheet():
    client = get_sheets_client()
    spreadsheet = client.open_by_key(SHEET_ID)
    try:
        return spreadsheet.worksheet("Users")
    except:
        # Try to create it
        try:
            print("Creating missing 'Users' sheet...")
            sheet = spreadsheet.add_worksheet(title="Users", rows=100, cols=10)
            sheet.append_row(['Email', 'Password', 'Name', 'Phone', 'JoinedAt', 'LastLogin'])
            return sheet
        except Exception as e:
            print(f"Failed to create Users sheet: {e}")
            return None

def authenticate_user(email, password):
    # Use Cached Data
    records = get_sheet_data("Users")
    if not records: return {"error": "User not found"}
    
    for user in records:
        # Check email (case insensitive) and password (exact)
        if str(user.get("Email", "")).lower().strip() == email.lower().strip():
            stored_pass = str(user.get("Password", ""))
            if stored_pass == password:
                return user
            else:
                return {"error": "Invalid Password"}
    
    return {"error": "User not found"}

def register_user(email, password):
    sheet = get_users_sheet()
    if not sheet: return {"error": "Users sheet missing"}
    
    records = sheet.get_all_records()
    for user in records:
        if str(user.get("Email", "")).lower().strip() == email.lower().strip():
             return {"error": "User already exists"}
    
    # Columns: Email, Password, Name, Phone, Address, Gender, Age, JoinedAt, LastLogin
    # Ensure we match the sheet columns order if possible, or just append generic
    # For simplicity, we assume Columns A-I order:
    # A: Email, B: Password, C: Name, D: Phone, E: Address, F: Gender, G: Age, H: JoinedAt, I: LastLogin
    now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    new_row = [email, password, "", "", "", "", "", now_str, now_str]
    sheet.append_row(new_row)
    
    return {
        "Email": email,
        "Name": "",
        "Phone": "",
        "Address": "",
        "Gender": "",
        "Age": "",
        "JoinedAt": now_str,
        "LastLogin": now_str
    }

def reset_password(email, new_password):
    sheet = get_users_sheet()
    if not sheet: return {"error": "Users sheet missing"}
    
    cell = sheet.find(email)
    if cell:
        sheet.update_cell(cell.row, 2, new_password)
        return {"success": True}
    return {"error": "User not found"}

def update_user_profile(email, profile_data):
    sheet = get_users_sheet()
    if not sheet: return {"error": "Users sheet missing"}
    
    cell = sheet.find(email)
    if not cell: return {"error": "User not found"}
    
    row = cell.row
    # Mapping based on assummed schema:
    # A=1 (Email), B=2 (Pass), C=3 (Name), D=4 (Phone), E=5 (Address), F=6 (Gender), G=7 (Age)
    
    # We update cells individually or batch. Batch is better but update_cell is simpler for now.
    user_updates = []
    
    if "Name" in profile_data: sheet.update_cell(row, 3, profile_data["Name"])
    if "Phone" in profile_data: sheet.update_cell(row, 4, profile_data["Phone"])
    if "Address" in profile_data: sheet.update_cell(row, 5, profile_data["Address"])
    if "Gender" in profile_data: sheet.update_cell(row, 6, profile_data["Gender"])
    if "Age" in profile_data: sheet.update_cell(row, 7, profile_data["Age"])
    
    # Return updated user object (fetching it again to be safe/consistent)
    # Or just merge locally:
    # return { ... }
    
    # Let's fetch the full row to return confirmed data
    raw_row = sheet.row_values(row)
    # Pad if missing
    while len(raw_row) < 9: raw_row.append("")
    
    return {
        "Email": raw_row[0],
        "Name": raw_row[2],
        "Phone": raw_row[3],
        "Address": raw_row[4],
        "Gender": raw_row[5],
        "Age": raw_row[6],
        "JoinedAt": raw_row[7],
        "LastLogin": raw_row[8]
    }

# ============================================
# Authentication & User Management Functions
# ============================================

def get_user_by_email(email):
    """Get user by email address"""
    try:
        # Use Cached Data
        records = get_sheet_data("Users")
        
        target_email = email.lower().strip()
        
        for record in records:
            # Check email (handle potential missing key safely)
            raw_email = str(record.get('Email', ''))
            current_email = raw_email.lower().strip()
            
            if current_email == target_email:
                return {
                    "email": record.get("Email", ""),
                    "username": record.get("Username"),
                    "password_hash": record.get("Password_Hash", ""),
                    "full_name": record.get("Full_Name", ""),
                    "phone": record.get("Phone", ""),
                    "address": record.get("Address", ""),
                    "city": record.get("City", ""),
                    "state": record.get("State", ""),
                    "pincode": record.get("Pincode", ""),
                    "created_at": record.get("Created_At", ""),
                    "last_login": record.get("Last_Login", ""),
                    "session_token": record.get("Session_Token", ""),
                    "profile_complete": str(record.get("Profile_Complete", "false")).lower()
                }
                
        return None
    except Exception as e:
        print(f"Error getting user by email: {e}")
        return None

def get_user_by_username(username):
    """Get user by username"""
    try:
        # Use Cached Data
        records = get_sheet_data("Users")
        
        for record in records:
            if str(record.get('Username', '')).lower() == username.lower():
                return {
                    "email": record.get("Email", ""),
                    "username": record.get("Username"),
                    "password_hash": record.get("Password_Hash", ""),
                    "full_name": record.get("Full_Name", ""),
                    "phone": record.get("Phone", ""),
                    "address": record.get("Address", ""),
                    "city": record.get("City", ""),
                    "state": record.get("State", ""),
                    "pincode": record.get("Pincode", ""),
                    "created_at": record.get("Created_At", ""),
                    "last_login": record.get("Last_Login", ""),
                    "session_token": record.get("Session_Token", ""),
                    "profile_complete": str(record.get("Profile_Complete", "false")).lower()
                }
        return None
    except Exception as e:
        print(f"Error getting user by username: {e}")
        return None

def create_user(email, password_hash):
    """Create a new user"""
    import datetime
    try:
        client = get_sheets_client()
        spreadsheet = client.open_by_key(SHEET_ID)
        
        # Get or create Users sheet
        try:
            sheet = spreadsheet.worksheet("Users")
        except:
            # Create the sheet if it doesn't exist
            sheet = spreadsheet.add_worksheet(title="Users", rows="1000", cols="13")
            # Add headers
            sheet.append_row([
                "Email", "Username", "Password_Hash", "Full_Name", "Phone",
                "Address", "City", "State", "Pincode", "Created_At",
                "Last_Login", "Session_Token", "Profile_Complete"
            ])
        
        now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        # Add new user
        sheet.append_row([
            email,
            "",  # Username (to be set later)
            password_hash,
            "",  # Full_Name
            "",  # Phone
            "",  # Address
            "",  # City
            "",  # State
            "",  # Pincode
            now_str,  # Created_At
            now_str,  # Last_Login
            "",  # Session_Token
            "false"  # Profile_Complete
        ])
        
        invalidate_cache("Users")  # <--- Invalidate Cache
        
        return {"success": True, "email": email}
    except Exception as e:
        print(f"Error creating user: {e}")
        return {"error": str(e)}

def update_user_profile_auth(email, username=None, full_name=None, phone=None, 
                             address=None, city=None, state=None, pincode=None):
    """Update user profile information"""
    try:
        client = get_sheets_client()
        spreadsheet = client.open_by_key(SHEET_ID)
        sheet = spreadsheet.worksheet("Users")
        
        cell = sheet.find(email)
        if not cell:
            return {"error": "User not found"}
        
        row = cell.row
        
        # Update fields if provided
        if username is not None:
            sheet.update_cell(row, 2, username)
        if full_name is not None:
            sheet.update_cell(row, 4, full_name)
        if phone is not None:
            sheet.update_cell(row, 5, phone)
        if address is not None:
            sheet.update_cell(row, 6, address)
        if city is not None:
            sheet.update_cell(row, 7, city)
        if state is not None:
            sheet.update_cell(row, 8, state)
        if pincode is not None:
            sheet.update_cell(row, 9, pincode)
        
        # Mark profile as complete if username is set
        if username:
            sheet.update_cell(row, 13, "true")
            
        invalidate_cache("Users")  # <--- Invalidate Cache
        
        return {"success": True}
    except Exception as e:
        print(f"Error updating user profile: {e}")
        return {"error": str(e)}

def update_password_hash(email, new_password_hash):
    """Update user password"""
    try:
        client = get_sheets_client()
        spreadsheet = client.open_by_key(SHEET_ID)
        sheet = spreadsheet.worksheet("Users")
        
        cell = sheet.find(email)
        if not cell:
            return {"error": "User not found"}
        
        sheet.update_cell(cell.row, 3, new_password_hash)
        
        invalidate_cache("Users")  # <--- Invalidate Cache
        
        return {"success": True}
    except Exception as e:
        print(f"Error updating password: {e}")
        return {"error": str(e)}

def update_session_token(email, session_token):
    """Update user session token"""
    import datetime
    try:
        client = get_sheets_client()
        spreadsheet = client.open_by_key(SHEET_ID)
        sheet = spreadsheet.worksheet("Users")
        
        cell = sheet.find(email)
        if not cell:
            return {"error": "User not found"}
        
        row = cell.row
        now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        sheet.update_cell(row, 11, now_str)  # Last_Login
        sheet.update_cell(row, 12, session_token)  # Session_Token
        
        invalidate_cache("Users")  # <--- Invalidate Cache
        
        return {"success": True}
    except Exception as e:
        print(f"Error updating session token: {e}")
        return {"error": str(e)}

def store_otp(email, otp):
    """Store OTP for password reset"""
    import datetime
    try:
        client = get_sheets_client()
        spreadsheet = client.open_by_key(SHEET_ID)
        
        # Get or create OTP_Codes sheet
        try:
            sheet = spreadsheet.worksheet("OTP_Codes")
        except:
            sheet = spreadsheet.add_worksheet(title="OTP_Codes", rows="1000", cols="5")
            sheet.append_row(["Email", "OTP_Code", "Created_At", "Expires_At", "Used"])
        
        now = datetime.datetime.now()
        expires = now + datetime.timedelta(minutes=10)
        
        sheet.append_row([
            email,
            otp,
            now.strftime("%Y-%m-%d %H:%M:%S"),
            expires.strftime("%Y-%m-%d %H:%M:%S"),
            "false"
        ])
        
        return {"success": True}
    except Exception as e:
        print(f"Error storing OTP: {e}")
        return {"error": str(e)}

def verify_otp(email, otp):
    """Verify OTP for password reset"""
    import datetime
    try:
        client = get_sheets_client()
        spreadsheet = client.open_by_key(SHEET_ID)
        sheet = spreadsheet.worksheet("OTP_Codes")
        
        # Get all records
        records = sheet.get_all_records()
        now = datetime.datetime.now()
        
        # Find matching OTP (search from bottom to top for most recent)
        for idx in range(len(records) - 1, -1, -1):
            record = records[idx]
            if (record.get('Email') == email and 
                record.get('OTP_Code') == otp and 
                record.get('Used') == 'false'):
                
                # Check if expired
                expires_str = record.get('Expires_At')
                expires = datetime.datetime.strptime(expires_str, "%Y-%m-%d %H:%M:%S")
                
                if now > expires:
                    return {"error": "OTP expired"}
                
                # Mark as used
                row_num = idx + 2
                sheet.update_cell(row_num, 5, "true")
                
                return {"success": True}
        
        return {"error": "Invalid OTP"}
    except Exception as e:
        print(f"Error verifying OTP: {e}")
        return {"error": str(e)}

def get_user_wishlist(email):
    """Get user's wishlist"""
    try:
        # Use Cached Data
        records = get_sheet_data("User_Wishlist")
        
        wishlist = []
        
        for record in records:
            if record.get('Email') == email:
                p_id = record.get('Product_ID')
                if p_id: # Only add if Product_ID is present (filters out Cart items)
                    wishlist.append({
                        "product_id": p_id,
                        "added_at": record.get('Added_At')
                    })
        
        return wishlist
    except Exception as e:
        print(f"Error getting wishlist: {e}")
        return []

def add_to_wishlist(email, product_id):
    """Add product to user's wishlist"""
    import datetime
    try:
        client = get_sheets_client()
        spreadsheet = client.open_by_key(SHEET_ID)
        
        # Get or create User_Wishlist sheet
        try:
            sheet = spreadsheet.worksheet("User_Wishlist")
        except:
            sheet = spreadsheet.add_worksheet(title="User_Wishlist", rows="1000", cols="4")
            sheet.append_row(["Email", "Product_ID", "Added_At", "Add_Card_Product"])
        
        # Check if already in wishlist
        records = sheet.get_all_records()
        for record in records:
            # Check safely for column existence
            r_email = str(record.get('Email', ''))
            r_pid = str(record.get('Product_ID', ''))
            
            if r_email == email and r_pid == product_id:
                return {"success": True, "message": "Already in wishlist"}
        
        # Add to wishlist
        now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        # Add to wishlist (Col 2)
        # Structure: Email, Product_ID, Added_At, Add_Card_Product
        now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        sheet.append_row([email, product_id, now_str, ""])
        
        invalidate_cache("User_Wishlist")  # <--- Invalidate Cache
        
        return {"success": True}
    except Exception as e:
        print(f"Error adding to wishlist: {e}")
        return {"error": str(e)}

def add_to_cart_history(email, product_id):
    """Add product to user's cart history (Add_Card_Product column)"""
    import datetime
    try:
        client = get_sheets_client()
        spreadsheet = client.open_by_key(SHEET_ID)
        
        # Get or create User_Wishlist sheet (reusing the same sheet as requested)
        try:
            sheet = spreadsheet.worksheet("User_Wishlist")
        except:
            sheet = spreadsheet.add_worksheet(title="User_Wishlist", rows="1000", cols="4")
            sheet.append_row(["Email", "Product_ID", "Added_At", "Add_Card_Product"])
        
        # Add to cart history (Col 4)
        now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        # We append a new row for every cart action as it's a history
        # Structure: Email, Product_ID, Added_At, Add_Card_Product
        # Leave Product_ID empty for cart items to distinguish
        sheet.append_row([email, "", now_str, product_id])
        
        invalidate_cache("User_Wishlist")
        
        return {"success": True}
    except Exception as e:
        print(f"Error adding to cart history: {e}")
        return {"error": str(e)}

def remove_from_wishlist(email, product_id):
    """Remove product from user's wishlist"""
    try:
        client = get_sheets_client()
        spreadsheet = client.open_by_key(SHEET_ID)
        sheet = spreadsheet.worksheet("User_Wishlist")
        
        # Find and delete the row
        records = sheet.get_all_records()
        for idx, record in enumerate(records):
            if record.get('Email') == email and record.get('Product_ID') == product_id:
                row_num = idx + 2
                sheet.delete_rows(row_num)
                
                invalidate_cache("User_Wishlist")  # <--- Invalidate Cache
                
                return {"success": True}
        
        return {"error": "Item not found in wishlist"}
    except Exception as e:
        print(f"Error removing from wishlist: {e}")
        return {"error": str(e)}

def get_user_cart(email):
    """Get user's cart history"""
    try:
        # Use Cached Data
        records = get_sheet_data("User_Wishlist")
        
        cart_items = []
        
        for record in records:
            if record.get('Email') == email:
                p_id = record.get('Add_Card_Product')
                if p_id:
                    cart_items.append({
                        "product_id": p_id,
                        "added_at": record.get('Added_At'),
                        "id": p_id, # Frontend expects 'id'
                        # We might need to fetch full details (name, price) here or frontend handles it?
                        # Usually frontend needs full product object. 
                        # For now, we return ID and let frontend/API hydrate it.
                    })
        
        return cart_items
    except Exception as e:
        print(f"Error getting cart: {e}")
        return []

def remove_from_cart_history(email, product_id):
    """Remove product from user's cart history"""
    try:
        client = get_sheets_client()
        spreadsheet = client.open_by_key(SHEET_ID)
        sheet = spreadsheet.worksheet("User_Wishlist")
        
        # Find and delete the row
        # Warning: This is O(N) scan.
        records = sheet.get_all_records()
        
        rows_to_delete = []
        
        for idx, record in enumerate(records):
            r_email = str(record.get('Email', ''))
            r_pid = str(record.get('Add_Card_Product', ''))
            
            if r_email == email and r_pid == product_id:
                rows_to_delete.append(idx + 2)
        
        # Delete in reverse order to keep indices valid
        for row_num in reversed(rows_to_delete):
            sheet.delete_rows(row_num)
            
        if rows_to_delete:
            invalidate_cache("User_Wishlist")
            return {"success": True}
        
        return {"error": "Item not found in cart history"}
    except Exception as e:
        print(f"Error removing from cart history: {e}")
        return {"error": str(e)}

def get_user_orders(email):
    """Get user's order history"""
    try:
        # This assumes you have an Orders sheet
        # Adjust based on your actual orders structure
        data = get_sheet_data("Orders", silent=True)
        user_orders = [order for order in data if order.get('User_Email') == email]
        return user_orders
    except Exception as e:
        print(f"Error getting user orders: {e}")
        return []

def create_order(order_data):
    """Create a new order"""
    import datetime
    import uuid
    import time
    try:
        client = get_sheets_client()
        spreadsheet = client.open_by_key(SHEET_ID)
        
        # Get or create Orders sheet
        try:
            sheet = spreadsheet.worksheet("Orders")
        except:
             # Columns: OrderID, Email, User_Name, Items_JSON, Total_Amount, Status, Payment_Mode, Created_At, Tracking_Stage
            sheet = spreadsheet.add_worksheet(title="Orders", rows="1000", cols="10")
            sheet.append_row(["Order_ID", "User_Email", "User_Name", "Items", "Total_Amount", "Status", "Payment_Mode", "Created_At", "Tracking_Stage"])
            
        # Generate Order ID
        order_id = f"ORD-{int(time.time())}-{str(uuid.uuid4())[:4].upper()}"
        
        # Parse items to string/JSON for sheet storage
        items_str = json.dumps(order_data.get("items", []))
        
        now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        # Default tracking stage
        tracking_stage = "Order Placed"
        
        new_row = [
            order_id,
            order_data.get("email"),
            order_data.get("user_name", ""),
            items_str,
            order_data.get("total_amount"),
            "Pending", # Status
            "WhatsApp/COD", # Payment Mode
            now_str,
            tracking_stage
        ]
        
        sheet.append_row(new_row)
        
        invalidate_cache("Orders")
        
        return {"success": True, "order_id": order_id}
    except Exception as e:
        print(f"Error creating order: {e}")
        return {"error": str(e)}

# ============================================
# Admin Helper Functions
# ============================================

def get_all_orders():
    """Get all orders for admin"""
    try:
        return get_sheet_data("Orders")
    except Exception as e:
        print(f"Error getting all orders: {e}")
        return []

def get_order_by_id(order_id):
    """Get a specific order by ID"""
    try:
        orders = get_sheet_data("Orders")
        for order in orders:
            if order.get('Order_ID') == order_id:
                return order
        return None
    except Exception as e:
        print(f"Error getting order by ID: {e}")
        return None

def get_all_users():
    """Get all users for admin"""
    try:
        return get_sheet_data("Users")
    except Exception as e:
        print(f"Error getting all users: {e}")
        return []

def update_order_status(order_id, new_status):
    """Update order status/tracking stage"""
    try:
        client = get_sheets_client()
        spreadsheet = client.open_by_key(SHEET_ID)
        sheet = spreadsheet.worksheet("Orders")
        
        # Find order row
        cell = sheet.find(order_id)
        if not cell:
            return {"error": "Order not found"}
            
        # Update Tracking Stage (Col 9 based on create_order assumption)
        # Columns: Order_ID, User_Email, User_Name, Items, Total_Amount, Status, Payment_Mode, Created_At, Tracking_Stage
        # Tracking_Stage is Col 9. Status is Col 6.
        # We usually update both to keep them in sync or just tracking stage
        
        sheet.update_cell(cell.row, 9, new_status) # Update Tracking Stage
        
        # Also update Status to "Completed" if Delivered, or "Cancelled" if Cancelled
        if new_status == "Delivered":
            sheet.update_cell(cell.row, 6, "Completed")
        elif new_status == "Cancelled":
             sheet.update_cell(cell.row, 6, "Cancelled")
        elif new_status != "Order Placed":
             sheet.update_cell(cell.row, 6, "In Progress")

        invalidate_cache("Orders")
        return {"success": True}
    except Exception as e:
        print(f"Error updating order status: {e}")
        return {"error": str(e)}

def store_subscriber(email):
    """Store newsletter subscriber"""
    import datetime
    try:
        client = get_sheets_client()
        spreadsheet = client.open_by_key(SHEET_ID)
        
        try:
            sheet = spreadsheet.worksheet("Subscribers")
        except:
            sheet = spreadsheet.add_worksheet(title="Subscribers", rows="1000", cols="2")
            sheet.append_row(["Email", "Joined_At"])
            
        # Check if exists
        records = sheet.get_all_records()
        for record in records:
            if record.get("Email") == email:
                return {"success": True, "message": "Already subscribed"}
        
        now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        sheet.append_row([email, now_str])
        
        return {"success": True}
    except Exception as e:
         print(f"Error storing subscriber: {e}")
         return {"error": str(e)}

def get_all_subscribers():
    """Get all subscribers"""
    try:
         return get_sheet_data("Subscribers")
    except Exception as e:
         print(f"Error getting subscribers: {e}")
         return []

def update_product_offer(product_id, is_offer):
    """Toggle Special Offer status for a product"""
    try:
        client = get_sheets_client()
        spreadsheet = client.open_by_key(SHEET_ID)
        sheet = spreadsheet.worksheet("Master")
        
        # Find product row
        cell = sheet.find(product_id)
        if not cell:
            return {"error": "Product not found"}
            
        # Assuming "Special_Offer" is a new column or we use description
        # Let's verify columns or just add it to a specific column index
        # To be safe and minimal impact, let's assume Column 10 (J) or just use find header
        
        # Find header col index
        header_row = sheet.row_values(1)
        try:
            col_idx = header_row.index("Special_Offer") + 1
        except ValueError:
            # Column doesn't exist, append it
            col_idx = len(header_row) + 1
            sheet.update_cell(1, col_idx, "Special_Offer")
        
        sheet.update_cell(cell.row, col_idx,str(is_offer).lower())
        
        invalidate_cache("Master")
        return {"success": True}
    except Exception as e:
         print(f"Error updating product offer: {e}")
         return {"error": str(e)}
