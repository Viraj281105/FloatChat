import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

def get_supabase_client() -> Client:
    """Get Supabase client instance."""
    return create_client(SUPABASE_URL, SUPABASE_KEY)

def get_supabase_admin_client() -> Client:
    """Get Supabase admin client with service role key."""
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)