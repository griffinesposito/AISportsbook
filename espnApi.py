import requests
base_url = "https://sports.core.api.espn.com/v2/sports"

def get_team_data(sport, league, year, team):
    endpoint = f"{base_url}/{sport}/leagues/{league}/seasons/{year}/teams/{team}?lang=en&region=us"
    params   = {'lang': 'en', 'region': 'us'}
    response = requests.get(endpoint, params=params)
    if response.status_code == 200:
        return response.json()
    else:
        return response.status_code, response.reason