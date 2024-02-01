
import psycopg2.pool
import os
import json
# Create a connection pool with a min_size of 0 and a max_size of 80
# Use the `DATABASE_URL` environment variable we provide to connect to the Database
# It is included in your Replit environment automatically (no need to set it up)
database_url = os.getenv('DATABASE_URL')
pool = psycopg2.pool.SimpleConnectionPool(0, 80, database_url)
valid_nfl_player_tables = ['nfl_ATL_players', 'nfl_BUF_players', 'nfl_CHI_players', 'nfl_CIN_players', 'nfl_CLE_players', 'nfl_DAL_players', 'nfl_DEN_players', 'nfl_DET_players', 'nfl_GB_players', 'nfl_TEN_players', 'nfl_IND_players', 'nfl_KC_players', 'nfl_LV_players', 'nfl_LAR_players', 'nfl_MIA_players', 'nfl_MIN_players', 'nfl_NE_players', 'nfl_NO_players', 'nfl_NYG_players', 'nfl_NYJ_players', 'nfl_PHI_players', 'nfl_ARI_players', 'nfl_PIT_players', 'nfl_LAC_players', 'nfl_SF_players', 'nfl_SEA_players', 'nfl_TB_players', 'nfl_WSH_players', 'nfl_CAR_players', 'nfl_JAX_players', 'nfl_BAL_players', 'nfl_HOU_players']
valid_nba_player_tables = ['nba_ATL_players', 'nba_BOS_players', 'nba_NO_players', 'nba_CHI_players', 'nba_CLE_players', 'nba_DAL_players', 'nba_DEN_players', 'nba_DET_players', 'nba_GS_players', 'nba_HOU_players', 'nba_IND_players', 'nba_LAC_players', 'nba_LAL_players', 'nba_MIA_players', 'nba_MIL_players', 'nba_MIN_players', 'nba_BKN_players', 'nba_NY_players', 'nba_ORL_players', 'nba_PHI_players', 'nba_PHX_players', 'nba_POR_players', 'nba_SAC_players', 'nba_SA_players', 'nba_OKC_players', 'nba_UTAH_players', 'nba_WSH_players', 'nba_TOR_players', 'nba_MEM_players', 'nba_CHA_players']

def search_display_name(league, search_string, db_params=None):
    """
    Searches for rows in joined tables where the displayName contains the search string.

    :param db_params: A dictionary containing dbname, user, password, and host.
    :param table_names: A list of table names to join.
    :param search_string: The string to search for in the displayName column.
    :return: A list of tuples containing the rows that match the search criteria.
    """
    if league.lower() == 'nfl':
        table_names = valid_nfl_player_tables
    elif league.lower() == 'nba':
        table_names = valid_nba_player_tables
    # Connect to the database
    if db_params is None:
        # Get a connection from the pool
        conn = pool.getconn()
        cursor = conn.cursor()
    else:
        conn = psycopg2.connect(**db_params)
        cursor = conn.cursor()

    # Construct the JOIN part of the SQL query
    # We use aliases t1, t2, ..., tN for the tables
    query = ''
    for index, table_name in enumerate(table_names[:-1]):
        query = query + f'SELECT * FROM {table_name.lower()} WHERE displayName LIKE \'%{search_string}%\' UNION '

    query = query + f'SELECT * FROM {table_names[-1].lower()} WHERE displayName LIKE \'%{search_string}%\''
    # SQL query that joins the tables and searches for the displayName
    #query = f"""SELECT * FROM {table_names[0].lower()} AS t1 {join_clauses} WHERE t1.displayName LIKE %s;"""
    
    # Execute the query with the search string
    cursor.execute(query)
    
    # Fetch the results
    results = cursor.fetchall()
    
     # Example conversion to a list of dictionaries (assuming you know the column names)
    column_names = ["id", "firstName", "lastName", "displayName", "position","teamId","playerId","href"]
    entries_list = [dict(zip(column_names, row)) for row in results]

    # Convert the list of dictionaries to a JSON string
    json_data = json.dumps(entries_list)

    # If you need the JSON in a dictionary format (not as a string), use json.loads
    json_dict = json.loads(json_data)
    response = []
    for playerDict in json_dict:
        tableName = league + '_teams'
        sql_query = f"SELECT * FROM {tableName} WHERE teamid = %s"
        cursor.execute(sql_query, (playerDict['teamId'],))
        # Fetch all rows that match the condition
        row = cursor.fetchone()
        teamAbbreviation = row[1]
        playerDict["teamName"] = teamAbbreviation
        response.append(playerDict)


    # Close the cursor and connection
    cursor.close()
    conn.close()
    return response

def get_team_player_tables(league,db_params=None):
    """
    Connects to a PostgreSQL database, retrieves all team names from a table,
    and modifies each team name by appending 'nfl_' and prepending '_players'.

    :param db_params: A dictionary with database connection parameters.
    :return: A list of modified team names.
    """
    teamTable = league.lower() + '_teams'
    # Connect to the PostgreSQL databases
    if db_params is None:
        # Get a connection from the pool
        conn = pool.getconn()
        cursor = conn.cursor()
    else:
        conn = psycopg2.connect(**db_params)
        cursor = conn.cursor()

    # SQL query to select all team names from the table
    cursor.execute(f"SELECT teamname FROM {teamTable}")

    # Fetch all results as a list of strings (team names)
    teams = cursor.fetchall()

    # Modify each team name
    modified_team_names = [league + '_' + team[0] + '_players' for team in teams]

    # Close the cursor and connection
    cursor.close()
    conn.close()

    return modified_team_names


def get_all_teams(league,db_params=None):
    teamTable = league.lower() + '_teams'
    # Connect to the database
    if db_params is None:
        # Get a connection from the pool
        conn = pool.getconn()
        cursor = conn.cursor()
    else:
        conn = psycopg2.connect(**db_params)
        cursor = conn.cursor()

    # Create a cursor object
    cur = conn.cursor()

    # SQL query to select all rows from the table
    cur.execute(f"SELECT * FROM {teamTable}")

    # Fetch all rows from the cursor
    rows = cur.fetchall()

    # Example conversion to a list of dictionaries (assuming you know the column names)
    column_names = ["id", "teamname", "fullname", "teamid", "href"]
    entries_list = [dict(zip(column_names, row)) for row in rows]

    # Convert the list of dictionaries to a JSON string
    json_data = json.dumps(entries_list)

    # If you need the JSON in a dictionary format (not as a string), use json.loads
    json_dict = json.loads(json_data)


    # Close the cursor and connection
    cur.close()
    conn.close()

    return json_dict