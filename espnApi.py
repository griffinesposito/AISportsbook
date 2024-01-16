import requests, json, pprint
base_url    = "https://sports.core.api.espn.com/v2/sports"
max_events  = 25
football_stats_to_include = ['fumblesLost','fumblesForced',
                             'completionPct','completions','QBRating','ESPNQBRating',
                             'interceptions','netPassingYards','netTotalYards',
                             'passingAttempts','totalPoints',
                             'ESPNRBRating', 'rushingAttempts','rushingYards','yardsPerRushAttempt',
                             'ESPNWRRating','receivingTargets','receivingYards','receptions',
                             'receivingYardsAfterCatch','yardsPerReception','sacks'
                             'fieldGoalPct','fieldGoalAttempts','fieldGoalsMade'
                             'passingTouchdowns','receivingTouchdowns','rushingTouchdowns']


basketball_stats_to_include = ['blocks','defensiveRebounds','steals',
                               'largestLead','rebounds','NBARating',
                               'doubleDouble','tripleDouble',
                               'assists','fieldGoals','fieldGoalsAttempted','fieldGoalsMade',
                               'offensiveRebounds','points','turnovers','threePointPct',
                               'threePointFieldGoalsAttempted','threePointFieldGoalsMade',
                               'fieldGoalPct','freeThrows','freeThrowsAttempted',
                               'freeThrowsMade','freeThrowPct','pointsInPaint','fastBreakPoints','fouls']

baseball_stats_to_include = ['groundBalls','strikeouts','RBIs','stolenBases',
                             'walks','runs','homeRuns','grandSlamHomeRuns',
                             'triples','doubles','avg','MLBRating','doublePlays',
                             'errors','fieldingPct','pickoffs','perfectGames']

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
    if sport == 'football':
        stats_to_include = football_stats_to_include
    elif sport == 'baseball':
        stats_to_include = baseball_stats_to_include
    else:
        stats_to_include = basketball_stats_to_include

    # Get General Team Information
    response = requests.get(endpoint,params=params)
    if response.status_code != 200:
        return response.status_code, response.reason  

    team_general = response.json()     
    data = dict()
    
    # Get additional team information - events
    response = requests.get(team_general['events']['$ref'],params={'limit': '250'})
    if response.status_code != 200:
        return response.status_code, response.reason
    
    events   = response.json()
    cntWithStats = 0
    cnt = 0
    data['games']                   = dict()
    data['games']['id']             = []
    data['games']['shortName']      = []
    data['games']['date']           = []
    data['games']['homeAway']       = []
    data['games']['teamScore']      = []
    data['games']['oppScore']       = []
    data['games']['score']          = []
    data['games']['winner']         = []
    data['games']['stats']          = dict()
    data['statsMetadata']           = dict()
    data['statsMetadata']['abbreviation']       = []
    data['statsMetadata']['description']        = []
    data['statsMetadata']['name']               = []
    data['statsMetadata']['shortDisplayName']   = []

    events_limited = events['items'][::-1]

    while cntWithStats < max_events and cnt < len(events_limited):
        link = events_limited[cnt]
        response = requests.get(link['$ref'])

        if response.status_code != 200:
            return response.status_code, response.reason
        
        event = response.json()
        gameDict = dict()
        data['games']['id'].append(         event['competitions'][0]['id'])
        data['games']['shortName'].append(  event['shortName'])
        data['games']['date'].append(       event['date'])
        competitors             = event['competitions'][0]['competitors']
        statsForGameExist = False
        for comp in competitors:
            if comp['id'] == team_general['id']: # This is the team data is being requested for
                if 'statistics' not in comp:
                    continue
                statsForGameExist = True
                data['games']['homeAway'].append(comp['homeAway'])

                response = requests.get(comp['score']['$ref'])
                score = response.json()
                data['games']['teamScore'].append(score['displayValue'])
                data['games']['winner'].append(score['winner'])

                response = requests.get(comp['statistics']['$ref'])
                if response.status_code != 200:
                    return response.status_code, response.reason
                stats = response.json()

                for statTypeDict in stats['splits']['categories']:
                    statName = statTypeDict['name']
                    for stat in statTypeDict['stats']:
                        if stat['name'] in stats_to_include:
                            if not stat['name'] in data['statsMetadata']['name']:
                                data['statsMetadata']['name'].append(stat['name'])
                                data['statsMetadata']['abbreviation'].append(stat['abbreviation'])
                                data['statsMetadata']['description'].append(stat['description'])
                                data['statsMetadata']['shortDisplayName'].append(stat['shortDisplayName'])
                                data['games']['stats'][stat['name']] = []
                            data['games']['stats'][stat['name']].append(stat['value'])
                    #if statName in general_stats_to_include:
                    #gameDict['stats'][statName] = statTypeDict['stats']
            else:
                if 'statistics' not in comp:
                    continue
                response = requests.get(comp['score']['$ref'])
                score = response.json()
                data['games']['oppcore']  = score['displayValue']

        if statsForGameExist:
            if data['games']['homeAway'][-1] == 'home':
                data['games']['score'].append(f"{data['games']['oppScore'][:-1]}-{data['games']['teamScore'][:-1]}")
            else:
                data['games']['score'].append(f"{data['games']['teamScore'][:-1]}-{data['games']['oppScore'][:-1]}")
            cntWithStats = cntWithStats + 1

        cnt = cnt + 1

    return data