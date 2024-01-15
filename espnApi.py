import requests, json, pprint
base_url = "https://sports.core.api.espn.com/v2/sports"
general_stats_to_include = ['general','passing','rushing','receiving','scoring']

def get_team_data(sport, league, year, team):

    endpoint = f"{base_url}/{sport.lower()}/leagues/{league.lower()}/seasons/{year}/teams/{team}?lang=en&region=us"
    params   = {'lang': 'en', 'region': 'us'}
    # Get General Team Information
    response = requests.get(endpoint, params=params)
    if response.status_code != 200:
        return response.status_code, response.reason
        
    data = dict()
    team_general = response.json()
    
    # Assign output data from team general info
    data['displayName'] = team_general['displayName']
    data['id']          = team_general['id']
    data['links']       = team_general['links']
    data['location']    = team_general['location']
    data['logos']       = team_general['logos']
    return data

def get_team_record(sport, league, year, team):
    endpoint = f"{base_url}/{sport.lower()}/leagues/{league.lower()}/seasons/{year}/teams/{team}?lang=en&region=us"
    params   = {'lang': 'en', 'region': 'us'}
    # Get General Team Information
    response = requests.get(endpoint, params=params)
    if response.status_code != 200:
        return response.status_code, response.reason
        
    data = dict()
    team_general = response.json()
    # Get additional team information - record
    response = requests.get(team_general['record']['$ref'])
    if response.status_code != 200:
        return response.status_code, response.reason
    record = response.json()
    data['record'] = record['items']
    return data

def get_team_injuries(sport, league, year, team):
    endpoint = f"{base_url}/{sport.lower()}/leagues/{league.lower()}/seasons/{year}/teams/{team}?lang=en&region=us"
    params   = {'lang': 'en', 'region': 'us'}
    # Get General Team Information
    response = requests.get(endpoint, params=params)
    if response.status_code != 200:
        return response.status_code, response.reason
        
    data = dict()
    team_general = response.json()
    # Get additional team information - injuries
    response = requests.get(team_general['injuries']['$ref'])
    if response.status_code != 200:
        return response.status_code, response.reason
    injuries = response.json()
    cnt = 0
    data['injuries'] = dict()
    for link in injuries['items']:
        response = requests.get(link['$ref'])
        if response.status_code != 200:
            return response.status_code, response.reason
        injury = response.json()
        injuryDict = dict()
        injuryDict['id']            = injury['id']
        injuryDict['longComment']   = injury['longComment']
        injuryDict['status']        = injury['status']
        injuryDict['date']          = injury['date']
        if 'details' in injury:
            if 'type' in injury['details']:
                injuryDict['type']          = injury['details']['type']
            else:
                injuryDict['type']          = "N/A"
            if 'returnDate' in injury['details']:
                injuryDict['returnDate']    = injury['details']['returnDate']
            else:
                injuryDict['returnDate']    = "N/A"
        else:
            injuryDict['type']          = "N/A"
            injuryDict['returnDate']    = "N/A"

        athleteLink = injury['athlete']['$ref']
        response = requests.get(athleteLink)
        if response.status_code != 200:
            return response.status_code, response.reason
        athlete = response.json()
        injuryDict['playerName']    = athlete['fullName']
        injuryDict['playerPosition']= athlete['position']['abbreviation']
        data['injuries'][cnt] = injuryDict
        cnt = cnt + 1
    return data

def get_team_events(sport, league, year, team):
    endpoint = f"{base_url}/{sport.lower()}/leagues/{league.lower()}/seasons/{year}/teams/{team}?lang=en&region=us"
    params   = {'lang': 'en', 'region': 'us'}
    # Get General Team Information
    response = requests.get(endpoint, params=params)
    if response.status_code != 200:
        return response.status_code, response.reason
        
    data = dict()
    team_general = response.json()
    # Get additional team information - events
    response = requests.get(team_general['events']['$ref'])
    if response.status_code != 200:
        return response.status_code, response.reason
    events   = response.json()
    cnt = 0
    data['games'] = dict()
    for link in events['items']:
        response = requests.get(link['$ref'])
        if response.status_code != 200:
            return response.status_code, response.reason
        event = response.json()
        gameDict = dict()
        gameDict['id']          = event['competitions'][0]['id']
        gameDict['shortName']   = event['shortName']
        competitors             = event['competitions'][0]['competitors']
        for comp in competitors:
            if comp['id'] == team_general['id']: # This is the team data is being requested for
                response = requests.get(comp['statistics']['$ref'])
                if response.status_code != 200:
                    return response.status_code, response.reason
                stats = response.json()
                gameDict['stats'] = dict()
                for statTypeDict in stats['splits']['categories']:
                    statName = statTypeDict['name']
                    if statName in general_stats_to_include:
                        gameDict['stats'][statName] = statTypeDict['stats']
        data['games'][cnt] = gameDict
        cnt = cnt + 1
    return data