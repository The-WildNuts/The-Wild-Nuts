"""
Quick script to check what data is being returned from the products API
"""
import requests
import json

response = requests.get('http://127.0.0.1:8000/api/products')
products = response.json()

if products:
    print("First product data:")
    print(json.dumps(products[0], indent=2))
    
    print("\n\nAll product IDs and prices:")
    for p in products[:5]:  # First 5 products
        print(f"\nID: {p.get('id')}")
        print(f"Name: {p.get('name')}")
        print(f"Display Name: {p.get('displayName')}")
        print(f"Price: {p.get('price')}")
        print(f"Prices object: {p.get('prices')}")
else:
    print("No products returned")
