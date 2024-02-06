import re

def extract_athlete_id(url):
    # Use a regular expression to extract the ID following 'athletes/'
    match = re.search(r'athletes/(\d+)', url)
    if match:
        return match.group(1)  # Returns the captured group, which is the ID
    else:
        return "No athlete ID found in URL."

def extract_team_id(url):
    # Use a regular expression to extract the ID following 'athletes/'
    match = re.search(r'teams/(\d+)', url)
    if match:
        return match.group(1)  # Returns the captured group, which is the ID
    else:
        return "No team ID found in URL."

def extract_league(url):
    # Use regex to find the pattern after 'leagues/'
    match = re.search(r'leagues/([^/]+)', url)
    if match:
        # Return the captured group which is after 'leagues/'
        return match.group(1)
    else:
        return "No league found in URL."
