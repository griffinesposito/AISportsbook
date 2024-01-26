from espnApi import get_team_data, get_team_events,get_team_record,get_team_injuries,get_current_events
from oddsApi import get_sport_scores
from pythonUtils import get_time_range_str
import pprint
sport = 'basketball'
league = 'nba'
year = '2023'
team = 'KC'
dates = get_time_range_str(0)
#dates = '20240124-20240124'
response = get_current_events(sport,league,dates)
#response = get_team_events(sport, league, year, team)
#response = get_sport_scores('americanfootball_nfl')
pprint.pprint(response)