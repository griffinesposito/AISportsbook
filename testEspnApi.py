from espnApi import get_team_data, get_team_events,get_team_record,get_team_injuries,get_current_events
from oddsApi import get_sport_scores
import pprint
sport = 'basketball'
league = 'nba'
year = '2023'
team = 'KC'
dates = '20240115-20240129'
response = get_current_events(sport,league,dates)
#response = get_team_events(sport, league, year, team)
#response = get_sport_scores('americanfootball_nfl')
pprint.pprint(response)