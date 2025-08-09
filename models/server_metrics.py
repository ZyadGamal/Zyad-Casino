from datetime import datetime
from models.base import db, BaseModel

class ServerMetrics(BaseModel):
    __tablename__ = 'server_metrics'
    
    cpu = db.Column(db.Float)  # CPU usage percentage
    memory = db.Column(db.Float)  # Memory usage percentage
    requests = db.Column(db.Integer)  # Requests per minute
    disk = db.Column(db.Float)  # Disk usage percentage
    network = db.Column(db.BigInteger)  # Network bytes transferred
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

class Backup(BaseModel):
    __tablename__ = 'backups'
    
    filename = db.Column(db.String(255))
    path = db.Column(db.String(512))
    backup_type = db.Column(db.String(50))  # scheduled/manual
    size = db.Column(db.BigInteger)  # in bytes
    completed = db.Column(db.Boolean, default=True)
    error = db.Column(db.Text, nullable=True)