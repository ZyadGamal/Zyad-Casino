from models.base import db, BaseModel

class Market(BaseModel):
    __tablename__ = 'markets'
    
    name = db.Column(db.String(100), unique=True)
    display_name = db.Column(db.String(100))
    description = db.Column(db.Text)
    is_active = db.Column(db.Boolean, default=True)
    order = db.Column(db.Integer)

    def __repr__(self):
        return f'<Market {self.name}>'