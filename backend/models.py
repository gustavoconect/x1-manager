from pydantic import BaseModel
from typing import List, Optional, Dict

class PlayerSetup(BaseModel):
    player_a: str
    elo_a: str
    pdl_a: int = 0
    player_b: str
    elo_b: str
    pdl_b: int = 0

class GameState(BaseModel):
    setup_complete: bool
    player_a: str
    player_b: str
    elo_a: str
    elo_b: str
    start_player: Optional[str]
    current_action_player: Optional[str]
    banned_lanes: List[str]
    selected_lane: Optional[str]
    drawn_champions: List[str]
    picks: Dict[str, str]
    global_blacklist: List[Dict] # [{name, image, phase}]
    tournament_phase: str

class BanLaneRequest(BaseModel):
    lane: str

class PickRequest(BaseModel):
    game: str # "Game 1" or "Game 2"
    champion: str
    image: str
    player: str

class BlacklistAddRequest(BaseModel):
    champion: str
    image: str

class PlayerRegisterRequest(BaseModel):
    name: str
    elo: Optional[str] = "Ferro IV"
    pdl: Optional[int] = 0
