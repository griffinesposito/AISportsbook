
import psycopg2.pool
import os

# Create a connection pool with a min_size of 0 and a max_size of 80
# Use the `DATABASE_URL` environment variable we provide to connect to the Database
# It is included in your Replit environment automatically (no need to set it up)
database_url = os.getenv('DATABASE_URL')
pool = psycopg2.pool.SimpleConnectionPool(0, 80, database_url)


def search_display_name(table_names, search_string, db_params=None):
    """
    Searches for rows in joined tables where the displayName contains the search string.

    :param db_params: A dictionary containing dbname, user, password, and host.
    :param table_names: A list of table names to join.
    :param search_string: The string to search for in the displayName column.
    :return: A list of tuples containing the rows that match the search criteria.
    """
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
    
    # Close the cursor and connection
    cursor.close()
    conn.close()
    
    return results

def get_team_player_tables(league,db_params=None):
    """
    Connects to a PostgreSQL database, retrieves all team names from a table,
    and modifies each team name by appending 'nfl_' and prepending '_players'.

    :param db_params: A dictionary with database connection parameters.
    :return: A list of modified team names.
    """
    teamTable = league + '_teams'
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

