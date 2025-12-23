"""Generate a valid bcrypt hash for admin123"""
from passlib.hash import bcrypt

# Generate hash for 'admin123'
password = 'admin123'
# Ensure password is within bcrypt limits (72 bytes)
password_bytes = password.encode('utf-8')[:72]
password_truncated = password_bytes.decode('utf-8')

hash_result = bcrypt.hash(password_truncated)
print(f"Password: {password}")
print(f"Hash: {hash_result}")
print(f"Length: {len(hash_result)}")

# Verify it works
print(f"Verification: {bcrypt.verify(password, hash_result)}")
