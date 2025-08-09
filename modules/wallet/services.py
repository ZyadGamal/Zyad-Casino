from datetime import datetime
from app import db
from models import Transaction, Wallet
from .security import log_security_event
from modules.notifications import send_admin_alert

def process_deposit(user, data):
    """معالجة طلب الإيداع"""
    try:
        amount = float(data['amount'])
        method = data['method']
        
        if amount <= 0:
            raise ValueError("Invalid amount")
            
        # إنشاء المعاملة
        tx = Transaction(
            user_id=user.id,
            amount=amount,
            type='deposit',
            method=method,
            status='pending'
        )
        db.session.add(tx)
        db.session.commit()
        
        # إرسال التنبيه
        send_admin_alert(
            f"New Deposit: {amount} {method} by {user.username}"
        )
        
        return {
            "status": "pending",
            "message": "Deposit under review",
            "tx_id": tx.id
        }
        
    except Exception as e:
        log_security_event('DEPOSIT_ERROR', str(e))
        db.session.rollback()
        return {"error": str(e)}, 400

def process_withdrawal(user, data):
    """معالجة طلب السحب"""
    # ... (نفس نمط process_deposit مع تعديلات السحب)

def get_transactions(user):
    """الحصول على سجل المعاملات"""
    return [tx.to_dict() for tx in user.wallet.transactions]

def approve_transaction(tx_id):
    """موافقة المسؤول على المعاملة"""
    # ... (المنطق الخاص بالموافقة)

def reject_transaction(tx_id):
    """رفض المسؤول للمعاملة"""
    # ... (المنطق الخاص بالرفض)