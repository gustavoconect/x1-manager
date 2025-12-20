from pydantic import BaseModel
from typing import Optional, Dict

class PlayerSetup(BaseModel):
    player_a: str
    player_b: str
    elo_a: str = "Ferro IV"
    elo_b: str = "Ferro IV"
    pdl_a: int = 0
    pdl_b: int = 0
    tournament_phase: str = "Groups"
    series_format: str = "MD2"
    announce_first: Optional[str] = None

class BanLaneRequest(BaseModel):
    lane: str

class PickRequest(BaseModel):
    game: str
    champion: str
    image: str
    player: str

class BlacklistAddRequest(BaseModel):
    champion: str
    image: str

class PlayerRegisterRequest(BaseModel):
    name: str
    elo: str
    pdl: int

class ChampionAnnounceRequest(BaseModel):
    champion: str
    image: str

class KnockoutBanRequest(BaseModel):
    champion: str

class KnockoutSideRequest(BaseModel):
    game: str
    side: str # "Blue" or "Red"
    chooser: str # Player who made the choice

class GameWinnerRequest(BaseModel):
    game: str
    winner: str # Player name
