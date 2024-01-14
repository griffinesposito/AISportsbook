import requests
from bs4 import BeautifulSoup
import re
import json
def scrape_nba_player_id(url,playerName):
    # Send a GET request to the webpage
    response = requests.get(url)
    # Check if the request was successful
    if response.status_code == 200:
        # Parse the page content using BeautifulSoup
        soup = BeautifulSoup(response.content, 'html.parser')
        #print(soup)
        # Find the table by an identifier - update this selector as needed
        #link = soup.find(string=playerName) # Update the class to match the table's class
        case_insensitive_results = soup.find(string=re.compile(playerName, re.IGNORECASE))
        # Parse the JSON string into a Python dictionary
        data = json.loads(str(case_insensitive_results))

        # Initialize the variable to store DeMar DeRozan's @id
        id = None

        # Iterate through each athlete in the athlete list
        for athlete in data.get('athlete', []):
            # Check if the name is playerName
            print(athlete.get('name'))
            if playerName.lower() in athlete.get('name').lower():
                # If found, store the @id in a variable
                id = athlete.get('@id')
                print(id)
                break
        #print(case_insensitive_results)
        #print(case_insensitive_results.__dir__())
        # Initialize a list to store the data
        return id
    else:
        print(f"Failed to retrieve the webpage. Status code: {response.status_code}")
        return None

# URL of the teams's statistics page
url = 'https://www.nba.com/stats/team/1610612743'
playerName = "Reggie"
# Scrape the table
player_id = scrape_nba_player_id(url,playerName)
print(player_id)
