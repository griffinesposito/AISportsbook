import requests, json, pprint
from asyncRequests import fetch_data
from databaseOperations import convertLeadersDict
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
    data['games']['stats']          = []
    data['statsMetadata']           = dict()
    data['statsMetadata']['abbreviation']       = []
    data['statsMetadata']['description']        = []
    data['statsMetadata']['name']               = []
    data['statsMetadata']['shortDisplayName']   = []
    statMap = dict()
    events_limited = events['items'][::-1]

    while cntWithStats < max_events and cnt < len(events_limited):
        link = events_limited[cnt]
        response = requests.get(link['$ref'])

        if response.status_code != 200:
            return response.status_code, response.reason
        
        event = response.json()
        
        competitors             = event['competitions'][0]['competitors']
        statsForGameExist = False
        for comp in competitors:
            if comp['id'] == team_general['id']: # This is the team data is being requested for
                if 'statistics' not in comp: # This game hasnt happened yet
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
                                statMap[stat['name']] = len(data['games']['stats'])
                                statDict = dict()
                                statDict['name'] = stat['name']
                                statDict['values'] = []
                                data['games']['stats'].append(statDict)
                            
                        
                            data['games']['stats'][statMap[stat['name']]]['values'].append(stat['value'])
                    #if statName in general_stats_to_include:
                    #gameDict['stats'][statName] = statTypeDict['stats']
            else:
                if 'statistics' not in comp:
                    continue
                response = requests.get(comp['score']['$ref'])
                score = response.json()
                data['games']['oppScore'].append(score['displayValue'])

        if statsForGameExist:
            data['games']['id'].append(         event['competitions'][0]['id'])
            data['games']['shortName'].append(  event['shortName'])
            data['games']['date'].append(       event['date'])
            if data['games']['homeAway'][-1] == 'home':
                data['games']['score'].append(f"{data['games']['oppScore'][-1]}-{data['games']['teamScore'][-1]}")
            else:
                data['games']['score'].append(f"{data['games']['teamScore'][-1]}-{data['games']['oppScore'][-1]}")
            cntWithStats = cntWithStats + 1

        cnt = cnt + 1

    return data

def get_current_events(sport, league, dates):
    endpoint = f"{base_url}/{sport.lower()}/leagues/{league.lower()}/events?dates={dates}&lang=en&region=us&limit=100"
    event_list = fetch_data([(endpoint,None)])   
    data = dict()  
    data['events'] = dict()
    event_links = []
    for event_link in event_list[0]['items']:
        event_links.append((event_link['$ref'],None))
    
    events = fetch_data(event_links)
    add_links = dict()

    for event in events:
        event_dict = dict()
        event_dict['name']                      = event['name']
        event_dict['shortName']                 = event['shortName']
        event_dict['date']                      = event['date']
        event_dict['link']                      = dict()
        event_dict['link']['href']              = event['links'][0]['href']
        event_dict['link']['text']              = event['links'][0]['text']

        if not event['id'] in add_links:
            add_links[event['id']] = []

        for competitor in event['competitions'][0]['competitors']:
            if 'score' in competitor:
                add_links[event['id']].append((competitor['homeAway'] + 'teamscore',competitor['score']['$ref']))
            if 'team' in competitor:
                add_links[event['id']].append((competitor['homeAway'] + 'teamdata',competitor['team']['$ref']))

        if 'status' in event['competitions'][0]:
            add_links[event['id']].append(('status',event['competitions'][0]['status']['$ref']))
            
        data['events'][event['id']] = event_dict

    add_data = fetch_data(add_links)
    for dat in add_data:
        event_id = dat['id-request']
        key_id   = dat['key-request']
        if 'teamdata' in key_id:
            data['events'][event_id][key_id] = dat['logos'][0]['href']
        else:
            data['events'][event_id][key_id] = dat
    return data

