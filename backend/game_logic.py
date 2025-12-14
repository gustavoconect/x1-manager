import random
from .constants import ELO_HIERARCHY, LANE_CHAMPIONS
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
            "tournament_phase": "Groups"
        }

    def reset_duel(self):
        """Reset duel state but keep blacklist and history."""
        saved_bl = self.state["global_blacklist"]
        saved_hist = self.state["match_history"]
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
            "tournament_phase": "Groups"
        }

    def full_reset(self):
        """Clear everything."""
        clear_saved_data()
        self.state["global_blacklist"] = []
        self.state["match_history"] = []
        self.reset_duel()

    def setup_game(self, p1, e1, pdl1, p2, e2, pdl2):
        self.state["player_a"] = p1
        self.state["elo_a"] = e1
        self.state["pdl_a"] = pdl1
        self.state["player_b"] = p2
        self.state["elo_b"] = e2
        self.state["pdl_b"] = pdl2
        
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
        lane = self.state["selected_lane"]
        if not lane:
            return
            
        candidates = LANE_CHAMPIONS.get(lane, [])
        blacklist = self.state["global_blacklist"]
        
        # Step 1: Try excluding Global Blacklist (Default Rule)
        # "Sorteio de 4 campeões... Excluir campeões já usados por QUALQUER jogador na fase de grupos"
        blacklist_names = [x['name'] for x in blacklist]
        available = [c for c in candidates if c not in blacklist_names]
        
        # Step 2: Fallback - Only exclude champions played by THESE TWO players
        if len(available) < 4:
            # Filter blacklist for entries where 'player' is P1 or P2
            p1 = self.state["player_a"]
            p2 = self.state["player_b"]
            
            # Get player histories to prioritize unused champs
            players_data = get_players()
            p1_history = set(players_data.get(p1, {}).get("history", []))
            p2_history = set(players_data.get(p2, {}).get("history", []))
            both_history = p1_history | p2_history  # Union of both histories
            
            # Note: Older blacklist entries might not have 'player' key if migrated. Handle gracefully.
            relevant_bans = set()
            for entry in blacklist:
                p = entry.get("player")
                if p == p1 or p == p2:
                    relevant_bans.add(entry["name"])
            
            available = [c for c in candidates if c not in relevant_bans]
            
            # If still short, prioritize champs not in either player's history
            if len(available) < 4:
                # Get champs not used by either player (even if in global blacklist)
                unused_by_both = [c for c in candidates if c not in both_history]
                # Sort: prioritize truly unused, then allow used ones
                available = unused_by_both + [c for c in candidates if c not in unused_by_both]
                available = list(dict.fromkeys(available))  # Remove duplicates, preserve order
            
        # Step 3: Emergency Fallback - Use entire lane pool
        if len(available) < 4:
            available = candidates
            
        if len(available) >= 4:
            self.state["drawn_champions"] = random.sample(available, 4)
        else:
             # If lane has < 4 champs total (unlikely)?
             self.state["drawn_champions"] = available

    def pick_champion(self, game, champion, image, player_name):
        self.state["picks"][game] = {
            "champion": champion,
            "player": player_name,
            "image": image
        }
        
        # Add to global blacklist
        self.state["global_blacklist"].append({
            "name": champion,
            "image": image,
            "phase": self.state["tournament_phase"],
            "player": player_name
        })
        save_blacklist(self.state["global_blacklist"])
        
        # Update Personal History
        update_player_history_db(player_name, champion)

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

    def update_player_data(self, name, elo=None, pdl=None):
        update_player_data_db(name, elo, pdl)

    def get_registered_players(self):
        return get_players()

    def archive_current_match(self):
        """Save current picks to history."""
        if "Game 1" in self.state["picks"] and "Game 2" in self.state["picks"]:
            record = {
                "id": len(self.state["match_history"]) + 1,
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

    def set_phase(self, phase):
        self.state["tournament_phase"] = phase

game_instance = GameManager()
