from models.base import db, BaseModel

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

    def active_events(self):
        return [event for event in self.events if event.status == 'active']

    def __repr__(self):
        return f'<League {self.id} - {self.name}>'