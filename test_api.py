"""Test API authentication and clients endpoint"""
import requests
import json
import time

BASE_URL = "http://localhost:8000"

# 1. Login
print("=" * 60)
print("1. Testing login...")
print("=" * 60)
login_data = {
    "username": "admin",
    "password": "admin123"
}

response = requests.post(f"{BASE_URL}/api/auth/login", json=login_data)
print(f"Status: {response.status_code}")

if response.status_code == 200:
    token_data = response.json()
    print(json.dumps(token_data, indent=2))
    
    token = token_data["access_token"]
    print(f"\n✅ Token obtenido (primeros 50 chars): {token[:50]}...")
    print(f"   Longitud del token: {len(token)}")
    print(f"   User ID: {token_data['user_id']}")
    print(f"   Username: {token_data['username']}")
    print(f"   Rol: {token_data['rol']}")
    
    # Wait a bit
    time.sleep(1)
    
    # 2. Test clients endpoint
    print("\n" + "=" * 60)
    print("2. Testing clients endpoint...")
    print("=" * 60)
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    print(f"Headers: {headers}")
    
    response = requests.get(f"{BASE_URL}/api/clients/?skip=0&limit=10", headers=headers)
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        clients = response.json()
        print(f"✅ Clientes obtenidos: {len(clients)}")
        if clients:
            print(f"\nPrimer cliente:")
            print(json.dumps(clients[0], indent=2))
    else:
        print(f"❌ Error: {response.status_code}")
        print(f"Response: {response.text}")
else:
    print(f"❌ Login failed: {response.text}")

