from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
import uvicorn
import random

from .models import PlayerSetup, BanLaneRequest, PickRequest, BlacklistAddRequest, PlayerRegisterRequest, ChampionAnnounceRequest, KnockoutBanRequest, KnockoutSideRequest, GameWinnerRequest, BaseModel
from .game_logic import game_instance
from .utils import get_latest_version, get_champions_data, get_champion_image_url
from .constants import LANE_CHAMPIONS

app = FastAPI(title="X1 LoL Manager API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for local dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup
ddragon_version = "13.24.1"
champions_data = {}

@app.on_event("startup")
async def startup_event():
    global ddragon_version, champions_data
    ddragon_version = get_latest_version()
    champions_data = get_champions_data(ddragon_version)
    game_instance.state["version"] = ddragon_version # Inject version
    game_instance.champions_data = champions_data # Inject data for image resolution
    print(f"DataDragon Version: {ddragon_version}")

@app.get("/state")
def get_state():
    return game_instance.state

@app.post("/setup")
def setup_game(setup: PlayerSetup):
    # Update Elo for players (or register if new)
    game_instance.update_player_data(setup.player_a, setup.elo_a, setup.pdl_a)
    game_instance.update_player_data(setup.player_b, setup.elo_b, setup.pdl_b)
    
    game_instance.setup_game(
        setup.player_a, setup.elo_a, setup.pdl_a,
        setup.player_b, setup.elo_b, setup.pdl_b,
        setup.tournament_phase, setup.series_format, setup.announce_first
    )
    return game_instance.state

@app.post("/ban-lane")
def ban_lane(req: BanLaneRequest):
    game_instance.ban_lane(req.lane)
    return game_instance.state

@app.post("/draw")
def draw_champions():
    game_instance.draw_champions()
    return game_instance.state

@app.post("/pick")
def pick_champion_endpoint(req: PickRequest):
    game_instance.pick_champion(req.game, req.champion, req.image, req.player)
    return game_instance.state

@app.post("/reroll-draw")
def reroll_draw():
    game_instance.draw_champions()
    return game_instance.state

@app.post("/rule6-choice")
def rule6_choice(choice: str):
    """Lower Elo player chooses 'pick_order' or 'side'"""
    game_instance.make_rule6_choice(choice)
    return game_instance.state

@app.post("/set-pick-order")
def set_pick_order(first_picker: str):
    """Pick order chooser decides who picks first: 'A' or 'B'"""
    game_instance.set_pick_order(first_picker)
    return game_instance.state

@app.post("/set-map-side")
def set_map_side(side: str):
    """Side chooser picks their Game 1 side: 'Blue' or 'Red'"""
    game_instance.set_map_side(side)
    return game_instance.state

@app.post("/reset-duel")
def reset_duel():
    game_instance.archive_current_match()
    game_instance.reset_duel()
    return game_instance.state

@app.get("/history")
def get_history():
    return game_instance.state["match_history"]

@app.post("/full-reset")
def full_reset():
    game_instance.full_reset()
    return game_instance.state

@app.post("/manual-blacklist")
def manual_blacklist(req: BlacklistAddRequest):
    game_instance.add_manual_blacklist(req.champion, req.image)
    return game_instance.state

@app.post("/announce-champion")
def announce_champion(req: ChampionAnnounceRequest):
    res = game_instance.announce_champion(req.champion, req.image)
    if "error" in res:
        raise HTTPException(status_code=400, detail=res["error"])
    return res

@app.post("/knockout-ban")
def knockout_ban(req: KnockoutBanRequest):
    game_instance.ban_announced_champion(req.champion)
    return game_instance.state

@app.post("/knockout-side")
def set_knockout_side(req: KnockoutSideRequest):
    game_instance.set_knockout_side(req.game, req.side, req.chooser)
    return game_instance.state

@app.post("/game-winner")
def set_game_winner(req: GameWinnerRequest):
    game_instance.set_game_winner(req.game, req.winner)
    return game_instance.state

@app.post("/finish-knockout")
def finish_knockout():
    game_instance.archive_knockout_series()
    game_instance.reset_duel()
    return game_instance.state

class DeciderRequest(BaseModel):
    game: str

@app.post("/random-decider-pick")
def random_decider_pick(req: DeciderRequest):
    champ_name = game_instance.get_decider_champion()
    if not champ_name:
        raise HTTPException(status_code=400, detail="Sem campeões disponíveis para sorteio!")
    
    image = get_champion_image_url(champ_name, ddragon_version, champions_data)
    game_instance.pick_champion(req.game, champ_name, image, "Sorteio")
    return game_instance.state

@app.post("/register-player")
def register_player(req: PlayerRegisterRequest):
    game_instance.register_player(req.name, req.elo, req.pdl)
    return game_instance.get_registered_players()

@app.delete("/player/{name}")
def delete_player(name: str):
    game_instance.remove_player(name)
    return game_instance.get_registered_players()

@app.get("/players")
def get_players_route():
    return game_instance.get_registered_players()

@app.get("/champions-all")
def get_all_champions():
    # Helper to get all champions organized by lane with images
    res = {}
    for lane, champs in LANE_CHAMPIONS.items():
        data = []
        for c in champs:
             data.append({
                 "name": c,
                 "image": get_champion_image_url(c, ddragon_version, champions_data)
             })
        res[lane] = data
    return res

@app.get("/blocked-champions/{player_name}")
def get_blocked_champions(player_name: str):
    """Get list of champions blocked for a specific player in Knockout phase."""
    blocked = game_instance.get_knockout_history(player_name)
    result = []
    for champ_name in blocked:
        result.append({
            "name": champ_name,
            "image": get_champion_image_url(champ_name, ddragon_version, champions_data)
        })
    return result

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
