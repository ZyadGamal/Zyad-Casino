from datetime import datetime
from models.base import db, BaseModel
from sqlalchemy.dialects.postgresql import JSONB

class League(BaseModel):
    __tablename__ = 'leagues'
    
    api_id = db.Column(db.Integer, unique=True, nullable=False, index=True)
    name = db.Column(db.String(100), nullable=False)
    country = db.Column(db.String(100), nullable=False)
    logo = db.Column(db.String(255))
    season = db.Column(db.Integer)
    is_active = db.Column(db.Boolean, default=True)
    sport_type = db.Column(db.String(50), nullable=False)
    current_round = db.Column(db.String(50))
    
    events = db.relationship('SportEvent', back_populates='league', cascade='all, delete-orphan')

    def active_events_count(self):
        return len([e for e in self.events if e.status == 'active'])

    def __repr__(self):
        return f'<League {self.id}: {self.name} ({self.country})>'

class Team(BaseModel):
    __tablename__ = 'teams'
    
    api_id = db.Column(db.Integer, unique=True, nullable=False, index=True)
    name = db.Column(db.String(100), nullable=False)
    short_name = db.Column(db.String(50))
    logo = db.Column(db.String(255))
    country = db.Column(db.String(100))
    founded = db.Column(db.Integer)
    stadium = db.Column(db.String(100))
    coach = db.Column(db.String(100))
    
    home_events = db.relationship('SportEvent', foreign_keys='SportEvent.home_team_id', 
                                back_populates='home_team')
    away_events = db.relationship('SportEvent', foreign_keys='SportEvent.away_team_id', 
                                back_populates='away_team')

    def upcoming_matches(self, limit=5):
        return sorted(
            [e for e in self.home_events + self.away_events if e.status == 'scheduled'],
            key=lambda x: x.start_time
        )[:limit]

    def __repr__(self):
        return f'<Team {self.id}: {self.name}>'

class SportEvent(BaseModel):
    __tablename__ = 'sport_events'
    
    api_id = db.Column(db.Integer, unique=True, nullable=False, index=True)
    league_id = db.Column(db.Integer, db.ForeignKey('leagues.id', ondelete='CASCADE'), nullable=False)
    home_team_id = db.Column(db.Integer, db.ForeignKey('teams.id', ondelete='CASCADE'), nullable=False)
    away_team_id = db.Column(db.Integer, db.ForeignKey('teams.id', ondelete='CASCADE'), nullable=False)
    start_time = db.Column(db.DateTime, nullable=False, index=True)
    end_time = db.Column(db.DateTime)
    status = db.Column(db.String(50), default='scheduled', index=True)  # scheduled/live/ended/cancelled
    home_score = db.Column(db.Integer)
    away_score = db.Column(db.Integer)
    odds = db.Column(JSONB)
    round = db.Column(db.String(50))
    referee = db.Column(db.String(100))
    venue = db.Column(db.String(100))
    statistics = db.Column(JSONB)  # Extended match statistics
    
    league = db.relationship('League', back_populates='events')
    home_team = db.relationship('Team', foreign_keys=[home_team_id], back_populates='home_events')
    away_team = db.relationship('Team', foreign_keys=[away_team_id], back_populates='away_events')
    bets = db.relationship('Bet', back_populates='event', cascade='all, delete-orphan')
    live_status = db.relationship('EventLiveStatus', back_populates='event', uselist=False, cascade='all, delete-orphan')

    @property
    def current_score(self):
        return f"{self.home_score or 0}-{self.away_score or 0}"

    def is_live(self):
        return self.status == 'live'

    def update_status(self, new_status):
        self.status = new_status
        if new_status == 'ended':
            self.end_time = datetime.utcnow()
        return self.save()

    def __repr__(self):
        return f'<SportEvent {self.id}: {self.home_team.name} vs {self.away_team.name} ({self.start_time})>'