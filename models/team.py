from models.base import db, BaseModel

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
    website = db.Column(db.String(255))
    
    home_events = db.relationship('SportEvent', foreign_keys='SportEvent.home_team_id', 
                                back_populates='home_team')
    away_events = db.relationship('SportEvent', foreign_keys='SportEvent.away_team_id', 
                                back_populates='away_team')
    players = db.relationship('Player', back_populates='team', cascade='all, delete-orphan')

    def upcoming_matches(self, limit=5):
        return sorted(
            [e for e in self.home_events + self.away_events if e.status == 'scheduled'],
            key=lambda x: x.start_time
        )[:limit]

    def __repr__(self):
        return f'<Team {self.id} - {self.name}>'