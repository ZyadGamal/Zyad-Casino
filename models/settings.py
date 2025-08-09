from models.base import db, BaseModel

class SystemSetting(BaseModel):
    __tablename__ = 'system_settings'
    
    key = db.Column(db.String(100), unique=True)
    value = db.Column(db.Text)
    description = db.Column(db.Text)
    is_public = db.Column(db.Boolean, default=False)

    def __repr__(self):
        return f'<SystemSetting {self.key}>'