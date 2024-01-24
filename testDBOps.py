from databaseOperations import search_display_name, get_team_player_tables

# Database connection parameters
db_params = {
    'dbname': "neondb",
    'user': "neon",
    'password': "3BwHa8VGfovZ",
    'host': "ep-solitary-meadow-09767890.us-east-2.aws.neon.tech"
}

league = 'nfl'
team_names = get_team_player_tables(league, db_params)
print(team_names)
# List of table names to join. Replace with actual table names.
table_names = team_names

# The search string
search_string = 'Tyreek'

# Call the function
matching_rows = search_display_name(table_names, search_string, db_params)
# Print the results
for row in matching_rows:
    print(row)






