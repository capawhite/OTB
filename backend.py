from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy import create_engine, Column, Integer, String, ForeignKey, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship, Session
from passlib.context import CryptContext
import jwt
from datetime import datetime, timedelta

# JWT Configuration
SECRET_KEY = "your_secret_key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def create_access_token(data: dict, expires_delta: timedelta):
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# Database Setup
DATABASE_URL = "sqlite:///./otb_tournament.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")

# Models
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="player")  # "player" or "director"
    score = Column(Integer, default=1000)  # Player ranking

class Tournament(Base):
    __tablename__ = "tournaments"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String)
    director_id = Column(Integer, ForeignKey("users.id"))
    status = Column(String, default="upcoming")  # "upcoming", "ongoing", "completed"
    director = relationship("User")

class Match(Base):
    __tablename__ = "matches"
    id = Column(Integer, primary_key=True, index=True)
    tournament_id = Column(Integer, ForeignKey("tournaments.id"))
    player1_id = Column(Integer, ForeignKey("users.id"))
    player2_id = Column(Integer, ForeignKey("users.id"))
    result = Column(String, nullable=True)  # "1-0", "0-1", "1/2-1/2"
    tournament = relationship("Tournament")

Base.metadata.create_all(bind=engine)

# Pydantic Schemas
class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    role: Optional[str] = "player"

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TournamentCreate(BaseModel):
    name: str
    description: str
    director_id: int

class TournamentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None

class MatchCreate(BaseModel):
    tournament_id: int
    player1_id: int
    player2_id: int

class MatchResultUpdate(BaseModel):
    result: str

# FastAPI App
app = FastAPI()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

# User Registration
@app.post("/users/")
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    hashed_password = hash_password(user.password)
    db_user = User(username=user.username, email=user.email, hashed_password=hashed_password, role=user.role)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return {"message": "User created successfully"}

# User Login with JWT
@app.post("/login/", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == form_data.username).first()
    if not db_user or not verify_password(form_data.password, db_user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    access_token = create_access_token({"sub": db_user.email}, timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    return {"access_token": access_token, "token_type": "bearer"}

# Create Tournament
@app.post("/tournaments/")
def create_tournament(tournament: TournamentCreate, db: Session = Depends(get_db)):
    db_tournament = Tournament(
        name=tournament.name, description=tournament.description, director_id=tournament.director_id
    )
    db.add(db_tournament)
    db.commit()
    db.refresh(db_tournament)
    return db_tournament

# Submit Match Result and Update Player Rankings
@app.put("/matches/{match_id}")
def update_match_result(match_id: int, result: MatchResultUpdate, db: Session = Depends(get_db)):
    db_match = db.query(Match).filter(Match.id == match_id).first()
    if not db_match:
        raise HTTPException(status_code=404, detail="Match not found")
    db_match.result = result.result
    
    # Update player rankings
    if result.result == "1-0":
        db.query(User).filter(User.id == db_match.player1_id).update({"score": User.score + 10})
        db.query(User).filter(User.id == db_match.player2_id).update({"score": User.score - 10})
    elif result.result == "0-1":
        db.query(User).filter(User.id == db_match.player1_id).update({"score": User.score - 10})
        db.query(User).filter(User.id == db_match.player2_id).update({"score": User.score + 10})
    elif result.result == "1/2-1/2":
        db.query(User).filter(User.id == db_match.player1_id).update({"score": User.score + 5})
        db.query(User).filter(User.id == db_match.player2_id).update({"score": User.score + 5})
    
    db.commit()
    db.refresh(db_match)
    return db_match

