import requests
import time
import threading

def fetch_url(url, name):
    start = time.time()
    try:
        print(f"[{name}] Starting request to {url}...")
        response = requests.get(url, timeout=30)
        duration = time.time() - start
        print(f"[{name}] Completed: Status {response.status_code}, Time {duration:.2f}s")
    except Exception as e:
        print(f"[{name}] Failed: {e}")

def test_concurrent():
    print("Testing concurrent requests to /products and /categories...")
    t1 = threading.Thread(target=fetch_url, args=("http://localhost:8000/api/products", "Products"))
    t2 = threading.Thread(target=fetch_url, args=("http://localhost:8000/api/categories", "Categories"))
    
    start_all = time.time()
    t1.start()
    t2.start()
    
    t1.join()
    t2.join()
    print(f"Total concurrent time: {time.time() - start_all:.2f}s")

if __name__ == "__main__":
    test_concurrent()
