from models.base import db, BaseModel

class Admin(BaseModel):
    __tablename__ = 'admins'
    
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), unique=True)
    role = db.Column(db.String(50), nullable=False)  # superadmin/manager/support
    permissions = db.Column(db.JSON)  # {dashboard: True, users: False, ...}
    last_login = db.Column(db.DateTime)
    
    user = db.relationship('User', backref=db.backref('admin_profile', uselist=False))

    def has_permission(self, permission):
        return self.permissions.get(permission, False)

    def __repr__(self):
        return f'<Admin {self.user_id} - {self.role}>'