from flask import Blueprint, jsonify
from models.sport import League, SportEvent
from modules.sports_data.sync import sync_sport_events
from app import db

sports_bp = Blueprint('sports', __name__)

@sports_bp.route('/sports/sync')
def sync_sports():
    sync_sport_events()
    return {"status": "sports synced"}

@sports_bp.route('/leagues')
def get_leagues():
    leagues = League.query.all()
    return jsonify([{"id": l.id, "name": l.name, "country": l.country} for l in leagues])

@sports_bp.route('/events/<int:league_id>')
def get_events_by_league(league_id):
    events = SportEvent.query.filter_by(league_id=league_id).all()
    return jsonify([
        {
            "id": e.id,
            "home_team": e.home_team,
            "away_team": e.away_team,
            "date": e.event_date.isoformat(),
            "status": e.status,
            "odds": e.odds
        } for e in events
    ])
@sports_bp.route('/sports/live')
def get_live_matches():
    from models.sport import SportEvent, League
    from datetime import datetime

    # نجلب فقط المباريات التي حالتها "live"
    live_events = SportEvent.query.filter(SportEvent.status == "live").all()

    return jsonify([
        {
            "id": e.id,
            "home_team": e.home_team,
            "away_team": e.away_team,
            "event_date": e.event_date.isoformat(),
            "league": League.query.get(e.league_id).name if e.league_id else "دوري غير معروف",
            "status": e.status,
            "odds": e.odds
        }
        for e in live_events
    ])
