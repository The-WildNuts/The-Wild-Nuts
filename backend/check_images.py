"""
Check product images from Google Sheets
"""
import requests
import json

response = requests.get('http://127.0.0.1:8000/api/products')
products = response.json()

print("Product Images Check:")
print("=" * 80)
for p in products[:10]:
    print(f"\nProduct: {p.get('name', 'N/A')}")
    print(f"  Image: {p.get('image', 'N/A')}")
    print(f"  Category: {p.get('category', 'N/A')}")
