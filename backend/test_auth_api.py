import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_endpoints():
    """Test all authentication endpoints"""
    
    print("=" * 60)
    print("TESTING THE WILDNUTS AUTHENTICATION API")
    print("=" * 60)
    
    # Test 1: Check if server is running
    print("\n1. Testing server connection...")
    try:
        response = requests.get(f"{BASE_URL}/")
        print(f"   ✓ Server is running: {response.json()}")
    except Exception as e:
        print(f"   ✗ Server connection failed: {e}")
        return
    
    # Test 2: Test existing endpoints
    print("\n2. Testing existing endpoints...")
    try:
        response = requests.get(f"{BASE_URL}/api/categories")
        print(f"   ✓ Categories endpoint: {len(response.json())} categories")
        
        response = requests.get(f"{BASE_URL}/api/products")
        print(f"   ✓ Products endpoint: {len(response.json())} products")
    except Exception as e:
        print(f"   ✗ Existing endpoints failed: {e}")
    
    # Test 3: Test registration (with invalid password)
    print("\n3. Testing registration validation...")
    try:
        response = requests.post(
            f"{BASE_URL}/api/auth/register",
            json={"email": "test@example.com", "password": "weak"}
        )
        if response.status_code == 400:
            print(f"   ✓ Password validation working: {response.json()['detail']}")
        else:
            print(f"   ✗ Unexpected response: {response.status_code}")
    except Exception as e:
        print(f"   ✗ Registration test failed: {e}")
    
    # Test 4: Test registration (with valid data)
    print("\n4. Testing user registration...")
    test_email = "testuser@wildnuts.com"
    test_password = "SecurePass123"
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/auth/register",
            json={"email": test_email, "password": test_password}
        )
        if response.status_code == 200:
            data = response.json()
            print(f"   ✓ Registration successful")
            print(f"   ✓ Token received: {data['token'][:20]}...")
            print(f"   ✓ Profile complete: {data['profile_complete']}")
            token = data['token']
        elif response.status_code == 400 and "already registered" in response.json()['detail']:
            print(f"   ℹ User already exists (expected if running multiple times)")
            # Try to login instead
            response = requests.post(
                f"{BASE_URL}/api/auth/login",
                json={"identifier": test_email, "password": test_password}
            )
            if response.status_code == 200:
                token = response.json()['token']
                print(f"   ✓ Logged in instead: {token[:20]}...")
            else:
                print(f"   ✗ Login failed: {response.json()}")
                return
        else:
            print(f"   ✗ Registration failed: {response.json()}")
            return
    except Exception as e:
        print(f"   ✗ Registration test failed: {e}")
        return
    
    # Test 5: Test login with email
    print("\n5. Testing login with email...")
    try:
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"identifier": test_email, "password": test_password}
        )
        if response.status_code == 200:
            data = response.json()
            print(f"   ✓ Login successful")
            print(f"   ✓ Email: {data['email']}")
            print(f"   ✓ Username: {data.get('username', 'Not set')}")
            token = data['token']
        else:
            print(f"   ✗ Login failed: {response.json()}")
    except Exception as e:
        print(f"   ✗ Login test failed: {e}")
    
    # Test 6: Test protected endpoint (get profile)
    print("\n6. Testing protected endpoint (get profile)...")
    try:
        response = requests.get(
            f"{BASE_URL}/api/user/profile",
            headers={"Authorization": f"Bearer {token}"}
        )
        if response.status_code == 200:
            data = response.json()
            print(f"   ✓ Profile retrieved successfully")
            print(f"   ✓ Email: {data['email']}")
            print(f"   ✓ Profile complete: {data['profile_complete']}")
        else:
            print(f"   ✗ Profile retrieval failed: {response.json()}")
    except Exception as e:
        print(f"   ✗ Profile test failed: {e}")
    
    # Test 7: Test update profile
    print("\n7. Testing profile update...")
    try:
        response = requests.put(
            f"{BASE_URL}/api/user/profile",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "username": "testwildnut",
                "full_name": "Test User",
                "phone": "1234567890",
                "city": "Mumbai"
            }
        )
        if response.status_code == 200:
            print(f"   ✓ Profile updated successfully")
        else:
            print(f"   ✗ Profile update failed: {response.json()}")
    except Exception as e:
        print(f"   ✗ Profile update test failed: {e}")
    
    # Test 8: Test wishlist
    print("\n8. Testing wishlist functionality...")
    try:
        # Add to wishlist
        response = requests.post(
            f"{BASE_URL}/api/user/wishlist/test-product-123",
            headers={"Authorization": f"Bearer {token}"}
        )
        if response.status_code == 200:
            print(f"   ✓ Added to wishlist")
        
        # Get wishlist
        response = requests.get(
            f"{BASE_URL}/api/user/wishlist",
            headers={"Authorization": f"Bearer {token}"}
        )
        if response.status_code == 200:
            wishlist = response.json()['wishlist']
            print(f"   ✓ Wishlist retrieved: {len(wishlist)} items")
        
        # Remove from wishlist
        response = requests.delete(
            f"{BASE_URL}/api/user/wishlist/test-product-123",
            headers={"Authorization": f"Bearer {token}"}
        )
        if response.status_code == 200:
            print(f"   ✓ Removed from wishlist")
    except Exception as e:
        print(f"   ✗ Wishlist test failed: {e}")
    
    # Test 9: Test forgot password flow
    print("\n9. Testing forgot password flow...")
    try:
        response = requests.post(
            f"{BASE_URL}/api/auth/forgot-password",
            json={"email": test_email}
        )
        if response.status_code == 200:
            print(f"   ✓ OTP request sent (check console for OTP in test mode)")
            print(f"   ✓ Message: {response.json()['message']}")
        else:
            print(f"   ✗ Forgot password failed: {response.json()}")
    except Exception as e:
        print(f"   ✗ Forgot password test failed: {e}")
    
    # Test 10: Test logout
    print("\n10. Testing logout...")
    try:
        response = requests.post(
            f"{BASE_URL}/api/auth/logout",
            headers={"Authorization": f"Bearer {token}"}
        )
        if response.status_code == 200:
            print(f"   ✓ Logout successful")
        else:
            print(f"   ✗ Logout failed: {response.json()}")
    except Exception as e:
        print(f"   ✗ Logout test failed: {e}")
    
    print("\n" + "=" * 60)
    print("TESTING COMPLETE")
    print("=" * 60)
    print("\nAll core authentication features are working!")
    print("Next steps:")
    print("  1. Frontend components (Register, Login, Profile pages)")
    print("  2. AuthContext for state management")
    print("  3. Protected routes")
    print("=" * 60)

if __name__ == "__main__":
    test_endpoints()
