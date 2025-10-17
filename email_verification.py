#!/usr/bin/env python3
"""
LuckLab AI - Email Verification Service
Sends verification codes to users and tracks IP addresses
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import random
import json
import os
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)

# Store verification codes and IPs in memory (in production, use a database)
verification_codes = {}
registered_ips = {}

# Email configuration
# DEVELOPMENT_MODE = False means it will send REAL emails!
DEVELOPMENT_MODE = False  # Using real Gmail with App Password

SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
EMAIL_ADDRESS = "Lucklabai@gmail.com"
EMAIL_PASSWORD = "fksfxeraevktvblj"  # Gmail App Password

def generate_verification_code():
    """Generate a 6-digit verification code"""
    return str(random.randint(100000, 999999))

def get_client_ip():
    """Get the real client IP address"""
    if request.headers.get('X-Forwarded-For'):
        return request.headers.get('X-Forwarded-For').split(',')[0]
    return request.remote_addr

@app.route('/api/check-ip', methods=['GET'])
def check_ip():
    """Check if this IP already has an account"""
    client_ip = get_client_ip()
    
    has_account = client_ip in registered_ips
    
    return jsonify({
        'success': True,
        'has_account': has_account,
        'ip': client_ip,
        'message': 'This IP already has an account registered' if has_account else 'IP is available for registration'
    })

@app.route('/api/send-verification', methods=['POST'])
def send_verification():
    """Send verification email"""
    try:
        data = request.json
        email = data.get('email')
        name = data.get('name')
        
        if not email or not name:
            return jsonify({'success': False, 'error': 'Email and name required'}), 400
        
        # Check IP limit
        client_ip = get_client_ip()
        if client_ip in registered_ips:
            return jsonify({
                'success': False, 
                'error': 'This IP address already has an account. Only one account per IP is allowed.'
            }), 403
        
        # Generate verification code
        code = generate_verification_code()
        
        # Store code with expiration (10 minutes)
        verification_codes[email] = {
            'code': code,
            'name': name,
            'ip': client_ip,
            'expires': (datetime.now() + timedelta(minutes=10)).isoformat()
        }
        
        # Send email OR use development mode
        if DEVELOPMENT_MODE:
            # DEVELOPMENT MODE: Skip actual email, just return the code
            print(f"🧪 DEV MODE: Verification code for {email}: {code}")
            print(f"   (Email sending skipped - DEVELOPMENT_MODE = True)")
            
            return jsonify({
                'success': True,
                'message': f'Verification code generated for {email}',
                'code_for_testing': code,
                'development_mode': True
            })
        else:
            # PRODUCTION MODE: Send actual email
            try:
                msg = MIMEMultipart('alternative')
                msg['Subject'] = f'LuckLab AI Verification Code: {code}'
                msg['From'] = EMAIL_ADDRESS
                msg['To'] = email
                
                html = f"""
                <html>
                <body style="font-family: Arial, sans-serif; background-color: #0a0a0a; color: #ffffff; padding: 40px;">
                    <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%); border: 3px solid #00ff88; border-radius: 20px; padding: 40px; box-shadow: 0 20px 60px rgba(0,255,136,0.3);">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <h1 style="color: #00ff88; font-size: 2.5rem; margin-bottom: 10px;">LuckLab AI</h1>
                            <p style="color: #fff; font-size: 1.2rem;">Email Verification</p>
                        </div>
                        
                        <div style="background: rgba(0,255,136,0.1); border: 2px solid #00ff88; border-radius: 15px; padding: 30px; text-align: center; margin-bottom: 30px;">
                            <p style="color: #fff; font-size: 1.1rem; margin-bottom: 15px;">Hi <strong>{name}</strong>!</p>
                            <p style="color: #b0b3b8; margin-bottom: 20px;">Your verification code is:</p>
                            <h2 style="color: #00ff88; font-size: 3rem; letter-spacing: 10px; margin: 20px 0; text-shadow: 0 0 20px rgba(0,255,136,0.5);">{code}</h2>
                            <p style="color: #b0b3b8; font-size: 0.9rem;">This code expires in 10 minutes</p>
                        </div>
                        
                        <div style="text-align: center; padding: 20px; background: rgba(0,0,0,0.3); border-radius: 10px;">
                            <p style="color: #b0b3b8; font-size: 0.9rem; margin-bottom: 5px;">
                                Enter this code on LuckLab AI to complete your registration
                            </p>
                            <p style="color: #666; font-size: 0.8rem; margin: 0;">
                                If you didn't request this code, please ignore this email.
                            </p>
                        </div>
                        
                        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(0,255,136,0.2); text-align: center;">
                            <p style="color: #666; font-size: 0.85rem; margin: 0;">
                                LuckLab AI - Powered by NeuroGest AI
                            </p>
                        </div>
                    </div>
                </body>
                </html>
                """
                
                msg.attach(MIMEText(html, 'html'))
                
                # Connect and send
                server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
                server.starttls()
                server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
                server.send_message(msg)
                server.quit()
                
                print(f"✅ Verification code sent to {email}: {code}")
                
                return jsonify({
                    'success': True,
                    'message': f'Verification code sent to {email}'
                })
                
            except Exception as email_error:
                print(f"❌ Error sending email: {email_error}")
                # Return error but still provide code for development
                return jsonify({
                    'success': False,
                    'error': f'Could not send email: {str(email_error)}',
                    'code_for_testing': code,  # For development troubleshooting
                    'development_mode': True
                })
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/verify-code', methods=['POST'])
def verify_code():
    """Verify the code and register the IP"""
    try:
        data = request.json
        email = data.get('email')
        code = data.get('code')
        
        if not email or not code:
            return jsonify({'success': False, 'error': 'Email and code required'}), 400
        
        # Check if code exists and is valid
        if email not in verification_codes:
            return jsonify({'success': False, 'error': 'No verification code found for this email'}), 404
        
        stored_data = verification_codes[email]
        
        # Check expiration
        if datetime.now() > datetime.fromisoformat(stored_data['expires']):
            del verification_codes[email]
            return jsonify({'success': False, 'error': 'Verification code expired. Please request a new one.'}), 400
        
        # Verify code
        if stored_data['code'] != code:
            return jsonify({'success': False, 'error': 'Invalid verification code'}), 400
        
        # Register the IP
        client_ip = get_client_ip()
        registered_ips[client_ip] = {
            'email': email,
            'name': stored_data['name'],
            'registered_at': datetime.now().isoformat()
        }
        
        # Clean up verification code
        del verification_codes[email]
        
        print(f"✅ Account verified and registered: {email} (IP: {client_ip})")
        
        return jsonify({
            'success': True,
            'message': 'Email verified successfully!',
            'ip': client_ip
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'running',
        'service': 'LuckLab Email Verification',
        'active_codes': len(verification_codes),
        'registered_ips': len(registered_ips)
    })

if __name__ == '__main__':
    print("\n" + "="*70)
    print("🔐 LuckLab AI - Email Verification Service")
    print("="*70)
    print("✅ Starting server on http://localhost:5003")
    print("📧 Email service ready")
    print("🌐 CORS enabled for frontend")
    print("="*70 + "\n")
    
    app.run(host='0.0.0.0', port=5003, debug=True)

