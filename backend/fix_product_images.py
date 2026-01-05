"""
Update product images in Google Sheets Master sheet
"""
import gspread
from oauth2client.service_account import ServiceAccountCredentials
import os

SHEET_ID = "1Ynl2Z_55tbjIsoGX5rY884tdanb2--TjRGnaKstzQLw"
CREDENTIALS_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".env"))

# Mapping of product names to their correct image paths
image_mapping = {
    'almond': '/pouch_almond.png',
    'cashew': '/pouch_cashew.png',
    'pistachio': '/pouch_pista.png',
    'pista': '/pouch_pista.png',
    'walnut': '/pouch_walnut.png',
    'date': '/pouch_dates.png',
    'fig': '/pouch_fig_dry.png',
    'raisin': '/pouch_raisins.png',
    'apricot': '/pouch_apricot.png',
    'blueberry': '/pouch_blueberry.png',
    'cranberry': '/pouch_cranberry.png',
    'kiwi': '/pouch_kiwi.png',
    'mango': '/pouch_mango.png',
    'papaya': '/pouch_papaya.png',
    'pineapple': '/pouch_pineapple.png',
    'strawberry': '/pouch_strawberry.png',
    'chia': '/pouch_chia_seeds.png',
    'flax': '/pouch_flax_seeds.png',
    'melon': '/pouch_melon_seeds.png',
    'pumpkin': '/pouch_pumpkin_seeds.png',
    'sesame': '/pouch_sesame_seeds.png',
    'sunflower': '/pouch_sunflower_seeds.png',
    'watermelon': '/pouch_watermelon_seeds.png',
    'makhana': '/pouch_makhana.png',
    'dry fruits mixed': '/pouch_dry_fruits_mixed.png',
    'dry nuts mixed': '/pouch_dry_nuts_mixed.png',
    'mixed': '/pouch_mixes.png',
}

def get_image_for_product(product_name):
    """Determine the correct image path for a product based on its name"""
    name_lower = product_name.lower()
    
    # Try exact matches first
    for key, image in image_mapping.items():
        if key in name_lower:
            return image
    
    # Default to logo if no match
    return '/logo-clean.png'

# Connect to Google Sheets
scope = ['https://spreadsheets.google.com/feeds', 'https://www.googleapis.com/auth/drive']
creds = ServiceAccountCredentials.from_json_keyfile_name(CREDENTIALS_PATH, scope)
client = gspread.authorize(creds)
spreadsheet = client.open_by_key(SHEET_ID)
sheet = spreadsheet.worksheet('Master')

# Get all data
all_data = sheet.get_all_values()
headers = all_data[0]
rows = all_data[1:]

print(f"Headers: {headers}")

# Find or add Image column
try:
    image_col_idx = headers.index('Image')
    print(f"Found Image column at index {image_col_idx}")
except ValueError:
    # Image column doesn't exist, add it
    print("Image column not found, adding it...")
    image_col_idx = len(headers)
    sheet.update_cell(1, image_col_idx + 1, 'Image')
    headers.append('Image')
    print(f"Added Image column at index {image_col_idx}")

# Find Product Name column
try:
    name_col_idx = headers.index('Product Name')
except ValueError:
    print("Error: 'Product Name' column not found")
    exit(1)

# Prepare batch updates
updates = []
updated_count = 0

for idx, row in enumerate(rows, start=2):  # Start at 2 because row 1 is headers
    if len(row) > name_col_idx:
        product_name = row[name_col_idx]
        new_image = get_image_for_product(product_name)
        
        # Check if we need to update
        current_image = row[image_col_idx] if len(row) > image_col_idx else ''
        if current_image != new_image:
            # Prepare update
            col_letter = chr(65 + image_col_idx) if image_col_idx < 26 else f"{chr(64 + image_col_idx // 26)}{chr(65 + image_col_idx % 26)}"
            cell_address = f'{col_letter}{idx}'
            updates.append({'range': cell_address, 'values': [[new_image]]})
            updated_count += 1
            print(f"Will update row {idx}: {product_name} -> {new_image}")

if updated_count > 0:
    print(f"\nUpdating {updated_count} products in Google Sheets...")
    # Batch update for efficiency
    sheet.batch_update(updates)
    print("Done! Product images have been updated.")
else:
    print("No updates needed - all images are already correct.")
