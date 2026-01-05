from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Optional
import sheets
import auth
import email_service
import uvicorn
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Admin Credentials
ADMIN_KEY = os.getenv("ADMIN_PASSWORD", "Cantgetme@1") 
ADMIN_IDENTIFIER = os.getenv("ADMIN_EMAIL", "connectwiththewildnuts@gmail.com")

app = FastAPI(title="The Wild Nuts API")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================
# Pydantic Models
# ============================================

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    identifier: str  # Can be email or username
    password: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp: str

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp: str
    new_password: str

class UpdateProfileRequest(BaseModel):
    username: Optional[str] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None

# ============================================
# Helper Functions
# ============================================

def verify_token(authorization: Optional[str] = Header(None)):
    """Verify JWT token from Authorization header"""
    if not authorization:
        print("DEBUG: No authorization header")
        raise HTTPException(status_code=401, detail="No authorization token provided")
    
    try:
        # Extract token from "Bearer <token>"
        token = authorization.replace("Bearer ", "")
        # print(f"DEBUG: Verifying token: {token[:10]}...") 
        payload = auth.verify_jwt_token(token)
        
        if not payload:
            print("DEBUG: verify_jwt_token returned None")
            raise HTTPException(status_code=401, detail="Invalid or expired token")
        
        return payload
    except Exception as e:
        print(f"DEBUG: Token verification failed: {str(e)}")
        raise HTTPException(status_code=401, detail="Invalid authorization token")

# ============================================
# Authentication Endpoints
# ============================================

@app.post("/api/auth/register")
async def register(request: RegisterRequest):
    """Register a new user"""
    # Validate email format
    if not auth.validate_email(request.email):
        raise HTTPException(status_code=400, detail="Invalid email format")
    
    # Validate password strength
    is_valid, message = auth.validate_password_strength(request.password)
    if not is_valid:
        raise HTTPException(status_code=400, detail=message)
    
    # Check if user already exists
    existing_user = sheets.get_user_by_email(request.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password
    password_hash = auth.hash_password(request.password)
    
    # Create user
    result = sheets.create_user(request.email, password_hash)
    
    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])
    
    # Send welcome email
    email_service.send_welcome_email(request.email, request.email.split('@')[0])
    
    # Generate JWT token
    token = auth.generate_jwt_token(request.email)
    
    return {
        "success": True,
        "token": token,
        "email": request.email,
        "profile_complete": False,
        "message": "Registration successful. Please complete your profile."
    }

