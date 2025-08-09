from models.base import db, BaseModel

class Odd(BaseModel):
    __tablename__ = 'odds'
    
    event_id = db.Column(db.Integer, db.ForeignKey('sport_events.id'))
    market_id = db.Column(db.Integer, db.ForeignKey('markets.id'))
    selection = db.Column(db.String(100))
    value = db.Column(db.Float)
    last_updated = db.Column(db.DateTime)
    
    event = db.relationship('SportEvent', backref='odds_list')
    market = db.relationship('Market')

    def __repr__(self):
        return f'<Odd {self.selection}@{self.value}>'