import random
from .constants import ELO_HIERARCHY, LANE_CHAMPIONS
from .utils import get_champion_image_url
from .data_manager import get_saved_blacklist, save_blacklist, clear_saved_data, get_match_history, save_match_history, get_players, register_player_db, update_player_history_db, update_player_data_db, remove_player_db

class GameManager:
    def __init__(self):
        self.state = {
            "setup_complete": False,
            "player_a": "",
            "player_b": "",
            "elo_a": "Ferro IV",
            "elo_b": "Ferro IV",
            "pdl_a": 0,
            "pdl_b": 0,
            "start_player": None,  # Higher Elo - starts banning
            "lower_elo_player": None,  # Lower Elo - chooses A/B after draw
            "current_action_player": None,
            "banned_lanes": [],
            "selected_lane": None,
            "drawn_champions": [],
            # Rule 6 Choice Phase
            "choice_made": False,  # Lower Elo made A/B choice
            "pick_order_chooser": None,  # Who defines pick order ("A" or "B")
            "side_chooser": None,  # Who chooses map side ("A" or "B")
            "first_picker": None,  # Who picks first after order is set
            "picks": {},
            # Side Choice Phase (after picks)
            "side_choice_complete": False,
            "game1_sides": {},  # {"A": "Blue", "B": "Red"}
            # Persistent
            "global_blacklist": get_saved_blacklist(),
            "match_history": get_match_history(),
            "tournament_phase": "Groups",
            "series_format": "MD2",
            "series_score": {"A": 0, "B": 0},
            "announce_turn_player": None,
            "announced_champions": {"A": [], "B": []},
            "knockout_bans": []
        }
        self.champions_data = {}

    def update_player_data(self, name, elo, pdl):
        register_player_db(name, elo, pdl)

    def register_player(self, name, elo, pdl):
        register_player_db(name, elo, pdl)

    def get_registered_players(self):
        return get_players()

    def remove_player(self, name):
        remove_player_db(name)

    def reset_duel(self):
        """Reset duel state but keep blacklist and history."""
        saved_bl = self.state["global_blacklist"]
        saved_hist = self.state["match_history"]
        # Preserve version if it exists, else default to a newer one
        current_version = self.state.get("version", "15.24.1")
        
        self.state = {
            "setup_complete": False,
            "player_a": "",
            "player_b": "",
            "elo_a": "Ferro IV",
            "elo_b": "Ferro IV",
            "pdl_a": 0,
            "pdl_b": 0,
            "start_player": None,
            "lower_elo_player": None,
            "current_action_player": None,
            "banned_lanes": [],
            "selected_lane": None,
            "drawn_champions": [],
            "choice_made": False,
            "pick_order_chooser": None,
            "side_chooser": None,
            "first_picker": None,
            "picks": {},
            "side_choice_complete": False,
            "game1_sides": {},
            "global_blacklist": saved_bl,
            "match_history": saved_hist,
            "tournament_phase": "Groups",
            "series_format": "MD2",
            "series_score": {"A": 0, "B": 0},
            "announce_turn_player": None,
            "announced_champions": {"A": [], "B": []},
            "knockout_bans": [],
            "version": current_version # Restore version
        }

    def full_reset(self):
        """Clear everything."""
        clear_saved_data()
        self.state["global_blacklist"] = []
        self.state["match_history"] = []
        self.reset_duel()

    def setup_game(self, p1, e1, pdl1, p2, e2, pdl2, phase="Groups", series="MD2", announce_first=None):
        self.state["player_a"] = p1
        self.state["elo_a"] = e1
        self.state["pdl_a"] = pdl1
        self.state["player_b"] = p2
        self.state["elo_b"] = e2
        self.state["pdl_b"] = pdl2
        self.state["tournament_phase"] = phase
        self.state["series_format"] = series
        
        # Set announce start (for Knockout)
        if phase == "Knockout":
            # No longer wiping global blacklist here to preserve Groups data
            if announce_first:
                self.state["announce_turn_player"] = "A" if announce_first == p1 else "B"
        
        # Calculate starter (Higher Elo starts banning, PDL as tie-breaker)
        val_a = ELO_HIERARCHY.get(e1, 0)
        val_b = ELO_HIERARCHY.get(e2, 0)
        
        if val_a > val_b:
            starter = "A"
            lower = "B"
        elif val_b > val_a:
            starter = "B"
            lower = "A"
        else:
            # Elo tie: use PDL as tie-breaker (Higher PDL starts)
            if pdl1 > pdl2:
                starter = "A"
                lower = "B"
            elif pdl2 > pdl1:
                starter = "B"
                lower = "A"
            else:
                # Both equal: random
                starter = random.choice(["A", "B"])
                lower = "B" if starter == "A" else "A"
            
        self.state["start_player"] = starter
        self.state["lower_elo_player"] = lower
        self.state["current_action_player"] = starter
        self.state["setup_complete"] = True

    def ban_lane(self, lane):
        if lane not in self.state["banned_lanes"]:
            self.state["banned_lanes"].append(lane)
            # Switch turn
            self.state["current_action_player"] = "B" if self.state["current_action_player"] == "A" else "A"
            
            if len(self.state["banned_lanes"]) == 4:
                from .constants import LANES
                remaining = [l for l in LANES if l not in self.state["banned_lanes"]][0]
                self.state["selected_lane"] = remaining

    def draw_champions(self):
        # Disable draw for Knockout Phase
        if self.state["tournament_phase"] == "Knockout":
            return

        lane = self.state["selected_lane"]
        if not lane:
            return
            
        candidates = LANE_CHAMPIONS.get(lane, [])
        blacklist = self.state["global_blacklist"]
        
        # Step 1: Try excluding Global Blacklist (Default Rule)
        # "Sorteio de 4 campeões... Excluir campeões já usados por QUALQUER jogador na fase de grupos"
        blacklist_names = [x['name'] for x in blacklist]
        available = [c for c in candidates if c not in blacklist_names]
        
        # Step 2: Pool Refill Logic (Recycle champions if lane pool is exhausted)
        # Logic: Allow champions from Global Blacklist IF current P1 and P2 haven't played them.
        if len(available) < 4:
            # Get player histories (Source of Truth for "Who played what")
            players_data = get_players()
            p1_history = set(players_data.get(p1, {}).get("history", []))
            p2_history = set(players_data.get(p2, {}).get("history", []))
            
            # Champions to exclude: Ones that P1 OR P2 have already played
            relevant_bans = p1_history | p2_history
            
            # Re-calculate available from ALL candidates, excluding only really played ones
            available = [c for c in candidates if c not in relevant_bans]
            
            # If still short, it means players have played almost everything.
            # Fallback: Prioritize champions not used by EITHER, then fill with anything.
            if len(available) < 4:
                available = candidates
            
        drawn_names = []
        if len(available) >= 4:
            drawn_names = random.sample(available, 4)
        else:
             drawn_names = available

        self.state["drawn_champions"] = []
        for name in drawn_names:
            image = get_champion_image_url(name, self.state.get("version", "15.24.1"), self.champions_data)
            self.state["drawn_champions"].append({
                "name": name,
                "image": image
            })

    def pick_champion(self, game, champion, image, player_name):
        self.state["picks"][game] = {
            "champion": champion,
            "player": player_name,
            "image": image
        }
        
        # Add to global blacklist ONLY if Groups phase
        if self.state["tournament_phase"] == "Groups":
            # Check for duplicates before adding
            exists = any(x['name'] == champion for x in self.state["global_blacklist"])
            if not exists:
                self.state["global_blacklist"].append({
                    "name": champion,
                    "image": image,
                    "phase": self.state["tournament_phase"],
                    "player": player_name # Storing picker is fine for metadata, History checks usage
                })
                save_blacklist(self.state["global_blacklist"])
        
        # Update Personal History for BOTH players (since both play the champion)
        update_player_history_db(self.state["player_a"], champion)
        update_player_history_db(self.state["player_b"], champion)

    # ========== KNOCKOUT PHASE METHODS ==========

    def get_knockout_history(self, player_name):
        """Get champions PLAYED in matches where THIS player participated.
        Only blocks champions from matches where this specific player was involved."""
        used = set()
        for m in self.state["match_history"]:
            if m.get("phase") == "Knockout":
                # Only check if THIS player was in this match
                if m.get("player_a") == player_name or m.get("player_b") == player_name:
                    # Get all played champions from this match
                    for key in m:
                        if key.startswith("game_") and isinstance(m[key], dict):
                            champ = m[key].get("champion")
                            if champ:
                                used.add(champ)
        return used

    def announce_champion(self, champion, image):
        player_key = self.state["announce_turn_player"] # "A" or "B"
        player_name = self.state[f"player_{player_key.lower()}"]
        
        # Check if already announced in this series by ANYONE
        all_announced = [c['name'] for c in self.state["announced_champions"]["A"]] + \
                        [c['name'] for c in self.state["announced_champions"]["B"]]
        if champion in all_announced:
            return {"error": "Campeão já anunciado nesta série!"}

        # Check global Knockout history - champions that were PLAYED (not just announced)
        # This blocks for BOTH players since they share champions
        played_history = self.get_knockout_history(player_name)
        if champion in played_history:
            return {"error": f"{champion} já foi utilizado no Mata-Mata!"}
            
        # Add to list
        self.state["announced_champions"][player_key].append({
            "name": champion, "image": image
        })
        
        # Switch turn
        self.state["announce_turn_player"] = "B" if player_key == "A" else "A"
        return self.state

    def ban_announced_champion(self, champion):
        if champion not in self.state["knockout_bans"]:
            self.state["knockout_bans"].append(champion)
            
            # Logic: If both players banned, move to next step?
            # For now just add to banned list. Frontend handles flow.
        return self.state

    # ========== RULE 6: Choice Phase Methods ==========
    
    def make_rule6_choice(self, choice: str):
        """
        Lower Elo player chooses between:
        - 'pick_order': They define who picks first
        - 'side': They get to choose map side after picks
        """
        lower = self.state["lower_elo_player"]
        higher = "B" if lower == "A" else "A"
        
        if choice == "pick_order":
            # Lower Elo defines pick order, Higher Elo chooses side after picks
            self.state["pick_order_chooser"] = lower
            self.state["side_chooser"] = higher
        else:  # choice == "side"
            # Higher Elo defines pick order, Lower Elo chooses side after picks
            self.state["pick_order_chooser"] = higher
            self.state["side_chooser"] = lower
        
        self.state["choice_made"] = True
    
    def set_pick_order(self, first_picker: str):
        """
        The pick_order_chooser decides who picks first.
        first_picker: "A" or "B"
        """
        self.state["first_picker"] = first_picker
    
    def set_map_side(self, side: str):
        """
        The side_chooser picks their side for Game 1.
        side: "Blue" or "Red"
        The other player gets the opposite.
        """
        chooser = self.state["side_chooser"]
        other = "B" if chooser == "A" else "A"
        opposite = "Red" if side == "Blue" else "Blue"
        
        self.state["game1_sides"] = {
            chooser: side,
            other: opposite
        }
        self.state["side_choice_complete"] = True


    def register_player(self, name, elo="Ferro IV", pdl=0):
        return register_player_db(name, elo, pdl)

    def remove_player(self, name):
        return remove_player_db(name)



    def get_registered_players(self):
        return get_players()

    def archive_current_match(self):
        """Save current picks to history."""
        if "Game 1" in self.state["picks"] and "Game 2" in self.state["picks"]:
            # Calculate next ID based on MAX existing ID to prevent overwrites if history has gaps
            current_ids = [m.get("id", 0) for m in self.state["match_history"]]
            next_id = max(current_ids, default=0) + 1

            record = {
                "id": next_id,
                "player_a": self.state["player_a"],
                "player_b": self.state["player_b"],
                "lane": self.state["selected_lane"],
                "game_1": self.state["picks"]["Game 1"],
                "game_2": self.state["picks"]["Game 2"],
                "phase": self.state["tournament_phase"]
            }
            self.state["match_history"].append(record)
            save_match_history(self.state["match_history"])

    def add_manual_blacklist(self, champion, image):
        exists = any(x['name'] == champion for x in self.state["global_blacklist"])
        if not exists:
             self.state["global_blacklist"].append({
                "name": champion,
                "image": image,
                "phase": "Mata-Mata",
                "player": "Manual"
            })
             save_blacklist(self.state["global_blacklist"])

    def archive_knockout_series(self):
        """Save Knockout series to history."""
        # Calculate next ID based on MAX existing ID
        current_ids = [m.get("id", 0) for m in self.state["match_history"]]
        next_id = max(current_ids, default=0) + 1

        record = {
            "id": next_id,
            "player_a": self.state["player_a"],
            "player_b": self.state["player_b"],
            "phase": "Knockout",
            "format": self.state["series_format"],
            "score": self.state["series_score"]
        }
        # Add games dynamically (game_1, game_2, game_3...)
        for g in self.state["picks"]:
            key = g.lower().replace(" ", "_")
            record[key] = self.state["picks"][g]
        
        # Save announced champions per player for history tracking
        record[f"announced_by_{self.state['player_a']}"] = [c['name'] for c in self.state['announced_champions']['A']]
        record[f"announced_by_{self.state['player_b']}"] = [c['name'] for c in self.state['announced_champions']['B']]

        self.state["match_history"].append(record)
        save_match_history(self.state["match_history"])

    def get_decider_champion(self):
        # Flatten all known champions
        all_champs = set()
        for lane in LANE_CHAMPIONS:
            all_champs.update(LANE_CHAMPIONS[lane])
        
        # Get Global Knockout History (All players)
        used = set()
        for m in self.state["match_history"]:
            if m.get("phase") == "Knockout":
                for k, v in m.items():
                    if k.startswith("game_") and isinstance(v, dict):
                        used.add(v["champion"])
        
        # Also exclude currently announced in this series
        current = set()
        for p in ["A", "B"]:
            for c in self.state["announced_champions"][p]:
                current.add(c["name"])
        
        available = list(all_champs - used - current)
        if not available:
            return None
            
        import random
        # Return name and image (using utils would be better but we need self access?) 
        # We need image URL.
        # We can construct it or fetch it.
        # Let's return just name, main.py will handle image fetching.
        return random.choice(available)

    def set_phase(self, phase):
        self.state["tournament_phase"] = phase

game_instance = GameManager()
