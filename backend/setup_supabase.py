"""
Quick setup script to configure Supabase
Run this after setting up your Supabase project
"""

import secrets

print("=" * 60)
print("SUPABASE SETUP HELPER")
print("=" * 60)
print()

# Generate JWT secret
jwt_secret = secrets.token_urlsafe(32)

print("📋 Add these to your backend/.env file:")
print()
print("# Supabase Configuration")
print("SUPABASE_URL=https://picnasfotuwukiggoomn.supabase.co")
print(f"SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpY25hc2ZvdHd1d2tpZ2dvb21uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0NDU2NjksImV4cCI6MjA4MTAyMTY2OX0.IR7MJ8-lYTynKRagrYiTeR_fZDgpJk-MJ2Yw_Bzv640")
print(f"JWT_SECRET_KEY={jwt_secret}")
print()
print("=" * 60)
print()
print("✅ Next steps:")
print("1. Copy the above lines to backend/.env")
print("2. Run the SQL schema in Supabase SQL Editor")
print("   - Go to: https://app.supabase.com/project/picnasfotuwukiggoomn/sql")
print("   - Copy contents of supabase_schema.sql")
print("   - Paste and run")
print("3. Enable Email auth in Supabase")
print("   - Go to: https://app.supabase.com/project/picnasfotuwukiggoomn/auth/providers")
print("   - Enable Email provider")
print("4. Restart your backend server")
print()
print("=" * 60)
