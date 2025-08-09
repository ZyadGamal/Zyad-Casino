from models.base import db, BaseModel

class EventLiveStatus(BaseModel):
    __tablename__ = 'event_live_status'
    
    event_id = db.Column(db.Integer, db.ForeignKey('sport_events.id'), unique=True)
    minute = db.Column(db.Integer)
    score = db.Column(db.String(20))
    possession = db.Column(db.Integer)  # percentage
    shots_on_target = db.Column(db.Integer)
    corners = db.Column(db.Integer)
    dangerous_attacks = db.Column(db.Integer)
    last_update = db.Column(db.DateTime)
    
    event = db.relationship('SportEvent', backref=db.backref('live_status', uselist=False))

    def __repr__(self):
        return f'<EventLiveStatus {self.event_id} - {self.score}>'