@app.post("/api/auth/login")
async def login(request: LoginRequest):
    """Login with email or username"""
    
    # Check for Admin Override
    if request.identifier == ADMIN_IDENTIFIER and request.password == ADMIN_KEY:
         token = auth.generate_jwt_token(ADMIN_IDENTIFIER, "admin")
         return {
             "success": True,
             "token": token,
             "email": ADMIN_IDENTIFIER,
             "username": "Admin",
             "role": "admin",
             "profile_complete": True,
             "user": {
                 "email": ADMIN_IDENTIFIER,
                 "username": "Admin",
                 "full_name": "Administrator"
             }
         }

    # Try to find user by email or username
    user = None
    
    if "@" in request.identifier:
        # It's an email
        user = sheets.get_user_by_email(request.identifier)
    else:
        # It's a username
        user = sheets.get_user_by_username(request.identifier)
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Verify password
    if not auth.verify_password(request.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Generate new session token
    session_token = auth.generate_session_token()
    sheets.update_session_token(user["email"], session_token)
    
    # Generate JWT token
    token = auth.generate_jwt_token(user["email"], user.get("username"))
    
    return {
        "success": True,
        "token": token,
        "email": user["email"],
        "username": user.get("username"),
        "profile_complete": user.get("profile_complete") == "true",
        "user": {
            "email": user["email"],
            "username": user.get("username"),
            "full_name": user.get("full_name"),
            "phone": user.get("phone"),
            "address": user.get("address"),
            "city": user.get("city"),
            "state": user.get("state"),
            "pincode": user.get("pincode")
        }
    }

@app.post("/api/auth/logout")
async def logout(authorization: Optional[str] = Header(None)):
    """Logout user"""
    payload = verify_token(authorization)
    
    # Clear session token
    sheets.update_session_token(payload["email"], "")
    
    return {"success": True, "message": "Logged out successfully"}

@app.post("/api/auth/forgot-password")
async def forgot_password(request: ForgotPasswordRequest):
    """Request OTP for password reset"""
    # Check if user exists
    user = sheets.get_user_by_email(request.email)
    if not user:
        # Don't reveal if email exists or not for security
        return {"success": True, "message": "If the email exists, an OTP has been sent"}
    
    # Generate OTP
    otp = auth.generate_otp()
    
    # Store OTP
    result = sheets.store_otp(request.email, otp)
    
    if "error" in result:
        raise HTTPException(status_code=500, detail="Failed to generate OTP")
    
    # Send OTP email
    email_service.send_otp_email(request.email, otp)
    
    return {"success": True, "message": "OTP sent to your email"}

@app.post("/api/auth/verify-otp")
async def verify_otp(request: VerifyOTPRequest):
    """Verify OTP"""
    result = sheets.verify_otp(request.email, request.otp)
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return {"success": True, "message": "OTP verified successfully"}

@app.post("/api/auth/reset-password")
async def reset_password(request: ResetPasswordRequest):
    """Reset password with OTP"""
    # Verify OTP first
    otp_result = sheets.verify_otp(request.email, request.otp)
    
    if "error" in otp_result:
        raise HTTPException(status_code=400, detail=otp_result["error"])
    
    # Validate new password
    is_valid, message = auth.validate_password_strength(request.new_password)
    if not is_valid:
        raise HTTPException(status_code=400, detail=message)
    
    # Hash new password
    new_password_hash = auth.hash_password(request.new_password)
    
    # Update password
    result = sheets.update_password_hash(request.email, new_password_hash)
    
    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])
    
    return {"success": True, "message": "Password reset successfully"}

# ============================================
# Admin Endpoints (Secure Gateway)
# ============================================

class AdminLoginRequest(BaseModel):
    identifier: str
    security_key: str

@app.post("/api/admin/login")
async def admin_login(request: AdminLoginRequest):
    """Secure Admin Login"""
    if request.identifier == ADMIN_IDENTIFIER and request.security_key == ADMIN_KEY:
        # Generate a special admin token (long-lived or specific scope)
        # For simplicity reusing JWT gen but with admin claim potentially
        # For now, just a standard token but client knows it's admin
        # You might want a separate secret for admin tokens to distinguish them
        token = auth.generate_jwt_token("admin@thewildnuts.com", "admin")
        
        return {
            "success": True,
            "token": token,
            "message": "Access Granted"
        }
    else:
        # Generic error to prevent enumeration
        raise HTTPException(status_code=401, detail="Invalid Security Credentials")

@app.get("/api/admin/stats")
async def get_admin_stats(authorization: Optional[str] = Header(None)):
    """Get aggregated stats for dashboard"""
    # Verify token
    try:
        payload = verify_token(authorization)
        # Optional: Strict check if email matches admin
        if payload["email"] != ADMIN_IDENTIFIER and payload["email"] != "admin@thewildnuts.com":
             pass # For now allow any valid token for demo or enforce strictly
             # raise HTTPException(status_code=403, detail="Admin access required")
    except:
        raise HTTPException(status_code=401, detail="Unauthorized")

    orders = sheets.get_all_orders()
    users = sheets.get_all_users()
    
    total_revenue = 0
    completed_orders_count = 0
    recent_orders = []
    
    for order in orders:
        # Only count revenue from completed/delivered orders
        tracking_stage = order.get('Tracking_Stage', '').lower()
        
        # Skip cancelled orders
        if tracking_stage == 'cancelled':
            continue
            
        # Only count delivered orders for revenue
        if tracking_stage == 'delivered':
            try:
                # Clean amount string "₹ 1,200" -> 1200
                amount_str = str(order.get('Total_Amount', 0))
                clean_amount = ''.join(filter(str.isdigit, amount_str))
                total_revenue += int(clean_amount) if clean_amount else 0
                completed_orders_count += 1
            except:
                pass

    # Simple aggregated data
    return {
        "revenue": total_revenue,
        "orders_count": len(orders),  # Total orders (including all statuses)
        "completed_orders": completed_orders_count,  # Only delivered orders
        "customers_count": len(users),
        "conversion_rate": round((len(orders) / len(users) * 100), 1) if users else 0,
        "recent_orders": orders[-5:] if orders else [] # Last 5 orders
    }

