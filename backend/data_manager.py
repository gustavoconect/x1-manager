import os
import json
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

class DataManager:
    def __init__(self):
        self.client = None
        if SUPABASE_URL and SUPABASE_KEY:
            try:
                self.client = create_client(SUPABASE_URL, SUPABASE_KEY)
                print("DataManager: Connected to Supabase Cloud")
            except Exception as e:
                print(f"DataManager: Connection Error: {e}")
        
    def load_json(self, filename, default=None):
        if os.path.exists(filename):
            try:
                with open(filename, "r", encoding='utf-8') as f:
                    return json.load(f)
            except:
                pass
        return default

    def save_json(self, filename, data):
        try:
            with open(filename, "w", encoding='utf-8') as f:
                json.dump(data, f, indent=4)
        except Exception as e:
            print(f"Local Save Error: {e}")

    # --- Players ---
    def get_players(self):
        if self.client:
            try:
                res = self.client.table("players").select("*").execute()
                players = {}
                for row in res.data:
                    p_name = row['name']
                    players[p_name] = {
                        "elo": row.get('elo'),
                        "pdl": row.get('pdl'),
                        "wins": row.get('wins', 0),
                        "losses": row.get('losses', 0),
                        "history": row.get('history', [])
                    }
                return players
            except Exception as e:
                print(f"Supabase Read Error (Players): {e}")
        
        data = self.load_json("match_data.json", {})
        return data.get("players", {})

    def save_players(self, players_data):
        # Local Backup
        full_data = self.load_json("match_data.json", {})
        full_data["players"] = players_data
        self.save_json("match_data.json", full_data)

        if self.client:
            try:
                rows = []
                for name, info in players_data.items():
                    rows.append({
                        "name": name,
                        "elo": info.get("elo"),
                        "pdl": info.get("pdl"),
                        "wins": info.get("wins", 0),
                        "losses": info.get("losses", 0),
                        "history": info.get("history", [])
                    })
                self.client.table("players").upsert(rows).execute()
            except Exception as e:
                print(f"Supabase Write Error (Players): {e}")

    # --- Match History ---
    def get_match_history(self):
        if self.client:
            try:
                # Order by ID
                res = self.client.table("match_history").select("*").order("id", desc=False).execute()
                history = []
                for row in res.data:
                    # Prefer 'data' jsonb column
                    if 'data' in row and row['data']:
                        history.append(row['data'])
                    else:
                        # Fallback for legacy columns if they exist
                        # But our app relies on complex JSON
                        pass
                return history
            except Exception as e:
                print(f"Supabase Read Error (History): {e}")
        
        data = self.load_json("match_data.json", {})
        return data.get("match_history", [])

    def save_match_history(self, history_data):
        full_data = self.load_json("match_data.json", {})
        full_data["match_history"] = history_data
        self.save_json("match_data.json", full_data)

        if self.client:
            try:
                rows = []
                for match in history_data:
                    rows.append({
                        "id": match.get("id"),
                        "data": match
                    })
                self.client.table("match_history").upsert(rows).execute()
            except Exception as e:
                print(f"Supabase Write Error (History): {e} - Ensure 'match_history' has a JSONB column named 'data'")

    # --- Blacklist ---
    def get_blacklist(self):
        if self.client:
            try:
                res = self.client.table("blacklist").select("*").execute()
                return res.data
            except Exception as e:
                print(f"Supabase Read Error (Blacklist): {e}")
        
        data = self.load_json("match_data.json", {})
        return data.get("global_blacklist", [])

    def save_blacklist(self, blacklist_data):
        full_data = self.load_json("match_data.json", {})
        full_data["global_blacklist"] = blacklist_data
        self.save_json("match_data.json", full_data)

        if self.client:
            try:
                # STRATEGY CHANGE: Always Wipe and Rewrite to prevent ID conflicts and Duplicates
                # 1. Delete all existing entries
                self.client.table("blacklist").delete().neq("id", -1).execute()
                
                # 2. Insert new data (strip IDs if present to let DB auto-gen new ones)
                if blacklist_data:
                    clean_data = []
                    for item in blacklist_data:
                        # Create copy without 'id' to ensure auto-increment works
                        clean_item = {k: v for k, v in item.items() if k != 'id'}
                        clean_data.append(clean_item)
                        
                    self.client.table("blacklist").insert(clean_data).execute()
                    
            except Exception as e:
                 print(f"Supabase Write Error (Blacklist): {e}")

    def clear_all_data(self):
        # 1. Reset Local Data (Keep players but clear their history)
        players = self.get_players()
        for p in players:
            players[p]["history"] = [] # Wipe history
            
        self.save_json("match_data.json", {"players": players})

        # 2. Clear Supabase
        if self.client:
            try:
                # Delete all matches
                self.client.table("match_history").delete().gt("id", -1).execute()
            except Exception as e:
                print(f"Supabase Clear Error (History): {e}")

            try:
                # Delete all blacklist
                self.client.table("blacklist").delete().neq("name", "").execute()
            except Exception as e:
                print(f"Supabase Clear Error (Blacklist): {e}")
            
            try:
                # Update Players (Reset history to empty list)
                rows = []
                for name, info in players.items():
                    rows.append({
                        "name": name,
                        "elo": info.get("elo"),
                        "pdl": info.get("pdl"),
                        "wins": info.get("wins", 0),
                        "losses": info.get("losses", 0),
                        "history": [] # Explicitly empty
                    })
                self.client.table("players").upsert(rows).execute()
            except Exception as e:
                 print(f"Supabase Clear Error (Players History): {e}")

    def rebuild_blacklist_from_history(self):
        """Source of Truth: Rebuild blacklist table entirely from Match History."""
        print("DataManager: Rebuilding Blacklist from History...")
        history = self.get_match_history()
        
        # Calculate Blacklist
        new_blacklist = []
        seen_names = set()
        
        CDN_URL = "https://ddragon.leagueoflegends.com/cdn/15.24.1/img/champion/" # Fallback
        
        for match in history:
            # Only count GROUPS phase
            if match.get("phase") == "Groups" or (not match.get("phase") and 'game_1' in match):
                 for key in ['game_1', 'game_2']:
                     game = match.get(key, {})
                     champ = game.get('champion')
                     if champ and champ not in seen_names:
                         image = game.get('image')
                         if not image:
                             clean = champ.replace(" ", "").replace("'", "").replace(".", "")
                             image = f"{CDN_URL}{clean}.png"
                             
                         new_blacklist.append({
                             "name": champ,
                             "image": image,
                             "phase": "Groups",
                             "player": "HistoryDerived"
                         })
                         seen_names.add(champ)
        
        # Save to DB (caches it)
        print(f"DataManager: Derived {len(new_blacklist)} bans from history.")
        self.save_blacklist(new_blacklist)
        return new_blacklist

