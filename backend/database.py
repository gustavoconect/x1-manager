import os
from supabase import create_client, Client

# Get Supabase credentials from environment
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Toggle: Use Supabase if credentials exist, otherwise fallback to local JSON
USE_SUPABASE = SUPABASE_URL is not None and SUPABASE_KEY is not None

supabase: Client = None

if USE_SUPABASE:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    print(f"Connected to Supabase: {SUPABASE_URL}")
else:
    print("Supabase credentials not found, using local JSON storage")
