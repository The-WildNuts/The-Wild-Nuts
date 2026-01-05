import requests
import json

BASE_URL = "http://127.0.0.1:8000/api"

def test_admin_flow():
    print("1. Testing Admin Login...")
    login_payload = {
        "identifier": "connectwiththewildnuts@gmail.com",
        "security_key": "Cantgetme@1"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/admin/login", json=login_payload)
        print(f"Login Status: {response.status_code}")
        
        if response.status_code != 200:
            print(f"Login Failed: {response.text}")
            return

        data = response.json()
        token = data.get("token")
        
        if not token:
            print("No token received!")
            return
            
        print(f"Token received: {token[:15]}...")
        
        print("\n2. Testing Admin Stats with Token...")
        headers = {
            "Authorization": f"Bearer {token}"
        }
        
        stats_response = requests.get(f"{BASE_URL}/admin/stats", headers=headers)
        print(f"Stats Status: {stats_response.status_code}")
        print(f"Stats Response: {stats_response.text}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_admin_flow()
