from sqlalchemy import Column, Integer, String, Boolean, JSON
from .database import Base

class DBPlayer(Base):
    __tablename__ = "players"
    
    name = Column(String, primary_key=True, index=True)
    elo = Column(String, default="Ferro IV")
    pdl = Column(Integer, default=0)
    history = Column(JSON, default=list) # List of champion names

class DBMatchHistory(Base):
    __tablename__ = "match_history"
    
    id = Column(Integer, primary_key=True, index=True)
    data = Column(JSON) # Stores the huge JSON object for the match

class DBBlacklist(Base):
    __tablename__ = "blacklist"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    image = Column(String)
    phase = Column(String)
    player = Column(String)
