import os
from dotenv import load_dotenv

print("--- Running Environment Check ---")

# 1. Check the current folder Python is running from
cwd = os.getcwd()
print(f"Current Working Directory: {cwd}")

# 2. Check if a .env file exists in this folder
env_path = os.path.join(cwd, '.env')
if os.path.exists(env_path):
    print("✅ SUCCESS: .env file found at the correct location!")
else:
    print("❌ ERROR: .env file NOT found here.")
    print("      Please make sure your .env file is inside the 'backend' folder.")
    
# 3. Try to load the file and check for the specific keys
load_dotenv()

supa_url = os.getenv("SUPABASE_URL")
supa_key = os.getenv("SUPABASE_SERVICE_KEY")

print("\n--- Checking for Supabase variables ---")
if supa_url:
    print(f"✅ SUCCESS: Found SUPABASE_URL.")
else:
    print(f"❌ ERROR: SUPABASE_URL is MISSING from your .env file or is empty.")
    
if supa_key:
    print(f"✅ SUCCESS: Found SUPABASE_SERVICE_KEY.")
else:
    print(f"❌ ERROR: SUPABASE_SERVICE_KEY is MISSING from your .env file or is empty.")

print("\n--- End of Check ---")