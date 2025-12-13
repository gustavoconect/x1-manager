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
            "start_player": None,
            "current_action_player": None,
            "banned_lanes": [],
            "selected_lane": None,
            "drawn_champions": [],
            "picks": {},
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
            "start_player": None,
            "current_action_player": None,
            "banned_lanes": [],
            "selected_lane": None,
            "drawn_champions": [],
            "picks": {},
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
        self.state["player_b"] = p2
        self.state["elo_b"] = e2
        
        # Calculate starter
        val_a = ELO_HIERARCHY.get(e1, 0)
        val_b = ELO_HIERARCHY.get(e2, 0)
        
        if val_a > val_b:
            starter = "A"
        elif val_b > val_a:
            starter = "B"
        else:
            # Elo tie: check PDL
            if pdl1 < pdl2: # Less PDL starts (Lower rank starts picking bans usually? Or Higher? Standard is Lower Elo starts)
                # In standard Draft, Lower Seed/Elo usually gets side selection or first ban?
                # Prompt assumption: "Elo menor começa" (implied from typical X1 logic where underdog has advantage or specific rule).
                # Actually, in most X1 apps I built, Lower Elo starts banning to balance.
                # Let's assume Lower Data starts.
                # If A < B then A starts.
                # Here: if val_a (Elo) is higher, A is better. So B (Worse) starts?
                # Wait, original code: if val_a > val_b (A is better) -> starter = "A".
                # User's previous logic: "Quem tem maior elo começa" (Higher Elo starts).
                # Wait, let's look at previous code:
                # if val_a > val_b: starter = "A"
                # So Higher Elo starts.
                # Tie-breaker: Higher PDL starts.
                
                if pdl1 > pdl2:
                    starter = "A"
                elif pdl2 > pdl1:
                    starter = "B"
                else:
                    starter = random.choice(["A", "B"])
            
        self.state["start_player"] = starter
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
            
            # Note: Older blacklist entries might not have 'player' key if migrated. Handle gracefully.
            relevant_bans = set()
            for entry in blacklist:
                p = entry.get("player")
                if p == p1 or p == p2:
                    relevant_bans.add(entry["name"])
            
            available = [c for c in candidates if c not in relevant_bans]
            
        # Step 3: Emergency Fallback - Use entire lane pool? (Prompt: "liberar campeões que apenas os dois não jogaram")
        # Creating 'available' above technically satisfies this.
        # If still < 4, it means they have played almost EVERY champion in that lane. 
        # In that case, we might just have to sample from 'candidates' allowing repeats or error.
        if len(available) < 4:
            available = candidates # Reset pool completely for this rare edge case
            
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
