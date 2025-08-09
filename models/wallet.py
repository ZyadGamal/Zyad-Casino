from datetime import datetime
from models.base import db, BaseModel
from sqlalchemy import CheckConstraint

class Wallet(BaseModel):
    __tablename__ = 'wallets'
    
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), unique=True, nullable=False)
    balance = db.Column(db.Float, default=0.0, nullable=False)
    currency = db.Column(db.String(3), default='EGP')
    bonus_balance = db.Column(db.Float, default=0.0)
    last_activity = db.Column(db.DateTime)
    
    user = db.relationship('User', back_populates='wallet')
    transactions = db.relationship('Transaction', back_populates='wallet', cascade='all, delete-orphan')

    __table_args__ = (
        CheckConstraint('balance >= 0', name='non_negative_balance'),
        CheckConstraint('bonus_balance >= 0', name='non_negative_bonus_balance'),
    )

    def deposit(self, amount, is_bonus=False):
        if is_bonus:
            self.bonus_balance += amount
        else:
            self.balance += amount
        self.last_activity = datetime.utcnow()
        return self.save()

    def withdraw(self, amount):
        if self.balance >= amount:
            self.balance -= amount
            self.last_activity = datetime.utcnow()
            return self.save()
        return False

    def available_balance(self):
        return self.balance + self.bonus_balance

    def __repr__(self):
        return f'<Wallet {self.id}: User {self.user_id} ({self.balance} {self.currency})>'