def register_modules(app):
    # مكان تسجيل البلوبرينت
    pass
    from modules.users import users_bp
    from modules.wallet import wallet_bp
    from modules.games import games_bp
    from modules.admin import admin_bp
    from modules.notifications.telegram_bot import notify_admin
    from modules.sports_data import sports_bp
    from modules.admin.wallet_routes import admin_wallet_bp
    from modules.sports import sports_bp

    app.register_blueprint(admin_wallet_bp)
    app.register_blueprint(users_bp, url_prefix='/users')
    app.register_blueprint(games_bp, url_prefix='/games')
    app.register_blueprint(admin_bp, url_prefix='/admin')
    app.register_blueprint(wallet_bp, url_prefix="/api/wallet")
    app.register_blueprint(sports_bp, url_prefix="/api/sports")
