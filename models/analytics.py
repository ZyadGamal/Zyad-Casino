from models.base import db, BaseModel

class UserAnalytics(BaseModel):
    __tablename__ = 'user_analytics'
    
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), unique=True)
    total_bets = db.Column(db.Integer, default=0)
    total_wins = db.Column(db.Integer, default=0)
    total_losses = db.Column(db.Integer, default=0)
    total_deposits = db.Column(db.Float, default=0.0)
    total_withdrawals = db.Column(db.Float, default=0.0)
    last_activity = db.Column(db.DateTime)
    
    user = db.relationship('User', backref=db.backref('analytics', uselist=False))

    def win_rate(self):
        return (self.total_wins / self.total_bets * 100) if self.total_bets > 0 else 0

    def __repr__(self):
        return f'<UserAnalytics {self.user_id}>'