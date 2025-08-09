from flask import Blueprint, jsonify, request
from models.transaction import Transaction
from models.user import User
from app import db
from modules.notifications.telegram_bot import notify_admin

admin_wallet_bp = Blueprint('admin_wallet', __name__)

@admin_wallet_bp.route('/api/admin/wallet/pending', methods=['GET'])
def get_pending_transactions():
    pending = Transaction.query.filter_by(status="pending").all()
    result = []
    for t in pending:
        user = User.query.get(t.wallet.user_id)
        result.append({
            "id": t.id,
            "username": user.username if user else "Unknown",
            "type": t.type,
            "amount": t.amount,
            "method": t.method,
            "status": t.status
        })
    return jsonify(result)


@admin_wallet_bp.route('/api/admin/wallet/approve/<int:transaction_id>', methods=['POST'])
def approve_transaction(transaction_id):
    transaction = Transaction.query.get(transaction_id)
    if not transaction:
        return jsonify({"error": "المعاملة غير موجودة"}), 404

    if transaction.status != "pending":
        return jsonify({"error": "لا يمكن الموافقة على معاملة ليست معلقة"}), 400

    transaction.status = "approved"
    db.session.commit()

    user = User.query.get(transaction.wallet.user_id)
    notify_admin(f"✅ تمت الموافقة على طلب {transaction.type} بمبلغ {transaction.amount} للمستخدم {user.username}")

    return jsonify({"message": "تمت الموافقة على المعاملة"})


@admin_wallet_bp.route('/api/admin/wallet/reject/<int:transaction_id>', methods=['POST'])
def reject_transaction(transaction_id):
    transaction = Transaction.query.get(transaction_id)
    if not transaction:
        return jsonify({"error": "المعاملة غير موجودة"}), 404

    if transaction.status != "pending":
        return jsonify({"error": "لا يمكن رفض معاملة ليست معلقة"}), 400

    # في حال كانت العملية سحب، نعيد المال
    if transaction.type == "withdraw":
        transaction.wallet.balance += transaction.amount

    transaction.status = "rejected"
    db.session.commit()

    user = User.query.get(transaction.wallet.user_id)
    notify_admin(f"❌ تم رفض طلب {transaction.type} بمبلغ {transaction.amount} للمستخدم {user.username}")

    return jsonify({"message": "تم رفض المعاملة"})


