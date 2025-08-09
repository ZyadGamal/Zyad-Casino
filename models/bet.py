from enum import Enum
from models.base import db, BaseModel
from sqlalchemy.dialects.postgresql import JSONB

class BetType(Enum):
    SINGLE = 'single'
    MULTI = 'multi'
    SYSTEM = 'system'

class Bet(BaseModel):
    __tablename__ = 'bets'
    
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    event_id = db.Column(db.Integer, db.ForeignKey('sport_events.id', ondelete='CASCADE'), nullable=False)
    bet_type = db.Column(db.Enum(BetType), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    potential_win = db.Column(db.Float, nullable=False)
    odds = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default='pending')
    details = db.Column(JSONB)
    
    user = db.relationship('User', backref=db.backref('bets', lazy='dynamic'))
    event = db.relationship('SportEvent', back_populates='bets')

    def calculate_win(self):
        if self.status == 'won':
            return self.amount * self.odds
        return 0

    def __repr__(self):
        return f'<Bet {self.id} - {self.bet_type}>'