from models.base import db, BaseModel

class Player(BaseModel):
    __tablename__ = 'players'
    
    api_id = db.Column(db.Integer, unique=True)
    name = db.Column(db.String(100))
    position = db.Column(db.String(50))
    number = db.Column(db.Integer)
    team_id = db.Column(db.Integer, db.ForeignKey('teams.id'))
    nationality = db.Column(db.String(50))
    date_of_birth = db.Column(db.Date)
    
    team = db.relationship('Team', backref='players')

    def __repr__(self):
        return f'<Player {self.name} ({self.position})>'