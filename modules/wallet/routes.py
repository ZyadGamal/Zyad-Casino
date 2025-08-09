import os
import requests
from flask import Blueprint, request, jsonify, current_app
from flask_login import login_required, current_user
from app import db
from models.user import User, Transaction
from models.logs import NotificationLog  # إذا كنت تريد تسجيل التنبيهات في قاعدة البيانات

wallet_bp = Blueprint('wallet', __name__)

# دالة موحدة لإرسال رسالة عبر Telegram مع تسجيل الرسالة في قاعدة البيانات
def send_telegram_message(text):
    token = current_app.config.get('TELEGRAM_BOT_TOKEN') or os.getenv('TELEGRAM_BOT_TOKEN')
    chat_id = current_app.config.get('ADMIN_CHAT_ID') or os.getenv('ADMIN_CHAT_ID')

    if not token or not chat_id:
        print("Telegram bot token or admin chat ID not set.")
        return False

    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "Markdown"
    }

    try:
        response = requests.post(url, json=payload, timeout=10)
        response.raise_for_status()  # رفع استثناء عند أي خطأ HTTP
        # تسجيل الإشعار في قاعدة البيانات
        log = NotificationLog(message=text)
        db.session.add(log)
        db.session.commit()
        return True
    except requests.exceptions.RequestException as e:
        print(f"Failed to send telegram message: {e}")
        return False
    except Exception as e:
        print(f"Failed to log notification: {e}")
        return False

@wallet_bp.route('/wallet/balance', methods=['GET'])
@login_required
def get_balance():
    return jsonify({"balance": current_user.balance})

@wallet_bp.route('/wallet/deposit', methods=['POST'])
@login_required
def deposit():
    data = request.get_json()
    amount = data.get("amount")
    method = data.get("method")

    if amount is None or amount <= 0:
        return jsonify({"error": "مبلغ الإيداع غير صالح"}), 400
    if method not in ["vodafone", "orange"]:
        return jsonify({"error": "طريقة الإيداع غير مدعومة"}), 400

    transaction = Transaction(user_id=current_user.id, type="deposit", amount=amount, method=method, status="pending")
    db.session.add(transaction)
    db.session.commit()

    send_telegram_message(
        f"✅ طلب إيداع جديد:\n"
        f"- المستخدم: {current_user.username}\n"
        f"- المبلغ: {amount} جنيه\n"
        f"- طريقة الدفع: {method}\n"
        f"- الحالة: معلق"
    )

    return jsonify({"message": "تم تقديم طلب الإيداع للمراجعة", "transaction_id": transaction.id})

@wallet_bp.route('/wallet/withdraw', methods=['POST'])
@login_required
def withdraw():
    data = request.get_json()
    amount = data.get("amount")

    if amount is None or amount <= 0:
        return jsonify({"error": "مبلغ السحب غير صالح"}), 400

    if amount > current_user.balance:
        return jsonify({"error": "الرصيد غير كافٍ للسحب"}), 400

    transaction = Transaction(user_id=current_user.id, type="withdraw", amount=amount, status="pending")
    db.session.add(transaction)
    db.session.commit()

    send_telegram_message(
        f"💸 طلب سحب جديد:\n"
        f"- المستخدم: {current_user.username}\n"
        f"- المبلغ: {amount} جنيه\n"
        f"- الحالة: معلق"
    )

    return jsonify({"message": "تم تقديم طلب السحب للمراجعة", "transaction_id": transaction.id})

@wallet_bp.route('/admin/transactions', methods=['GET'])
@login_required
def list_transactions():
    if not getattr(current_user, 'is_admin', False):
        return jsonify({"error": "غير مصرح"}), 403

    transactions = Transaction.query.order_by(Transaction.created_at.desc()).all()
    return jsonify([
        {
            "id": t.id,
            "user": t.user.username,
            "type": t.type,
            "amount": t.amount,
            "method": t.method,
            "status": t.status,
            "created_at": t.created_at.isoformat()
        } for t in transactions
    ])

@wallet_bp.route('/admin/transactions/<int:transaction_id>/approve', methods=['POST'])
@login_required
def approve_transaction(transaction_id):
    if not getattr(current_user, 'is_admin', False):
        return jsonify({"error": "غير مصرح"}), 403

    transaction = Transaction.query.get_or_404(transaction_id)

    if transaction.status != "pending":
        return jsonify({"error": "هذه العملية تم مراجعتها مسبقاً"}), 400

    user = transaction.user
    if transaction.type == "deposit":
        user.balance += transaction.amount
    elif transaction.type == "withdraw":
        if user.balance < transaction.amount:
            return jsonify({"error": "الرصيد غير كافٍ"}), 400
        user.balance -= transaction.amount

    transaction.status = "approved"
    db.session.commit()

    send_telegram_message(
        f"✅ تم الموافقة على طلب {transaction.type}:\n"
        f"- المستخدم: {user.username}\n"
        f"- المبلغ: {transaction.amount} جنيه"
    )

    return jsonify({"message": "تمت الموافقة على العملية بنجاح"})

@wallet_bp.route('/admin/transactions/<int:transaction_id>/reject', methods=['POST'])
@login_required
def reject_transaction(transaction_id):
    if not getattr(current_user, 'is_admin', False):
        return jsonify({"error": "غير مصرح"}), 403

    transaction = Transaction.query.get_or_404(transaction_id)

    if transaction.status != "pending":
        return jsonify({"error": "هذه العملية تم مراجعتها مسبقاً"}), 400

    transaction.status = "rejected"
    db.session.commit()

    send_telegram_message(
        f"❌ تم رفض طلب {transaction.type}:\n"
        f"- المستخدم: {transaction.user.username}\n"
        f"- المبلغ: {transaction.amount} جنيه"
    )

    return jsonify({"message": "تم رفض العملية بنجاح"})

# هذه الرسائل الإضافية (مراقبة النشاط المشبوه) تُرسل عند الحاجة فقط في أماكن أخرى من الكود:
def alert_suspicious_activity(user):
    send_telegram_message(
        f"⚠️ تحذير: تم اكتشاف نشاط مشبوه من المستخدم {user.username}. يرجى المراجعة."
    )
