from flask import render_template, redirect, url_for, request, flash, session
from werkzeug.security import generate_password_hash, check_password_hash
from models.user import User
from modules.auth import auth_bp
from app import db
from flask import Blueprint

auth_bp = Blueprint('auth', __name__, template_folder='templates')

from . import routes  # ← لازم السطر ده عشان يشغل المسارات

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # التحقق من المدخلات
    if is_malicious_input(data.get('username')) or is_malicious_input(data.get('password')):
        log_security_event('MALICIOUS_INPUT', f"Register attempt: {data}")
        return jsonify({"error": "Invalid input detected"}), 400
    
    # باقي الكود...

@auth_bp.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        email = request.form['email']
        password = request.form['password']

        existing_user = User.query.filter((User.username == username) | (User.email == email)).first()
        if existing_user:
            flash('اسم المستخدم أو البريد الإلكتروني موجود بالفعل.')
            return redirect(url_for('auth.register'))

        hashed_password = generate_password_hash(password)
        user = User(username=username, email=email, password_hash=hashed_password)
        db.session.add(user)
        db.session.commit()
        flash('تم التسجيل بنجاح! يمكنك تسجيل الدخول الآن.')
        return redirect(url_for('auth.login'))

    return render_template('auth/register.html')

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        user = User.query.filter_by(email=email).first()
        if user and check_password_hash(user.password_hash, password):
            session['user_id'] = user.id
            flash('تم تسجيل الدخول بنجاح.')
            return redirect(url_for('dashboard'))
        flash('بيانات الدخول غير صحيحة.')
    return render_template('auth/login.html')

@auth_bp.route('/logout')
def logout():
    session.pop('user_id', None)
    flash('تم تسجيل الخروج.')
    return redirect(url_for('auth.login'))
