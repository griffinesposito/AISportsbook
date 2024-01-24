import psycopg2.pool
import os
from databaseMaintenance import create_player_table, create_team_table
import requests, json, pprint
from asyncRequests import fetch_data
from pprint import pprint
# Database connection parameters
dbname = "neondb"
user = "neon"
password = "3BwHa8VGfovZ"
host = "ep-solitary-meadow-09767890.us-east-2.aws.neon.tech"




# Connect to the database
conn = psycopg2.connect(dbname=dbname, user=user, password=password, host=host)
cursor = conn.cursor()

# Create tables
#create_player_table(cursor,conn,"nfl_players")
#create_player_table(cursor,conn,"nba_players")
#create_player_table(cursor,conn,"mlb_players")
#create_team_table(cursor,conn,"nfl_teams")
#create_team_table(cursor,conn,"nba_teams")
#create_team_table(cursor,conn,"mlb_teams")

# Fill team tables
#NBA
def configureNBATables():
    endpoint = "https://sports.core.api.espn.com/v2/sports/basketball/leagues/nba/teams?limit=100"
    response = requests.get(endpoint)
    teams = response.json()
    team_links = []
    for link in teams['items']:
        team_links.append((link['$ref'],None))
    teamArray = fetch_data(team_links)

    for team in teamArray:
        # Example data to insert
        teamName = team['abbreviation']
        fullName = team['displayName']
        teamId = team['id']
        tableName = "nba_teams"
        playerTable = f"nba_{teamName}_players"
        create_player_table(cursor,conn,playerTable)
        
        # SQL query to check if the row already exists
        check_query = f"""
        SELECT 1 FROM {tableName} WHERE teamName = %s AND teamId = %s;
        """

        # Execute the check query
        cursor.execute(check_query, (teamName, teamId))
        result = cursor.fetchone()

        if result is None:
            # Row does not exist, safe to insert
            insert_query = f"""
            INSERT INTO {tableName} (teamName, fullName, teamId) 
            VALUES (%s, %s, %s);
            """
            cursor.execute(insert_query, (teamName, fullName, teamId))
            conn.commit()
            print("Row inserted.")
        else:
            print("Row already exists.")

        athletesEndpoint = f"https://sports.core.api.espn.com/v2/sports/basketball/leagues/nba/seasons/2024/teams/{teamId}/athletes?lang=en&region=us&limit=500"
        athletesArray = fetch_data([(athletesEndpoint,None)])
        athletesLinks = []
        for athlete_link in athletesArray[0]['items']:
            athletesLinks.append((athlete_link['$ref'],None))
            
        athletesData = fetch_data(athletesLinks)
        for athData in athletesData:
            firstName   = athData['firstName']
            lastName    = athData['lastName']
            displayName = athData['displayName']
            position    = athData['position']['displayName']
            teamId      = teamId
            playerId    = athData['id']
            # Execute the check query
            check_query = f"""
            SELECT 1 FROM {playerTable} WHERE playerId = %s;
            """
            cursor.execute(check_query, (playerId,))
            result = cursor.fetchone()

            if result is None:
                # Row does not exist, safe to insert
                insert_query = f"""
                INSERT INTO {playerTable} (firstName, lastName, displayName, position, teamId, playerId) 
                VALUES (%s, %s, %s, %s, %s, %s);
                """
                cursor.execute(insert_query, (firstName, lastName, displayName, position, teamId, playerId))
                conn.commit()
                print("Row inserted.")
            else: # Player exists, but info might have changed
                check_query = f"""
                SELECT 1 FROM {playerTable} WHERE firstName = %s AND lastName = %s AND displayName = %s AND position = %s AND teamId = %s AND playerId = %s;
                """
                cursor.execute(check_query, (firstName, lastName, displayName, position, teamId, playerId))
                result = cursor.fetchone()
                if result is None:
                    # SQL query to delete the row
                    delete_query = f"DELETE FROM {playerTable} WHERE playerId = %s;"

                    # Execute the query
                    cursor.execute(delete_query, (playerId))
                    # Row does not exist, safe to insert
                    insert_query = f"""
                    INSERT INTO {playerTable} (firstName, lastName, displayName, position, teamId, playerId) 
                    VALUES (%s, %s, %s, %s, %s, %s);
                    """
                    cursor.execute(insert_query, (firstName, lastName, displayName, position, teamId, playerId))
                    conn.commit()
                    print("Row changed.")
                print("Row already exists.")
            #pprint(athData)
        # Commit the changes
        #conn.commit()





