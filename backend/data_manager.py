import json
import os
from .database import USE_DB, SessionLocal, engine, Base
from .sql_models import DBPlayer, DBMatchHistory, DBBlacklist

DATA_FILE = "match_data.json"

# Auto-create tables if using DB
if USE_DB and engine:
    Base.metadata.create_all(bind=engine)

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
# HYBRID FUNCTIONS (Route to DB or Local)
# ----------------------------------------------------

def get_saved_blacklist():
    if USE_DB:
        db = SessionLocal()
        try:
            items = db.query(DBBlacklist).all()
            return [{"name": x.name, "image": x.image, "phase": x.phase, "player": x.player} for x in items]
        finally:
            db.close()
    else:
        data = load_data_local()
        return data.get("global_blacklist", [])

def save_blacklist(blacklist):
    if USE_DB:
        db = SessionLocal()
        try:
            db.query(DBBlacklist).delete() # Simple overwrite strategy for blacklist (optimization: diffs)
            for item in blacklist:
                db_item = DBBlacklist(name=item["name"], image=item["image"], phase=item.get("phase"), player=item.get("player"))
                db.add(db_item)
            db.commit()
        finally:
            db.close()
    else:
        data = load_data_local()
        data["global_blacklist"] = blacklist
        save_data_local(data)

def get_match_history():
    if USE_DB:
        db = SessionLocal()
        try:
            items = db.query(DBMatchHistory).all()
            # Restore JSON structure
            return [x.data for x in items]
        finally:
            db.close()
    else:
        data = load_data_local()
        return data.get("match_history", [])

def save_match_history(history):
    if USE_DB:
        db = SessionLocal()
        try:
            # We only append history usually, but save_match_history receives the FULL list
            # Optimized: Delete all and re-add? Or find a way to append? 
            # For simplicity/robustness in MVP: Wipe and rewrite is safest but slow. 
            # Better: Check IDs.
            # History items have "id".
            current_ids = [x.id for x in db.query(DBMatchHistory.id).all()]
            for match in history:
                mid = match.get("id")
                if mid and mid not in current_ids:
                    db.add(DBMatchHistory(id=mid, data=match))
            db.commit()
        finally:
            db.close()
    else:
        data = load_data_local()
        data["match_history"] = history
        save_data_local(data)

def get_players():
    if USE_DB:
        db = SessionLocal()
        try:
            players = db.query(DBPlayer).all()
            return {p.name: {"history": p.history, "elo": p.elo, "pdl": p.pdl} for p in players}
        finally:
            db.close()
    else:
        data = load_data_local()
        return data.get("players", {})

def save_players_local_only(players):
    """Aux helper not used by DB mode directly."""
    data = load_data_local()
    data["players"] = players
    save_data_local(data)

def register_player_db(name, elo="Ferro IV", pdl=0):
    if USE_DB:
        db = SessionLocal()
        try:
            player = db.query(DBPlayer).filter(DBPlayer.name == name).first()
            if not player:
                player = DBPlayer(name=name, elo=elo, pdl=pdl, history=[])
                db.add(player)
            else:
                player.elo = elo
                player.pdl = pdl
            db.commit()
            return get_players()
        finally:
            db.close()
    else:
        # Local Logic
        players = get_players()
        if name not in players:
            players[name] = {"history": [], "elo": elo, "pdl": pdl}
        else:
             players[name]["elo"] = elo
             players[name]["pdl"] = pdl
        save_players_local_only(players)
        return players

def remove_player_db(name):
    if USE_DB:
        db = SessionLocal()
        try:
            # Delete player
            db.query(DBPlayer).filter(DBPlayer.name == name).delete()
            db.commit()
            return get_players()
        finally:
            db.close()
    else:
        players = get_players()
        if name in players:
            del players[name]
            save_players_local_only(players)
        return players

def update_player_data_db(name, elo=None, pdl=None):
    if USE_DB:
        db = SessionLocal()
        try:
            player = db.query(DBPlayer).filter(DBPlayer.name == name).first()
            if player:
                if elo is not None: player.elo = elo
                if pdl is not None: player.pdl = pdl
                db.commit()
            else:
                # Register fallback
                register_player_db(name, elo or "Ferro IV", pdl or 0)
        finally:
            db.close()
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
    if USE_DB:
        db = SessionLocal()
        try:
            player = db.query(DBPlayer).filter(DBPlayer.name == name).first()
            if player:
                # SQLAlchemy mutation tracking for JSON is tricky. Copy, append, assign.
                h = list(player.history)
                if champion not in h:
                    h.append(champion)
                    player.history = h
                    db.commit()
        finally:
            db.close()
    else:
        players = get_players()
        if name in players:
            if champion not in players[name]["history"]:
                players[name]["history"].append(champion)
                save_players_local_only(players)

def clear_saved_data():
    if USE_DB:
        db = SessionLocal()
        try:
            db.query(DBMatchHistory).delete()
            db.query(DBPlayer).delete()
            db.query(DBBlacklist).delete()
            db.commit()
        finally:
            db.close()
    else:
        if os.path.exists(DATA_FILE):
            try:
                os.remove(DATA_FILE)
            except:
                pass
