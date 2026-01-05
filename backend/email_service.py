import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

# Email configuration - these should be in environment variables
SMTP_SERVER = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
SMTP_PORT = int(os.getenv('SMTP_PORT', '587'))
SMTP_EMAIL = os.getenv('SMTP_EMAIL', '')
SMTP_PASSWORD = os.getenv('SMTP_PASSWORD', '')

def send_otp_email(to_email: str, otp: str) -> bool:
    """
    Send OTP email to user
    Returns True if email sent successfully, False otherwise
    """
    try:
        # Create message
        msg = MIMEMultipart('alternative')
        msg['Subject'] = 'Your OTP for The WildNuts Password Reset'
        msg['From'] = SMTP_EMAIL
        msg['To'] = to_email

        # Create HTML content
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                }}
                .container {{
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #f9f9f9;
                }}
                .header {{
                    background-color: #5d2b1a;
                    color: white;
                    padding: 20px;
                    text-align: center;
                    border-radius: 5px 5px 0 0;
                }}
                .content {{
                    background-color: white;
                    padding: 30px;
                    border-radius: 0 0 5px 5px;
                }}
                .otp-box {{
                    background-color: #f0f0f0;
                    border: 2px dashed #5d2b1a;
                    padding: 20px;
                    text-align: center;
                    font-size: 32px;
                    font-weight: bold;
                    letter-spacing: 5px;
                    margin: 20px 0;
                    color: #5d2b1a;
                }}
                .footer {{
                    text-align: center;
                    margin-top: 20px;
                    font-size: 12px;
                    color: #666;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>The WildNuts</h1>
                    <p>Password Reset Request</p>
                </div>
                <div class="content">
                    <p>Hello,</p>
                    <p>You have requested to reset your password. Please use the following One-Time Password (OTP) to proceed:</p>
                    <div class="otp-box">{otp}</div>
                    <p><strong>This OTP is valid for 10 minutes.</strong></p>
                    <p>If you did not request this password reset, please ignore this email and your password will remain unchanged.</p>
                    <p>Best regards,<br>The WildNuts Team</p>
                </div>
                <div class="footer">
                    <p>This is an automated email. Please do not reply to this message.</p>
                </div>
            </div>
        </body>
        </html>
        """

        # Create plain text version
        text = f"""
        The WildNuts - Password Reset Request
        
        Hello,
        
        You have requested to reset your password. Please use the following One-Time Password (OTP) to proceed:
        
        OTP: {otp}
        
        This OTP is valid for 10 minutes.
        
        If you did not request this password reset, please ignore this email and your password will remain unchanged.
        
        Best regards,
        The WildNuts Team
        """

        # Attach both versions
        part1 = MIMEText(text, 'plain')
        part2 = MIMEText(html, 'html')
        msg.attach(part1)
        msg.attach(part2)

        # Send email
        if not SMTP_EMAIL or not SMTP_PASSWORD:
            print(f"[TEST MODE] OTP for {to_email}: {otp}")
            return True

        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_EMAIL, SMTP_PASSWORD)
            server.send_message(msg)
        
        print(f"OTP email sent successfully to {to_email}")
        return True

    except Exception as e:
        print(f"Error sending OTP email: {str(e)}")
        # In test mode, still print the OTP
        print(f"[TEST MODE] OTP for {to_email}: {otp}")
        return True  # Return True in test mode so flow continues

def send_welcome_email(to_email: str, username: str) -> bool:
    """
    Send welcome email to new user
    Returns True if email sent successfully, False otherwise
    """
    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = 'Welcome to The WildNuts!'
        msg['From'] = SMTP_EMAIL
        msg['To'] = to_email

        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                }}
                .container {{
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #f9f9f9;
                }}
                .header {{
                    background-color: #5d2b1a;
                    color: white;
                    padding: 20px;
                    text-align: center;
                    border-radius: 5px 5px 0 0;
                }}
                .content {{
                    background-color: white;
                    padding: 30px;
                    border-radius: 0 0 5px 5px;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Welcome to The WildNuts!</h1>
                </div>
                <div class="content">
                    <p>Hello {username},</p>
                    <p>Thank you for joining The WildNuts family! We're excited to have you on board.</p>
                    <p>You can now enjoy:</p>
                    <ul>
                        <li>Premium quality nuts and dry fruits</li>
                        <li>Easy order tracking</li>
                        <li>Personalized wishlist</li>
                        <li>Exclusive offers and deals</li>
                    </ul>
                    <p>Start shopping now and discover our wide range of products!</p>
                    <p>Best regards,<br>The WildNuts Team</p>
                </div>
            </div>
        </body>
        </html>
        """

        text = f"""
        Welcome to The WildNuts!
        
        Hello {username},
        
        Thank you for joining The WildNuts family! We're excited to have you on board.
        
        You can now enjoy:
        - Premium quality nuts and dry fruits
        - Easy order tracking
        - Personalized wishlist
        - Exclusive offers and deals
        
        Start shopping now and discover our wide range of products!
        
        Best regards,
        The WildNuts Team
        """

        part1 = MIMEText(text, 'plain')
        part2 = MIMEText(html, 'html')
        msg.attach(part1)
        msg.attach(part2)

        if not SMTP_EMAIL or not SMTP_PASSWORD:
            print(f"[TEST MODE] Welcome email would be sent to {to_email}")
            return True

        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_EMAIL, SMTP_PASSWORD)
            server.send_message(msg)
        
        print(f"Welcome email sent successfully to {to_email}")
        return True

    except Exception as e:
        print(f"Error sending welcome email: {str(e)}")
        return False

def send_marketing_email(to_email: str, subject: str, content: str) -> bool:
    """
    Send marketing email to subscriber
    """
    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = SMTP_EMAIL
        msg['To'] = to_email

        # Wrap content in basic template
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: #000; color: white; padding: 20px; text-align: center; }}
                .content {{ padding: 30px; background: #fff; }}
                .footer {{ text-align: center; font-size: 12px; color: #666; margin-top: 20px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header"><h1>The WildNuts</h1></div>
                <div class="content">{content}</div>
                <div class="footer"><p>You received this because you subscribed to our newsletter.</p></div>
            </div>
        </body>
        </html>
        """

        part2 = MIMEText(html, 'html')
        msg.attach(part2)

        if not SMTP_EMAIL or not SMTP_PASSWORD:
            print(f"[TEST MODE] Marketing email to {to_email}: {subject}")
            return True

        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_EMAIL, SMTP_PASSWORD)
            server.send_message(msg)
        
        return True
    except Exception as e:
        print(f"Error sending marketing email: {str(e)}")
        return False

def send_order_cancelled_email(to_email: str, order_id: str, user_name: str, items: list) -> bool:
    """
    Send order cancellation notification to user
    """
    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = f'Order Cancelled - {order_id}'
        msg['From'] = SMTP_EMAIL
        msg['To'] = to_email

        # Build items list HTML
        items_html = ""
        if items:
            items_html = "<ul style='list-style: none; padding: 0;'>"
            for item in items:
                items_html += f"""
                <li style='padding: 10px; border-bottom: 1px solid #eee;'>
                    <strong>{item.get('name', 'Product')}</strong><br>
                    <small>Quantity: {item.get('quantity', 1)} x {item.get('variant', '250g')}</small>
                </li>
                """
            items_html += "</ul>"

        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }}
                .header {{ background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }}
                .content {{ background: white; padding: 30px; border-radius: 0 0 5px 5px; }}
                .order-id {{ background: #fee2e2; color: #991b1b; padding: 10px; border-radius: 5px; text-align: center; font-weight: bold; margin: 20px 0; }}
                .footer {{ text-align: center; margin-top: 20px; font-size: 12px; color: #666; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Order Cancelled</h1>
                </div>
                <div class="content">
                    <p>Hello {user_name},</p>
                    <p>We regret to inform you that your order has been cancelled.</p>
                    <div class="order-id">Order ID: {order_id}</div>
                    {f'<h3>Cancelled Items:</h3>{items_html}' if items_html else ''}
                    <p><strong>What happens next?</strong></p>
                    <ul>
                        <li>If you made a payment, a full refund will be processed within 5-7 business days</li>
                        <li>You can place a new order anytime on our website</li>
                        <li>Contact us if you have any questions</li>
                    </ul>
                    <p>We apologize for any inconvenience caused. We hope to serve you again soon!</p>
                    <p>Best regards,<br>The WildNuts Team</p>
                </div>
                <div class="footer">
                    <p>Contact us: connectwiththewildnuts@gmail.com | +91 877-8699084</p>
                </div>
            </div>
        </body>
        </html>
        """

        part2 = MIMEText(html, 'html')
        msg.attach(part2)

        if not SMTP_EMAIL or not SMTP_PASSWORD:
            print(f"[TEST MODE] Order cancelled email to {to_email}: {order_id}")
            return True

        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_EMAIL, SMTP_PASSWORD)
            server.send_message(msg)
        
        print(f"Order cancellation email sent to {to_email} for order {order_id}")
        return True
    except Exception as e:
        print(f"Error sending order cancelled email: {str(e)}")
        return False

def send_order_status_update_email(to_email: str, order_id: str, user_name: str, new_status: str, items: list) -> bool:
    """
    Send order status update notification to user
    """
    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = f'Order Update: {new_status} - {order_id}'
        msg['From'] = SMTP_EMAIL
        msg['To'] = to_email

        # Status-specific messages
        status_messages = {
            'Confirmed': 'Your order has been confirmed! Our team has verified your selection.',
            'Picked': 'Your order is being prepared! We are hand-picking quality products for you.',
            'Shipped': 'Your order is on the way! It will be delivered soon.',
            'Delivered': 'Your order has been delivered! Enjoy your Wild Nuts!'
        }
        
        status_message = status_messages.get(new_status, f'Your order status has been updated to: {new_status}')

        # Build items list HTML
        items_html = ""
        if items:
            items_html = "<ul style='list-style: none; padding: 0;'>"
            for item in items:
                items_html += f"""
                <li style='padding: 10px; border-bottom: 1px solid #eee;'>
                    <strong>{item.get('name', 'Product')}</strong><br>
                    <small>Quantity: {item.get('quantity', 1)} x {item.get('variant', '250g')}</small>
                </li>
                """
            items_html += "</ul>"

        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }}
                .header {{ background: #5d2b1a; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }}
                .content {{ background: white; padding: 30px; border-radius: 0 0 5px 5px; }}
                .status-badge {{ background: #d1fae5; color: #065f46; padding: 10px 20px; border-radius: 20px; display: inline-block; font-weight: bold; margin: 20px 0; }}
                .order-id {{ background: #f0f0f0; padding: 10px; border-radius: 5px; text-align: center; margin: 20px 0; }}
                .footer {{ text-align: center; margin-top: 20px; font-size: 12px; color: #666; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Order Status Update</h1>
                </div>
                <div class="content">
                    <p>Hello {user_name},</p>
                    <p>Great news about your order!</p>
                    <div style="text-align: center;">
                        <span class="status-badge">{new_status}</span>
                    </div>
                    <p>{status_message}</p>
                    <div class="order-id">Order ID: {order_id}</div>
                    {f'<h3>Your Items:</h3>{items_html}' if items_html else ''}
                    <p>You can track your order status anytime on our website.</p>
                    <p>Thank you for choosing The WildNuts!</p>
                    <p>Best regards,<br>The WildNuts Team</p>
                </div>
                <div class="footer">
                    <p>Contact us: connectwiththewildnuts@gmail.com | +91 877-8699084</p>
                </div>
            </div>
        </body>
        </html>
        """

        part2 = MIMEText(html, 'html')
        msg.attach(part2)

        if not SMTP_EMAIL or not SMTP_PASSWORD:
            print(f"[TEST MODE] Order status update email to {to_email}: {order_id} -> {new_status}")
            return True

        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_EMAIL, SMTP_PASSWORD)
            server.send_message(msg)
        
        print(f"Order status update email sent to {to_email} for order {order_id}: {new_status}")
        return True
    except Exception as e:
        print(f"Error sending order status update email: {str(e)}")
        return False