class UpdateStatusRequest(BaseModel):
    status: str

@app.put("/api/orders/{order_id}/status")
async def update_order_status_api(
    order_id: str,
    request: UpdateStatusRequest,
    authorization: Optional[str] = Header(None)
):
    """Update order status and send email notification to user"""
    # Verify Admin Token
    try:
        payload = verify_token(authorization)
        # Optional: Check if admin
    except:
        raise HTTPException(status_code=401, detail="Unauthorized")

    # Get order details before updating (to send email)
    order = sheets.get_order_by_id(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Update the status
    result = sheets.update_order_status(order_id, request.status)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    # Send email notification to user
    try:
        user_email = order.get('Email', '')
        user_name = order.get('Name', 'Customer')
        
        # Parse items from order (Items column contains JSON string)
        items = []
        if order.get('Items'):
            import json
            try:
                items = json.loads(order.get('Items', '[]'))
            except:
                items = []
        
        if user_email:
            # Send appropriate email based on status
            if request.status.lower() == 'cancelled':
                email_service.send_order_cancelled_email(
                    to_email=user_email,
                    order_id=order_id,
                    user_name=user_name,
                    items=items
                )
            else:
                email_service.send_order_status_update_email(
                    to_email=user_email,
                    order_id=order_id,
                    user_name=user_name,
                    new_status=request.status,
                    items=items
                )
    except Exception as e:
        # Log error but don't fail the status update
        print(f"Error sending order status email: {str(e)}")
        
    return result

@app.get("/api/admin/orders")
async def get_admin_orders(authorization: Optional[str] = Header(None)):
    """Get all orders for admin"""
    # Verify Admin Token
    try:
        verify_token(authorization)
    except:
        raise HTTPException(status_code=401, detail="Unauthorized")

    orders = sheets.get_all_orders()
    # Reverse to show newest first
    return {"orders": orders[::-1]}

# ============================================
# Marketing & Catalog Endpoints
# ============================================

class SubscribeRequest(BaseModel):
    email: EmailStr

@app.post("/api/subscribe")
async def subscribe(request: SubscribeRequest):
    """Subscribe to newsletter"""
    # Basic validation
    if not auth.validate_email(request.email):
         raise HTTPException(status_code=400, detail="Invalid email")
         
    result = sheets.store_subscriber(request.email)
    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])
        
    return result

@app.get("/api/admin/subscribers")
async def get_subscribers(authorization: Optional[str] = Header(None)):
    """Get all subscribers"""
    try:
        verify_token(authorization)
    except:
        raise HTTPException(status_code=401, detail="Unauthorized")
        
    return sheets.get_all_subscribers()

class ProductOfferRequest(BaseModel):
    is_offer: bool

@app.put("/api/products/{id}/offer")
async def update_offer(id: str, request: ProductOfferRequest, authorization: Optional[str] = Header(None)):
    """Toggle product special offer"""
    try:
        verify_token(authorization)
    except:
        raise HTTPException(status_code=401, detail="Unauthorized")
        
    result = sheets.update_product_offer(id, request.is_offer)
    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])
    return result

class MarketingEmailRequest(BaseModel):
    subject: str
    content: str
    test_mode: bool = False

@app.post("/api/marketing/send")
async def send_marketing(request: MarketingEmailRequest, authorization: Optional[str] = Header(None)):
    """Send marketing blast"""
    try:
        verify_token(authorization)
    except:
        raise HTTPException(status_code=401, detail="Unauthorized")
        
    subscribers = sheets.get_all_subscribers()
    count = 0
    
    for sub in subscribers:
        email = sub.get("Email")
        if email:
            if request.test_mode:
                # In test mode only send to first 3 or specific
                if count >= 1: break 
            
            email_service.send_marketing_email(email, request.subject, request.content)
            count += 1
            
    return {"success": True, "sent_count": count}



# ============================================
# User Profile Endpoints
# ============================================

