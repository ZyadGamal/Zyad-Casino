from datetime import datetime
from enum import Enum
from models.base import db, BaseModel
from sqlalchemy.dialects.postgresql import JSONB

class TransactionType(Enum):
    DEPOSIT = 'deposit'
    WITHDRAWAL = 'withdrawal'
    BET = 'bet'
    WIN = 'win'
    REFUND = 'refund'
    BONUS = 'bonus'
    PENALTY = 'penalty'

class TransactionStatus(Enum):
    PENDING = 'pending'
    COMPLETED = 'completed'
    FAILED = 'failed'
    CANCELLED = 'cancelled'

class Transaction(BaseModel):
    __tablename__ = 'transactions'
    
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    wallet_id = db.Column(db.Integer, db.ForeignKey('wallets.id', ondelete='CASCADE'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    transaction_type = db.Column(db.Enum(TransactionType), nullable=False, index=True)
    status = db.Column(db.Enum(TransactionStatus), default=TransactionStatus.PENDING, index=True)
    reference = db.Column(db.String(100), unique=True, index=True)
    transaction_data = db.Column(JSONB)  # تم التغيير من metadata إلى transaction_data
    processed_at = db.Column(db.DateTime)
    
    user = db.relationship('User', back_populates='transactions')
    wallet = db.relationship('Wallet', back_populates='transactions')

    def mark_as_completed(self):
        self.status = TransactionStatus.COMPLETED
        self.processed_at = datetime.utcnow()
        return self.save()

    def mark_as_failed(self, reason=None):
        self.status = TransactionStatus.FAILED
        if reason:
            self.transaction_data = self.transaction_data or {}
            self.transaction_data['failure_reason'] = reason
        return self.save()

    def __repr__(self):
        return f'<Transaction {self.id}: {self.transaction_type.value} {self.amount}>'