import requests
from bs4 import BeautifulSoup
from pythonUtils import convert_list_to_json
import re
from requests_html import HTMLSession

def nba_player_recent_stats(url):
    # Send a GET request to the webpage
    response = requests.get(url)
    # Check if the request was successful
    if response.status_code == 200:
        # Parse the page content using BeautifulSoup
        soup = BeautifulSoup(response.content, 'html.parser')
        #print(soup)
        # Find the table by an identifier - update this selector as needed
        table = soup.find('div', attrs={'class': 'MockStatsTable_statsTable__V_Skx'}) # Update the class to match the table's class
        # Initialize a list to store the data
        data = []
        # Iterate over each row in the table
        cnt = 1
        for row in table.find_all('tr'):
            if cnt == 1:
                header = [col.text.strip() for col in row.find_all('th')]
                data.append(header)
            else:
                # Extract the text from each cell in the row
                cols = [col.text.strip() for col in row.find_all('td')]
                # Append the data of the row to the list
                data.append(cols)
            cnt = cnt + 1
        
        if not data:
            response = None
        else:
            response = convert_list_to_json(data)

        return response
    else:
        print(f"Failed to retrieve the webpage. Status code: {response.status_code}")
        return None

def nba_player_career_stats(url):
    # Send a GET request to the webpage
    session = HTMLSession()
    response = session.get(url)
    # Check if the request was successful
    if response.status_code == 200:
        response.html.render()
        base = response.html.xpath('/html/body/div[1]/div[2]/div[2]/section/div[4]/section[3]/div')
        print(base)
        # Parse the page content using BeautifulSoup
        #soup = BeautifulSoup(response.content, 'html.parser')
        with open('output.txt', 'w', encoding='utf-8') as file:
            # Write the content of the response to the file
            file.write(response.html.text)
        
        with open('output_bs4.txt', 'w', encoding='utf-8') as file:
            # Write the content of the response to the file
            file.write(str(soup))
        #print(response.content)
        #print(soup)
        # Find the table by an identifier - update this selector as needed
        table = soup.find('div', attrs={'class': "Crom_base__f0niE"}) # Update the class to match the table's class
        print(table)
        # Initialize a list to store the data
        data = []
        # Iterate over each row in the table
        cnt = 1
        for row in table.find_all('tr'):
            if cnt == 1:
                header = [col.text.strip() for col in row.find_all('th')]
                data.append(header)
            else:
                # Extract the text from each cell in the row
                cols = [col.text.strip() for col in row.find_all('td')]
                # Append the data of the row to the list
                data.append(cols)
            cnt = cnt + 1

        if not data:
            response = None
        else:
            response = convert_list_to_json(data)

        return response
    else:
        print(f"Failed to retrieve the webpage. Status code: {response.status_code}")
        return None

# URL of the player's statistics page
#url = 'https://www.nba.com/player/202704'
#player_stats = nba_player_recent_stats(url)
#print(player_stats)

url = 'https://www.nba.com/stats/player/202704/career'
player_stats = nba_player_career_stats(url)
print(player_stats)