@app.get("/api/user/profile")
async def get_profile(authorization: Optional[str] = Header(None)):
    """Get user profile"""
    payload = verify_token(authorization)
    
    user = sheets.get_user_by_email(payload["email"])
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "email": user["email"],
        "username": user.get("username"),
        "full_name": user.get("full_name"),
        "phone": user.get("phone"),
        "address": user.get("address"),
        "city": user.get("city"),
        "state": user.get("state"),
        "pincode": user.get("pincode"),
        "profile_complete": user.get("profile_complete") == "true"
    }

@app.put("/api/user/profile")
async def update_profile(
    request: UpdateProfileRequest,
    authorization: Optional[str] = Header(None)
):
    """Update user profile"""
    payload = verify_token(authorization)
    
    # If username is being set, validate it
    if request.username:
        is_valid, message = auth.validate_username(request.username)
        if not is_valid:
            raise HTTPException(status_code=400, detail=message)
        
        # Check if username is already taken
        existing_user = sheets.get_user_by_username(request.username)
        if existing_user and existing_user["email"] != payload["email"]:
            raise HTTPException(status_code=400, detail="Username already taken")
    
    # Update profile
    result = sheets.update_user_profile_auth(
        payload["email"],
        username=request.username,
        full_name=request.full_name,
        phone=request.phone,
        address=request.address,
        city=request.city,
        state=request.state,
        pincode=request.pincode
    )
    
    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])
    
    return {"success": True, "message": "Profile updated successfully"}

# ============================================
# Wishlist Endpoints
# ============================================

@app.get("/api/user/wishlist")
async def get_wishlist(authorization: Optional[str] = Header(None)):
    """Get user's wishlist"""
    payload = verify_token(authorization)
    
    wishlist = sheets.get_user_wishlist(payload["email"])
    
    return {"wishlist": wishlist}

@app.post("/api/user/wishlist/{product_id}")
async def add_to_wishlist(
    product_id: str,
    authorization: Optional[str] = Header(None)
):
    """Add product to wishlist"""
    payload = verify_token(authorization)
    
    result = sheets.add_to_wishlist(payload["email"], product_id)
    
    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])
    
    return {"success": True, "message": "Added to wishlist"}
    
@app.get("/api/user/cart")
async def get_cart(authorization: Optional[str] = Header(None)):
    """Get user's cart history"""
    payload = verify_token(authorization)
    
    # Get cart items (IDs)
    cart_items = sheets.get_user_cart(payload["email"])
    
    # We need to hydrate these IDs with product details for the frontend
    # Fetch all products (cached)
    all_products = sheets.get_products()
    
    hydrated_cart = []
    for item in cart_items:
        # Find product details
        product = next((p for p in all_products if p["id"] == item["product_id"]), None)
        if product:
            # Merge details
            full_item = {**product, **item} 
            # item has 'product_id', 'added_at', 'id'. product has pricing etc.
            # Ensure quantity is set (default 1 if just history)
            if "quantity" not in full_item:
                full_item["quantity"] = 1
            if "variant" not in full_item:
                full_item["variant"] = "250g" # Default variant if not tracked
            hydrated_cart.append(full_item)
            
    return {"cart": hydrated_cart}

@app.post("/api/user/cart/{product_id}")
async def add_to_cart_history(
    product_id: str,
    authorization: Optional[str] = Header(None)
):
    """Add product to cart history"""
    payload = verify_token(authorization)
    
    result = sheets.add_to_cart_history(payload["email"], product_id)
    
    if "error" in result:
        # Don't fail the request if history saving fails, just log it (optional)
        # But for now let's return success with warning or just success
        print(f"Failed to save cart history: {result['error']}")
        # return HTTPException(status_code=500, detail=result["error"])
        
    return {"success": True, "message": "Added to cart history"}

@app.delete("/api/user/cart/{product_id}")
async def remove_from_cart_history(
    product_id: str,
    authorization: Optional[str] = Header(None)
):
    """Remove product from cart history"""
    payload = verify_token(authorization)
    
    result = sheets.remove_from_cart_history(payload["email"], product_id)
    
    if "error" in result:
        # Consider 404/500 based on error, but 500 is safe for generic
        # OR just return success if already gone?
        # For now, return error
        # print(f"Failed to remove from cart: {result['error']}")
        return {"success": False, "message": f"Failed: {result['error']}"}
    
    return {"success": True, "message": "Removed from cart history"}

