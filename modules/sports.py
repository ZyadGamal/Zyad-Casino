from flask import Blueprint, jsonify
from models.sport import League, Team, SportEvent
from models.base import db

sports_bp = Blueprint('sports_bp_unique', __name__)

@sports_bp.route('/sync', methods=['POST'])
def sync_matches():
    url = "https://api-football-v1.p.rapidapi.com/v3/fixtures"
    querystring = {"next": "20"}

    response = requests.get(url, headers=headers, params=querystring)

    if response.status_code != 200:
        return jsonify({"error": "API request failed"}), 500

    data = response.json()['response']

    created = 0
    for item in data:
        fixture = item['fixture']
        league_data = item['league']
        home_data = item['teams']['home']
        away_data = item['teams']['away']

        # 🏆 League
        league = League.query.filter_by(api_id=league_data['id']).first()
        if not league:
            league = League(api_id=league_data['id'], name=league_data['name'], country=league_data['country'])
            db.session.add(league)

        # 🏠 Home Team
        home_team = Team.query.filter_by(api_id=home_data['id']).first()
        if not home_team:
            home_team = Team(api_id=home_data['id'], name=home_data['name'])
            db.session.add(home_team)

        # 🛫 Away Team
        away_team = Team.query.filter_by(api_id=away_data['id']).first()
        if not away_team:
            away_team = Team(api_id=away_data['id'], name=away_data['name'])
            db.session.add(away_team)

        # ⚽ Event
        event = SportEvent.query.filter_by(api_id=fixture['id']).first()
        if not event:
            event = SportEvent(
                api_id=fixture['id'],
                league=league,
                home_team=home_team,
                away_team=away_team,
                start_time=fixture['date'],
                status=fixture['status']['long']
            )
            db.session.add(event)
            created += 1

    db.session.commit()
    return jsonify({"message": f"{created} events synced successfully."})