#NFL
def configureNFLTables():
    endpoint = "https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/teams?limit=32"
    response = requests.get(endpoint)
    teams = response.json()
    team_links = []
    for link in teams['items']:
        team_links.append((link['$ref'],None))
    teamArray = fetch_data(team_links)

    for team in teamArray:
        # Example data to insert
        teamName = team['abbreviation']
        fullName = team['displayName']
        teamId = team['id']
        tableName = "nfl_teams"
        playerTable = f"nfl_{teamName}_players"
        create_player_table(cursor,conn,playerTable)
        
        # SQL query to check if the row already exists
        check_query = f"""
        SELECT 1 FROM {tableName} WHERE teamName = %s AND teamId = %s;
        """

        # Execute the check query
        cursor.execute(check_query, (teamName, teamId))
        result = cursor.fetchone()

        if result is None:
            # Row does not exist, safe to insert
            insert_query = f"""
            INSERT INTO {tableName} (teamName, fullName, teamId) 
            VALUES (%s, %s, %s);
            """
            cursor.execute(insert_query, (teamName, fullName, teamId))
            conn.commit()
            print("Row inserted.")
        else:
            print("Row already exists.")

        athletesEndpoint = f"https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/seasons/2023/teams/{teamId}/athletes?lang=en&region=us&limit=500"
        athletesArray = fetch_data([(athletesEndpoint,None)])
        athletesLinks = []
        for athlete_link in athletesArray[0]['items']:
            athletesLinks.append((athlete_link['$ref'],None))
            
        athletesData = fetch_data(athletesLinks)
        for athData in athletesData:
            firstName   = athData['firstName']
            lastName    = athData['lastName']
            displayName = athData['displayName']
            position    = athData['position']['displayName']
            teamId      = teamId
            playerId    = athData['id']
            # Execute the check query
            check_query = f"""
            SELECT 1 FROM {playerTable} WHERE playerId = %s;
            """
            cursor.execute(check_query, (playerId,))
            result = cursor.fetchone()

            if result is None:
                # Row does not exist, safe to insert
                insert_query = f"""
                INSERT INTO {playerTable} (firstName, lastName, displayName, position, teamId, playerId) 
                VALUES (%s, %s, %s, %s, %s, %s);
                """
                cursor.execute(insert_query, (firstName, lastName, displayName, position, teamId, playerId))
                conn.commit()
                print("Row inserted.")
            else: # Player exists, but info might have changed
                check_query = f"""
                SELECT 1 FROM {playerTable} WHERE firstName = %s AND lastName = %s AND displayName = %s AND position = %s AND teamId = %s AND playerId = %s;
                """
                cursor.execute(check_query, (firstName, lastName, displayName, position, teamId, playerId))
                result = cursor.fetchone()
                if result is None:
                    # SQL query to delete the row
                    delete_query = f"DELETE FROM {playerTable} WHERE playerId = %s;"

                    # Execute the query
                    cursor.execute(delete_query, (playerId))
                    # Row does not exist, safe to insert
                    insert_query = f"""
                    INSERT INTO {playerTable} (firstName, lastName, displayName, position, teamId, playerId) 
                    VALUES (%s, %s, %s, %s, %s, %s);
                    """
                    cursor.execute(insert_query, (firstName, lastName, displayName, position, teamId, playerId))
                    conn.commit()
                    print("Row changed.")
                print("Row already exists.")
            #pprint(athData)
        # Commit the changes
        #conn.commit()





configureNBATables()

cursor.close()
conn.close()