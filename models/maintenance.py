from models.base import db, BaseModel

class MaintenanceLog(BaseModel):
    __tablename__ = 'maintenance_logs'
    
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime)
    description = db.Column(db.Text)
    affected_services = db.Column(db.JSON)  # ['betting', 'payment', ...]
    initiated_by = db.Column(db.Integer, db.ForeignKey('admins.id'))
    
    admin = db.relationship('Admin')

    def is_active(self):
        return self.end_time is None

    def __repr__(self):
        return f'<MaintenanceLog {self.id}>'