@app.delete("/api/user/wishlist/{product_id}")
async def remove_from_wishlist(
    product_id: str,
    authorization: Optional[str] = Header(None)
):
    """Remove product from wishlist"""
    payload = verify_token(authorization)
    
    result = sheets.remove_from_wishlist(payload["email"], product_id)
    
    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])
    
    return {"success": True, "message": "Removed from wishlist"}

# ============================================
# Order History Endpoint
# ============================================

@app.get("/api/user/orders")
async def get_orders(authorization: Optional[str] = Header(None)):
    """Get user's order history"""
    payload = verify_token(authorization)
    
    orders = sheets.get_user_orders(payload["email"])
    
    return {"orders": orders}

@app.post("/api/orders")
async def create_order(
    request: dict,
    authorization: Optional[str] = Header(None)
):
    """Create a new order"""
    payload = verify_token(authorization)
    
    # Request body should contain items, total_amount, etc.
    # Add user email/name from token/profile to secure it
    order_data = request.copy()
    order_data["email"] = payload["email"]
    order_data["user_name"] = payload.get("full_name", payload.get("username", ""))
    
    result = sheets.create_order(order_data)
    
    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])
        
    return result

@app.get("/api/orders/{order_id}")
async def get_order_by_id(order_id: str):
    """Get order details by ID (public endpoint for tracking)"""
    order = sheets.get_order_by_id(order_id)
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return {"order": order}

# ============================================
# Existing Endpoints
# ============================================

@app.get("/")
async def root():
    return {"message": "Welcome to The Wild Nuts API"}

@app.get("/api/categories")
async def get_categories():
    print("Hit /api/categories")
    data = sheets.get_categories()
    print(f"Returning {len(data)} categories")
    return data

@app.get("/api/products")
async def get_products():
    print("Hit /api/products")
    data = sheets.get_products()
    print(f"Returning {len(data)} products")
    return data

@app.get("/api/brands")
async def get_brands():
    data = sheets.get_brands()
    return data

# Legacy endpoints (keeping for backward compatibility)
class OldLoginRequest(BaseModel):
    email: str
    password: str

class OldResetRequest(BaseModel):
    email: str
    new_password: str

@app.post("/api/login-password")
async def login_password(request: OldLoginRequest):
    # Try to authenticate
    user = sheets.authenticate_user(request.email, request.password)
    
    # If user not found, try to register (implicit first-time register as per user request flow)
    # "check the first time email and password"
    if "error" in user:
        if user["error"] == "User not found":
             # Auto-register
             user = sheets.register_user(request.email, request.password)
        else:
             # Wrong password
             raise HTTPException(status_code=400, detail=user["error"])
             
    if "error" in user:
        raise HTTPException(status_code=400, detail=user["error"])
        
    return user

@app.post("/api/reset-password")
async def reset_password_api(request: OldResetRequest):
    result = sheets.reset_password(request.email, request.new_password)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result

class OldUpdateProfileRequest(BaseModel):
    email: str
    name: str = ""
    phone: str = ""
    address: str = ""
    gender: str = ""
    age: str = ""

@app.post("/api/update-profile")
async def update_profile_api(request: OldUpdateProfileRequest):
    # Convert request to dict, filter out empty if needed, or pass all
    data = request.dict(exclude_unset=True)
    # Remove email from data update payload as it is key
    email = data.pop("email")
    # Make keys Title Case for sheet match if we rely on dict keys in future, 
    # but currently sheets.py uses specific args. 
    # sheets.update_user_profile expects a dict where keys match "Name", "Address" etc
    
    # Map pydantic fields to sheet usage
    profile_data = {}
    if request.name: profile_data["Name"] = request.name
    if request.phone: profile_data["Phone"] = request.phone
    if request.address: profile_data["Address"] = request.address
    if request.gender: profile_data["Gender"] = request.gender
    if request.age: profile_data["Age"] = request.age

    result = sheets.update_user_profile(email, profile_data)
    if "error" in result:
         raise HTTPException(status_code=400, detail=result["error"])
    return result

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    # Reload is useful for dev, but might not be needed in prod. Uvicorn usually handles this via CLI args in prod.
    # But for running python main.py directly:
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
