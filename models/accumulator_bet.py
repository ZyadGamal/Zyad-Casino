from models.base import db, BaseModel
from sqlalchemy.dialects.postgresql import JSONB

class AccumulatorBet(BaseModel):
    __tablename__ = 'accumulator_bets'
    
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    events = db.Column(JSONB, nullable=False)  # [{event_id: 1, odd: 1.8}, ...]
    total_odd = db.Column(db.Float, nullable=False)
    amount = db.Column(db.Float, nullable=False)
    potential_win = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default='pending')  # pending/won/lost
    settled_at = db.Column(db.DateTime)
    
    user = db.relationship('User', backref=db.backref('accumulator_bets', lazy='dynamic'))

    def calculate_win(self):
        if self.status == 'won':
            return self.amount * self.total_odd
        return 0

    def __repr__(self):
        return f'<AccumulatorBet {self.id} - {self.total_odd}>'