
def register_modules(app):
    """
    تسجيل كل الوحدات (Blueprints) في تطبيق Flask.
    تأكد إن كل وحدة عندها ملف __init__.py معرف فيه blueprint.
    """

    # وحدة المصادقة (تسجيل الدخول/تسجيل حساب)
    from modules.auth import auth_bp
    app.register_blueprint(auth_bp)

    # لو فيه وحدات مستقبلًا زي:
    # from modules.admin import admin_bp
    # app.register_blueprint(admin_bp)

    # from modules.betting import betting_bp
    # app.register_blueprint(betting_bp)