db = DataManager()

# --- Wrapper Functions for game_logic.py ---

def rebuild_blacklist_from_history():
    return db.rebuild_blacklist_from_history()

def get_saved_blacklist():
    return db.get_blacklist()


def save_blacklist(data):
    db.save_blacklist(data)

def get_match_history():
    return db.get_match_history()

def save_match_history(data):
    db.save_match_history(data)

def get_players():
    return db.get_players()

def register_player_db(name, elo, pdl):
    players = db.get_players()
    if name in players:
        players[name]["elo"] = elo
        players[name]["pdl"] = pdl
    else:
        players[name] = {"elo": elo, "pdl": pdl, "wins": 0, "losses": 0, "history": []}
    db.save_players(players)

def remove_player_db(name):
    players = db.get_players()
    if name in players:
        del players[name]
        # In Supabase, delete row? Or just update local?
        # Upsert wont delete. Explicit delete needed.
        if db.client:
            try:
                db.client.table("players").delete().eq("name", name).execute()
            except: pass
        db.save_players(players)

def update_player_history_db(name, match_entry):
    players = db.get_players()
    if name in players:
        players[name]["history"].append(match_entry)
        db.save_players(players)

def update_player_data_db(name, wins=0, losses=0):
    players = db.get_players()
    if name in players:
        players[name]["wins"] += wins
        players[name]["losses"] += losses
        db.save_players(players)

def clear_saved_data():
    """Clear match history and blacklist from both local and cloud storage."""
    db.clear_all_data()
