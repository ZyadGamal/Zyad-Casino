from flask import Blueprint

games_bp = Blueprint('games', __name__)

@games_bp.route('/')
def games_home():
    return {"games": ["Crash", "Crystal", "Gems & Mines", "Apple of Fortune", "Under & Over 7", "Fruit Cocktail", "Plinko", "Wild West Gold", "Thimbles", "Lucky Wheel"]}
