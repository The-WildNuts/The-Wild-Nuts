import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_categories():
    print("\n--- Testing Categories ---")
    try:
        response = requests.get(f"{BASE_URL}/categories")
        if response.status_code == 200:
            data = response.json()
            print(f"Success: Fetched {len(data)} categories.")
            if len(data) > 0:
                print("Sample Category:", json.dumps(data[0], indent=2))
                if 'subcategories' in data[0]:
                    print("✅ Subcategories field present.")
                else:
                    print("❌ Subcategories field MISSING.")
        else:
            print(f"Failed: {response.status_code}")
    except Exception as e:
        print(f"Error: {e}")

def test_products():
    print("\n--- Testing Products ---")
    try:
        response = requests.get(f"{BASE_URL}/products")
        if response.status_code == 200:
            data = response.json()
            print(f"Success: Fetched {len(data)} products.")
            if len(data) > 0:
                print("Sample Product:", json.dumps(data[0], indent=2))
                
                # Validation
                p = data[0]
                expected_fields = ["displayName", "prices", "price", "category", "id"]
                missing = [f for f in expected_fields if f not in p]
                if not missing:
                    print("✅ All expected fields (displayName, prices, etc) present.")
                else:
                    print(f"❌ Missing fields: {missing}")
                    
                if 'prices' in p:
                    print(f"Dynamic Prices: {p['prices']}")
        else:
            print(f"Failed: {response.status_code}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_categories()
    test_products()
