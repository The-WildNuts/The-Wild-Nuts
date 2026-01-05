import requests
import json

def get_product_names():
    try:
        response = requests.get("http://localhost:8000/api/products")
        if response.status_code == 200:
            products = response.json()
            print(f"Found {len(products)} products:")
            for p in products:
                print(f"- {p.get('displayName') or p.get('name')} (Category: {p.get('category')})")
        else:
            print("Failed to fetch products")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    get_product_names()
