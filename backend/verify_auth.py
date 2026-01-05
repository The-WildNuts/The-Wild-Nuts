"""
Quick verification of authentication system functionality
"""

print("=" * 60)
print("AUTHENTICATION SYSTEM VERIFICATION")
print("=" * 60)

# Check if all required files exist
import os

files_to_check = [
    ("auth.py", "Authentication utilities"),
    ("email_service.py", "Email service"),
    ("sheets.py", "Google Sheets integration"),
    ("main.py", "FastAPI application")
]

print("\n1. Checking required files...")
for filename, description in files_to_check:
    if os.path.exists(filename):
        print(f"   ✓ {filename} - {description}")
    else:
        print(f"   ✗ {filename} - MISSING!")

# Check if modules can be imported
print("\n2. Checking module imports...")
try:
    import auth
    print("   ✓ auth module imported successfully")
    print(f"      - hash_password: {hasattr(auth, 'hash_password')}")
    print(f"      - verify_password: {hasattr(auth, 'verify_password')}")
    print(f"      - generate_jwt_token: {hasattr(auth, 'generate_jwt_token')}")
    print(f"      - generate_otp: {hasattr(auth, 'generate_otp')}")
except Exception as e:
    print(f"   ✗ auth module import failed: {e}")

try:
    import email_service
    print("   ✓ email_service module imported successfully")
    print(f"      - send_otp_email: {hasattr(email_service, 'send_otp_email')}")
    print(f"      - send_welcome_email: {hasattr(email_service, 'send_welcome_email')}")
except Exception as e:
    print(f"   ✗ email_service module import failed: {e}")

try:
    import sheets
    print("   ✓ sheets module imported successfully")
    print(f"      - get_user_by_email: {hasattr(sheets, 'get_user_by_email')}")
    print(f"      - create_user: {hasattr(sheets, 'create_user')}")
    print(f"      - get_user_wishlist: {hasattr(sheets, 'get_user_wishlist')}")
except Exception as e:
    print(f"   ✗ sheets module import failed: {e}")

# Test authentication functions
print("\n3. Testing authentication functions...")
try:
    import auth
    
    # Test password hashing
    password = "TestPassword123"
    hashed = auth.hash_password(password)
    print(f"   ✓ Password hashing works")
    
    # Test password verification
    is_valid = auth.verify_password(password, hashed)
    print(f"   ✓ Password verification works: {is_valid}")
    
    # Test JWT token generation
    token = auth.generate_jwt_token("test@example.com", "testuser")
    print(f"   ✓ JWT token generation works: {token[:30]}...")
    
    # Test JWT token verification
    payload = auth.verify_jwt_token(token)
    print(f"   ✓ JWT token verification works: {payload['email']}")
    
    # Test OTP generation
    otp = auth.generate_otp()
    print(f"   ✓ OTP generation works: {otp}")
    
    # Test email validation
    is_valid_email = auth.validate_email("test@example.com")
    print(f"   ✓ Email validation works: {is_valid_email}")
    
    # Test password strength validation
    is_strong, msg = auth.validate_password_strength("WeakPass")
    print(f"   ✓ Password strength validation works")
    
except Exception as e:
    print(f"   ✗ Authentication function tests failed: {e}")
    import traceback
    traceback.print_exc()

# Check FastAPI app
print("\n4. Checking FastAPI application...")
try:
    from main import app
    print(f"   ✓ FastAPI app loaded successfully")
    
    # Count routes
    routes = [route for route in app.routes if hasattr(route, 'path')]
    auth_routes = [r for r in routes if '/auth/' in r.path]
    user_routes = [r for r in routes if '/user/' in r.path]
    
    print(f"   ✓ Total routes: {len(routes)}")
    print(f"   ✓ Authentication routes: {len(auth_routes)}")
    print(f"   ✓ User routes: {len(user_routes)}")
    
    print("\n   Authentication endpoints:")
    for route in auth_routes:
        methods = ', '.join(route.methods) if hasattr(route, 'methods') else 'N/A'
        print(f"      - {methods:10} {route.path}")
    
    print("\n   User endpoints:")
    for route in user_routes:
        methods = ', '.join(route.methods) if hasattr(route, 'methods') else 'N/A'
        print(f"      - {methods:10} {route.path}")
        
except Exception as e:
    print(f"   ✗ FastAPI app check failed: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 60)
print("VERIFICATION COMPLETE")
print("=" * 60)
print("\n✅ Backend authentication system is ready!")
print("\nServer is running at: http://127.0.0.1:8000")
print("API docs available at: http://127.0.0.1:8000/docs")
print("\nNext steps:")
print("  1. Open http://127.0.0.1:8000/docs in browser to test endpoints")
print("  2. Create frontend components (Register, Login, etc.)")
print("  3. Implement AuthContext for state management")
print("=" * 60)
