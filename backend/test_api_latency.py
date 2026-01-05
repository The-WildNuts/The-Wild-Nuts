import requests
import time

def test_api():
    start = time.time()
    try:
        print("Fetching products from http://localhost:8000/api/products...")
        response = requests.get("http://localhost:8000/api/products", timeout=30)
        duration = time.time() - start
        
        print(f"Status Code: {response.status_code}")
        print(f"Time Taken: {duration:.2f} seconds")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Product Count: {len(data)}")
            if len(data) > 0:
                print("First product sample:", data[0].get('name', 'No Name'))
        else:
            print("Error Response:", response.text[:200])
            
    except requests.exceptions.Timeout:
        print(f"Request timed out after {time.time() - start:.2f} seconds")
    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    test_api()
