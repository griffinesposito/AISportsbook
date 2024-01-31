from espnApi import get_team_data, get_team_events,get_team_record,get_team_injuries,get_current_events,get_detailed_event_data
from oddsApi import get_sport_scores
from pythonUtils import get_time_range_str
import pprint
sport = 'basketball'
league = 'nba'
year = '2023'
team = 'KC'
dates = get_time_range_str(0)
dates = '20240123-20240129'
eventId = '401585301'
#response = get_current_events(sport,league,dates)
response = get_detailed_event_data(sport,league,eventId)

for key, event in response['events'].items():
    if event["status"]["type"]["id"] == '2':
        pprint.pprint(key)
#response = get_team_events(sport, league, year, team)
#response = get_sport_scores('americanfootball_nfl')