import psycopg2.pool
import os
from databaseOperations import create_player_table, create_team_table
import requests, json, pprint
from asyncRequests import fetch_data
from pprint import pprint
# Database connection parameters
dbname = "neondb"
user = "neon"
password = "3BwHa8VGfovZ"
host = "ep-solitary-meadow-09767890.us-east-2.aws.neon.tech"




# Prefix and suffix of the table names you want to drop
prefix = "nfl_"
suffix = "_players"

try:
    # Connect to the database
    conn = psycopg2.connect(dbname=dbname, user=user, password=password, host=host)
    cursor = conn.cursor()

    # Query to find tables that match the naming pattern
    query = """
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public' AND
          tablename LIKE %s;
    """
    pattern = f"{prefix}%%{suffix}"  # Adapt this pattern to your needs

    cursor.execute(query, (pattern,))
    tables = cursor.fetchall()

    # Generate and execute DROP TABLE commands for each table
    for table in tables:
        drop_query = f"DROP TABLE IF EXISTS {table[0]};"
        cursor.execute(drop_query)

    conn.commit()
    print("Tables dropped successfully.")

except Exception as e:
    print(f"An error occurred: {e}")
finally:
    # Close the connection
    if conn is not None:
        conn.close()