def get_detailed_event_data(sport, league, eventId, playRef=None, db_params=None):
    endpoint = f"{base_url}/{sport.lower()}/leagues/{league.lower()}/events/{eventId}?lang=en&region=us"
    response = requests.get(endpoint,params={})
    if response.status_code != 200:
        return response.status_code, response.reason  

    event = response.json()  
    data = dict()  
    data['event'] = dict()
    add_links = dict()
    event_dict = dict()
    event_dict['name']                      = event['name']
    event_dict['shortName']                 = event['shortName']
    event_dict['date']                      = event['date']
    event_dict['link']                      = dict()
    event_dict['link']['href']              = event['links'][0]['href']
    event_dict['link']['text']              = event['links'][0]['text']
    if 'weather' in event:
        event_dict['weather']                   = dict()
        event_dict['weather']['displayValue']   = event['weather']['displayValue']
        event_dict['weather']['windSpeed']      = event['weather']['windSpeed']
        event_dict['weather']['windDirection']  = event['weather']['windDirection']
        event_dict['weather']['temperature']    = event['weather']['temperature']
        event_dict['weather']['gust']           = event['weather']['gust']
        event_dict['weather']['precipitation']  = event['weather']['precipitation']
    event_dict['venue']                     = dict()
    if 'venue' in event['competitions'][0] and 'fullName' in event['competitions'][0]['venue']:
        event_dict['venue']['fullName']         = event['competitions'][0]['venue']['fullName']
        if 'images' in event['competitions'][0]['venue']:
            if len(event['competitions'][0]['venue']['images']) >= 1:
                if 'href' in event['competitions'][0]['venue']['images'][0]:
                    event_dict['venue']['image']            = event['competitions'][0]['venue']['images'][0]['href']
        else:
            print('Venue Image Missing...')

    if not event['id'] in add_links:
        add_links[event['id']] = []

    if not 'leaders' in event['competitions'][0]:
        for competitor in event['competitions'][0]['competitors']:
            if 'leaders' in competitor:
                add_links[event['id']].append((competitor['homeAway'] + 'teamleaders',competitor['leaders']['$ref']))
            if 'score' in competitor:
                add_links[event['id']].append((competitor['homeAway'] + 'teamscore',competitor['score']['$ref']))
            if 'team' in competitor:
                add_links[event['id']].append((competitor['homeAway'] + 'teamdata',competitor['team']['$ref']))
    else:
        add_links[event['id']].append(('gameleaders',event['competitions'][0]['leaders']['$ref']))
        for competitor in event['competitions'][0]['competitors']:
            if 'leaders' in competitor:
                add_links[event['id']].append((competitor['homeAway'] + 'teamleaders',competitor['leaders']['$ref']))
            if 'score' in competitor:
                add_links[event['id']].append((competitor['homeAway'] + 'teamscore',competitor['score']['$ref']))
            if 'team' in competitor:
                add_links[event['id']].append((competitor['homeAway'] + 'teamdata',competitor['team']['$ref']))

    if 'predictor' in event['competitions'][0]:
        add_links[event['id']].append(('predictor',event['competitions'][0]['predictor']['$ref']))
    if 'status' in event['competitions'][0]:
        add_links[event['id']].append(('status',event['competitions'][0]['status']['$ref']))
    if 'details' in event['competitions'][0]:
        if not playRef is None:
            add_links[event['id']].append(('details',playRef))
        else:
            add_links[event['id']].append(('details', event['competitions'][0]['details']['$ref'] + '&limit=1'))
        
    data['event'] = event_dict

    add_data = fetch_data(add_links)
    competitorsDict = dict()
    add_links[event['id']] = []
    for dat in add_data:
        event_id = dat['id-request']
        key_id   = dat['key-request']
        if 'teamdata' in key_id:
            data['event'][key_id] = dat['logos'][0]['href']
            competitorsDict[dat['id']] = dat['abbreviation']
            add_links[event['id']].append((key_id[:-4] + 'leaders',dat['leaders']['$ref']))
        elif 'details' in key_id:
            dat['newLink'] = dat['$ref'] + f'&limit=1&page={dat["pageCount"]}'
            if dat["pageIndex"] != dat["pageCount"]:
                response = requests.get(dat['newLink'],params={}) 
                updatedDat = response.json() 
                data['event'][key_id] = updatedDat
            else:
                data['event'][key_id] = dat
        else:
            data['event'][key_id] = dat

    if 'hometeamleaders' not in data['event'] or 'awayteamleaders' not in data['event']:
        add_data = fetch_data(add_links)
        for dat in add_data:
            key_id   = dat['key-request']
            data['event'][key_id] = dat



    if 'gameleaders' in data['event']:
        # convert gameleaders to include more athlete info
        convertLeadersDict(data['event']['gameleaders'],competitorsDict,db_params)
    if 'hometeamleaders' in data['event']:
        # convert hometeamleaders to include more athlete info
        convertLeadersDict(data['event']['hometeamleaders'],competitorsDict,db_params)
    if 'awayteamleaders' in data['event']:
        # convert hometeamleaders to include more athlete info
        convertLeadersDict(data['event']['awayteamleaders'],competitorsDict,db_params)

    return data

