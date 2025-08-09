class SportEvent(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    match_id = db.Column(db.Integer, unique=True)
    home_team = db.Column(db.String(100))
    away_team = db.Column(db.String(100))
    date = db.Column(db.DateTime)
    status = db.Column(db.String(50))
    league_id = db.Column(db.Integer, db.ForeignKey('league.id'))
    score = db.Column(db.String(20))
