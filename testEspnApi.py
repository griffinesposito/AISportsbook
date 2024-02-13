from espnApi import get_team_data, get_team_events,get_team_record,get_team_injuries,get_current_events,get_detailed_event_data
from oddsApi import get_sport_scores
from pythonUtils import get_time_range_str
from regExpressions import extract_athlete_id
import pprint
sport = 'basketball'
league = 'nba'
year = '2023'
team = 'KC'
dates = get_time_range_str(0)
dates = '20240123-20240129'
eventId = '401585349'
db_params = {
    'dbname': "neondb",
    'user': "neon",
    'password': "3BwHa8VGfovZ",
    'host': "ep-solitary-meadow-09767890.us-east-2.aws.neon.tech"
}

db_params = {
    'user': "espositogriffin",
    'password': "xqjY0Udl4aFf",
    'host': "ep-old-sky-a5vq08oi-pooler.us-east-2.aws.neon.tech",
    'dbname': "ai-sportsbook-db"
}
#response = get_current_events(sport,league,dates)
response = get_detailed_event_data(sport,league,eventId,db_params=db_params)

#for key, event in response['events'].items():
#    if event["status"]["type"]["id"] == '2':
#        pprint.pprint(key)
#response = get_team_events(sport, league, year, team)
#response = get_sport_scores('americanfootball_nfl')
        
# Test the function with the provided URL
url = "http://sports.core.api.espn.com/v2/sports/basketball/leagues/nba/seasons/2024/athletes/3975?lang=en&region=us"
athlete_id = extract_athlete_id(url)
pprint.pprint(athlete_id)