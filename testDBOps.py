from databaseOperations import search_display_name, get_team_player_tables, get_all_teams
import pprint
# Database connection parameters
db_params = {
    'dbname': "neondb",
    'user': "neon",
    'password': "3BwHa8VGfovZ",
    'host': "ep-solitary-meadow-09767890.us-east-2.aws.neon.tech"
}

league = 'nfl'
#team_names = get_team_player_tables(league, db_params)
#print(team_names)
# List of table names to join. Replace with actual table names.
#table_names = team_names

# The search string
search_string = 'Tyreek'

# Call the function
#table_names = ['nfl_ATL_players', 'nfl_BUF_players', 'nfl_CHI_players', 'nfl_CIN_players', 'nfl_CLE_players', 'nfl_DAL_players', 'nfl_DEN_players', 'nfl_DET_players', 'nfl_GB_players', 'nfl_TEN_players', 'nfl_IND_players', 'nfl_KC_players', 'nfl_LV_players', 'nfl_LAR_players', 'nfl_MIA_players', 'nfl_MIN_players', 'nfl_NE_players', 'nfl_NO_players', 'nfl_NYG_players', 'nfl_NYJ_players', 'nfl_PHI_players', 'nfl_ARI_players', 'nfl_PIT_players', 'nfl_LAC_players', 'nfl_SF_players', 'nfl_SEA_players', 'nfl_TB_players', 'nfl_WSH_players', 'nfl_CAR_players', 'nfl_JAX_players', 'nfl_BAL_players', 'nfl_HOU_players']
matching_rows = search_display_name(league, search_string, db_params)
# Print the results
for row in matching_rows:
    print(row)


#all_teams = get_all_teams(league, db_params)
#pprint.pprint(all_teams)





