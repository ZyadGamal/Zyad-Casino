from flask import Blueprint, request, jsonify
from models import db, User, Wallet, Transaction

wallet_bp = Blueprint('wallet', __name__)

def get_notifier():
    """دالة مساعدة لاستيراد notifier عند الحاجة فقط"""
    from modules.notifications.telegram_bot import notify_admin
    return notify_admin

@wallet_bp.route('/api/wallet/deposit', methods=['POST'])
def deposit():
    data = request.get_json()
    user_id = data.get('user_id')
    amount = data.get('amount')
    method = data.get('method')

    # التحقق من البيانات
    if not all([user_id, amount, method]):
        return jsonify({"error": "بيانات ناقصة"}), 400

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "المستخدم غير موجود"}), 404

    wallet = Wallet.query.filter_by(user_id=user.id).first()
    if not wallet:
        wallet = Wallet(user_id=user.id, balance=0)
        db.session.add(wallet)
        db.session.commit()

    try:
        amount = float(amount)
        if amount <= 0:
            raise ValueError
    except ValueError:
        return jsonify({"error": "المبلغ غير صالح"}), 400

    # تنفيذ العملية
    wallet.balance += amount
    transaction = Transaction(
        wallet_id=wallet.id,
        amount=amount,
        type='deposit',
        status='completed',
        method=method
    )
    db.session.add(transaction)
    db.session.commit()

    # إرسال الإشعار
    try:
        notify_admin = get_notifier()
        notify_admin(
            f"💰 *إيداع جديد*\n"
            f"- المستخدم: {user.username}\n"
            f"- المبلغ: {amount} جنيه\n"
            f"- الوسيلة: {method}"
        )
    except Exception as e:
        print(f"فشل إرسال الإشعار: {e}")

    return jsonify({
        "message": "تم الإيداع بنجاح",
        "new_balance": wallet.balance,
        "transaction_id": transaction.id
    })

@wallet_bp.route('/api/wallet/withdraw', methods=['POST'])
def withdraw():
    data = request.get_json()
    user_id = data.get('user_id')
    amount = data.get('amount')

    if not all([user_id, amount]):
        return jsonify({"error": "بيانات ناقصة"}), 400

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "المستخدم غير موجود"}), 404

    wallet = Wallet.query.filter_by(user_id=user.id).first()
    if not wallet or wallet.balance < float(amount):
        return jsonify({"error": "الرصيد غير كافٍ"}), 400

    try:
        amount = float(amount)
        if amount <= 0:
            raise ValueError
    except ValueError:
        return jsonify({"error": "المبلغ غير صالح"}), 400

    wallet.balance -= amount
    transaction = Transaction(
        wallet_id=wallet.id,
        amount=amount,
        type='withdraw',
        status='pending'
    )
    db.session.add(transaction)
    db.session.commit()

    # إرسال الإشعار
    try:
        notify_admin = get_notifier()
        notify_admin(
            f"📤 *طلب سحب جديد*\n"
            f"- المستخدم: {user.username}\n"
            f"- المبلغ: {amount} جنيه\n"
            f"- الحالة: Pending"
        )
    except Exception as e:
        print(f"فشل إرسال الإشعار: {e}")

    return jsonify({
        "message": "تم تقديم طلب السحب",
        "new_balance": wallet.balance,
        "transaction_id": transaction.id
    })

@wallet_bp.route('/api/wallet/transactions', methods=['GET'])
def get_transactions():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({"error": "يجب توفير user_id"}), 400

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "المستخدم غير موجود"}), 404

    wallet = Wallet.query.filter_by(user_id=user.id).first()
    if not wallet:
        return jsonify({"transactions": []})

    transactions = Transaction.query.filter_by(wallet_id=wallet.id)\
        .order_by(Transaction.created_at.desc())\
        .all()

    return jsonify([
        {
            "id": t.id,
            "amount": t.amount,
            "type": t.type,
            "method": t.method,
            "status": t.status,
            "timestamp": t.created_at.isoformat(),
            "reference": t.reference
        } for t in transactions
    ])