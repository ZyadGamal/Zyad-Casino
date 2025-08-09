from models.base import db, BaseModel

class UserBadge(BaseModel):
    __tablename__ = 'user_badges'
    
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    badge_id = db.Column(db.Integer, db.ForeignKey('badges.id'))
    earned_at = db.Column(db.DateTime, server_default=db.func.now())
    
    user = db.relationship('User', backref='badges_earned')
    badge = db.relationship('Badge')

class Badge(BaseModel):
    __tablename__ = 'badges'
    
    name = db.Column(db.String(100), unique=True)
    description = db.Column(db.Text)
    image_url = db.Column(db.String(255))
    criteria = db.Column(db.JSON)  # {min_bets: 10, min_wins: 5}

    def __repr__(self):
        return f'<Badge {self.name}>'