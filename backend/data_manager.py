import json
import os
from .database import USE_SUPABASE, supabase

DATA_FILE = "match_data.json"

# ----------------------------------------------------
# LOCAL JSON HELPERS
# ----------------------------------------------------

def load_data_local():
    """Load data from JSON file (Legacy/Local)."""
    if os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, "r") as f:
                return json.load(f)
        except:
            return {}
    return {}

def save_data_local(data):
    """Save data to JSON file (Legacy/Local)."""
    try:
        with open(DATA_FILE, "w") as f:
            json.dump(data, f, indent=4)
    except Exception as e:
        print(f"Error saving data: {e}")

# ----------------------------------------------------
# HYBRID FUNCTIONS (Route to Supabase or Local)
# ----------------------------------------------------

def get_saved_blacklist():
    if USE_SUPABASE:
        try:
            response = supabase.table("blacklist").select("*").execute()
            return [{"name": x["name"], "image": x["image"], "phase": x.get("phase"), "player": x.get("player")} for x in response.data]
        except Exception as e:
            print(f"Supabase error: {e}")
            return []
    else:
        data = load_data_local()
        return data.get("global_blacklist", [])

def save_blacklist(blacklist):
    if USE_SUPABASE:
        try:
            # Delete all and re-insert (simple strategy)
            supabase.table("blacklist").delete().neq("id", 0).execute()
            if blacklist:
                supabase.table("blacklist").insert(blacklist).execute()
        except Exception as e:
            print(f"Supabase error: {e}")
    else:
        data = load_data_local()
        data["global_blacklist"] = blacklist
        save_data_local(data)

def get_match_history():
    if USE_SUPABASE:
        try:
            response = supabase.table("match_history").select("*").execute()
            return [x["data"] for x in response.data]
        except Exception as e:
            print(f"Supabase error: {e}")
            return []
    else:
        data = load_data_local()
        return data.get("match_history", [])

def save_match_history(history):
    if USE_SUPABASE:
        try:
            # Get existing IDs
            existing = supabase.table("match_history").select("id").execute()
            existing_ids = [x["id"] for x in existing.data]
            
            # Insert only new matches
            for match in history:
                mid = match.get("id")
                if mid and mid not in existing_ids:
                    supabase.table("match_history").insert({"id": mid, "data": match}).execute()
        except Exception as e:
            print(f"Supabase error: {e}")
    else:
        data = load_data_local()
        data["match_history"] = history
        save_data_local(data)

def get_players():
    if USE_SUPABASE:
        try:
            response = supabase.table("players").select("*").execute()
            return {p["name"]: {"history": p.get("history", []), "elo": p["elo"], "pdl": p["pdl"]} for p in response.data}
        except Exception as e:
            print(f"Supabase error: {e}")
            return {}
    else:
        data = load_data_local()
        return data.get("players", {})

def save_players_local_only(players):
    """Aux helper for local mode."""
    data = load_data_local()
    data["players"] = players
    save_data_local(data)

def register_player_db(name, elo="Ferro IV", pdl=0):
    if USE_SUPABASE:
        try:
            # Check if exists
            existing = supabase.table("players").select("*").eq("name", name).execute()
            if existing.data:
                # Update
                supabase.table("players").update({"elo": elo, "pdl": pdl}).eq("name", name).execute()
            else:
                # Insert
                supabase.table("players").insert({"name": name, "elo": elo, "pdl": pdl, "history": []}).execute()
            return get_players()
        except Exception as e:
            print(f"Supabase error: {e}")
            return {}
    else:
        players = get_players()
        if name not in players:
            players[name] = {"history": [], "elo": elo, "pdl": pdl}
        else:
            players[name]["elo"] = elo
            players[name]["pdl"] = pdl
        save_players_local_only(players)
        return players

def remove_player_db(name):
    if USE_SUPABASE:
        try:
            supabase.table("players").delete().eq("name", name).execute()
            return get_players()
        except Exception as e:
            print(f"Supabase error: {e}")
            return {}
    else:
        players = get_players()
        if name in players:
            del players[name]
            save_players_local_only(players)
        return players

def update_player_data_db(name, elo=None, pdl=None):
    if USE_SUPABASE:
        try:
            updates = {}
            if elo is not None:
                updates["elo"] = elo
            if pdl is not None:
                updates["pdl"] = pdl
            if updates:
                existing = supabase.table("players").select("*").eq("name", name).execute()
                if existing.data:
                    supabase.table("players").update(updates).eq("name", name).execute()
                else:
                    register_player_db(name, elo or "Ferro IV", pdl or 0)
        except Exception as e:
            print(f"Supabase error: {e}")
    else:
        players = get_players()
        if name in players:
            if elo is not None:
                players[name]["elo"] = elo
            if pdl is not None:
                players[name]["pdl"] = pdl
            save_players_local_only(players)
        elif name not in players:
            register_player_db(name, elo or "Ferro IV", pdl or 0)

def update_player_history_db(name, champion):
    if USE_SUPABASE:
        try:
            response = supabase.table("players").select("history").eq("name", name).execute()
            if response.data:
                history = response.data[0].get("history", [])
                if champion not in history:
                    history.append(champion)
                    supabase.table("players").update({"history": history}).eq("name", name).execute()
        except Exception as e:
            print(f"Supabase error: {e}")
    else:
        players = get_players()
        if name in players:
            if champion not in players[name]["history"]:
                players[name]["history"].append(champion)
                save_players_local_only(players)

def clear_saved_data():
    if USE_SUPABASE:
        try:
            supabase.table("match_history").delete().neq("id", 0).execute()
            supabase.table("players").delete().neq("name", "").execute()
            supabase.table("blacklist").delete().neq("id", 0).execute()
        except Exception as e:
            print(f"Supabase error: {e}")
    else:
        if os.path.exists(DATA_FILE):
            try:
                os.remove(DATA_FILE)
            except:
                pass
