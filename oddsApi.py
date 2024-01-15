import requests

# Even better, use best practices and store it as a secret (not hard-coded!)
api_key = "d49677105cab61622d60e57635c1b4dd"

def get_in_season_sports():
    params = {"apiKey": api_key}
    base_url = "https://api.the-odds-api.com/v4/sports"
    response = requests.get(base_url, params=params)
    if response.status_code == 200:
        return response.json()
    else:
        return response.status_code, response.reason

def get_sports_odds(sport,
                    regions,
                    markets=None,
                    dateFormat=None,
                    oddsFormat=None,
                    eventIds=None,
                    bookmakers=None,
                    commenceTimeFrom=None,
                    commenceTimeTo=None):
    base_url = "https://api.the-odds-api.com/v4/sports"
    endpoint = f"{base_url}/{sport}/odds/"

    params = {'apiKey': api_key, 'regions': regions}
    # Add other parameters if they exist
    # ...
    if markets is not None:
        params['markets'] = markets
    if dateFormat is not None:
        params['dateFormat'] = dateFormat
    if oddsFormat is not None:
        params['oddsFormat'] = oddsFormat
    else:
        params['oddsFormat'] = 'american'
    if eventIds is not None:
        params['eventIds'] = eventIds
    if bookmakers is not None:
        params['bookmakers'] = bookmakers
    if commenceTimeFrom is not None:
        params['commenceTimeFrom'] = commenceTimeFrom
    if commenceTimeTo is not None:
        params['commenceTimeTo'] = commenceTimeTo

    response = requests.get(endpoint, params=params)
    if response.status_code == 200:
        return response.json()
    else:
        return response.status_code, response.reason


def get_event_odds( sport,
                    regions,
                    eventId,
                    markets=None,
                    playerPropsFootball=None,
                    playerPropsBasketball=None,
                    playerPropsBaseball=None,
                    gamePeriodMarkets=None,
                    dateFormat=None,
                    oddsFormat=None,
                    bookmakers=None):
    base_url = "https://api.the-odds-api.com/v4/sports"
    endpoint = f"{base_url}/{sport}/events/{eventId}/odds/"

    params = {'apiKey': api_key, 'regions': regions}
    # Add other parameters if they exist
    # ...
    if markets is not None:
        params['markets'] = markets
    if playerPropsFootball is not None:
        params['markets'] = playerPropsFootball
    if playerPropsBasketball is not None:
        params['markets'] = playerPropsBasketball
    if playerPropsBaseball is not None:
        params['markets'] = playerPropsBaseball
    if gamePeriodMarkets is not None:
        params['markets'] = gamePeriodMarkets
    if dateFormat is not None:
        params['dateFormat'] = dateFormat
    if oddsFormat is not None:
        params['oddsFormat'] = oddsFormat
    else:
        params['oddsFormat'] = 'american'
    if bookmakers is not None:
        params['bookmakers'] = bookmakers

    response = requests.get(endpoint, params=params)
    if response.status_code == 200:
        return response.json()
    else:
        return response.status_code, response.reason

def get_sport_scores(sport, daysFrom=None, dateFormat=None, eventIds=None):
    base_url = "https://api.the-odds-api.com/v4/sports"
    endpoint = f"{base_url}/{sport}/scores/"
    
    params = {
        'apiKey': api_key,
    }
    if daysFrom is not None:
        params['daysFrom'] = daysFrom
    if dateFormat is not None:
        params['dateFormat'] = dateFormat
    if eventIds is not None:
        params['eventIds'] = eventIds
        
    response = requests.get(endpoint, params=params)
    
    if response.status_code == 200:
        return response.json()
    else:
        return response.status_code, response.reason