from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from database import engine, get_db
from models import Tournament, User, PlayerTournament
from pydantic import BaseModel
import datetime
import random

app = FastAPI()

# Tournament Creation Request Model
class TournamentCreate(BaseModel):
    name: str
    start_date: datetime.datetime
    duration: int
    min_players: int
    max_players: int
    win_points: int = 1
    draw_points: float = 0.5
    loss_points: int = 0
    streak_bonus: bool = False

# Player Registration Request Model
class PlayerRegister(BaseModel):
    username: str
    elo_rating: int = None

# Create Tournament
@app.post("/tournaments/")
def create_tournament(tournament: TournamentCreate, db: Session = Depends(get_db)):
    new_tournament = Tournament(
        name=tournament.name,
        start_date=tournament.start_date,
        duration=tournament.duration,
        min_players=tournament.min_players,
        max_players=tournament.max_players,
        win_points=tournament.win_points,
        draw_points=tournament.draw_points,
        loss_points=tournament.loss_points,
        streak_bonus=tournament.streak_bonus
    )
    db.add(new_tournament)
    db.commit()
    db.refresh(new_tournament)
    return {"message": "Tournament created successfully", "tournament_id": new_tournament.id}

# Register Player for Tournament
@app.post("/tournaments/{tournament_id}/register")
def register_player(tournament_id: int, player: PlayerRegister, db: Session = Depends(get_db)):
    # Check if user exists
    user = db.query(User).filter(User.username == player.username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if tournament exists
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    # Register player in tournament
    player_tournament = PlayerTournament(
        player_id=user.id,
        tournament_id=tournament.id,
        score=0,
        active=True
    )
    db.add(player_tournament)
    db.commit()
    db.refresh(player_tournament)
    return {"message": "Player registered successfully", "tournament_id": tournament.id}

# Generate Pairings for an Arena Tournament
@app.post("/tournaments/{tournament_id}/pairings")
def generate_pairings(tournament_id: int, db: Session = Depends(get_db)):
    # Get active players in the tournament
    active_players = db.query(PlayerTournament).filter(
        PlayerTournament.tournament_id == tournament_id,
        PlayerTournament.active == True
    ).all()
    
    if len(active_players) < 2:
        raise HTTPException(status_code=400, detail="Not enough active players to create pairings")
    
    # Shuffle players randomly
    random.shuffle(active_players)
    
    # Generate pairings (every two players form a match)
    pairings = []
    for i in range(0, len(active_players) - 1, 2):
        pairings.append({
            "player1": active_players[i].player_id,
            "player2": active_players[i + 1].player_id
        })
    
    # If an odd number of players, the last one gets a bye
    if len(active_players) % 2 == 1:
        pairings.append({"player1": active_players[-1].player_id, "player2": "BYE"})
    
    return {"pairings": pairings}

