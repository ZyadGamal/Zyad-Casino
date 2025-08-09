from modules.sports_data.api_client import fetch_all_leagues, fetch_latest_fixtures
from models.sport import League, SportEvent
from app import db
from datetime import datetime

def sync_sport_events():
    leagues_data = fetch_all_leagues()
    fixtures_data = fetch_latest_fixtures()

    for l in leagues_data:
        league_info = l["league"]
        country_info = l["country"]
        season_info = l["seasons"][-1]

        if int(season_info["year"]) != 2025:
            continue

        league = League.query.filter_by(name=league_info["name"]).first()
        if not league:
            league = League(
                name=league_info["name"],
                country=country_info["name"]
            )
            db.session.add(league)

    db.session.commit()

    for f in fixtures_data:
        fixture = f["fixture"]
        teams = f["teams"]
        league = f["league"]

        league_obj = League.query.filter_by(name=league["name"]).first()
        if not league_obj:
            continue

        exists = SportEvent.query.filter_by(
            home_team=teams["home"]["name"],
            away_team=teams["away"]["name"],
            event_date=datetime.fromtimestamp(fixture["timestamp"])
        ).first()

        if not exists:
            new_event = SportEvent(
                league_id=league_obj.id,
                home_team=teams["home"]["name"],
                away_team=teams["away"]["name"],
                event_date=datetime.fromtimestamp(fixture["timestamp"]),
                status=fixture["status"]["short"],
                odds=1.5
            )
            db.session.add(new_event)

    db.session.commit()