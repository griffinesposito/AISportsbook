# Import the libraries we need
from flask import Flask, request, send_from_directory, jsonify, render_template
from oddsApi import get_in_season_sports, get_sports_odds, get_event_odds, get_sport_scores
from espnApi import get_team_data, get_team_record, get_team_injuries, get_team_events, get_current_events
from pythonUtils import get_time_range_str
from flask_socketio import SocketIO
import threading
import time
import random
from databaseOperations import search_display_name, get_team_player_tables

# Global Data structures
current_nfl_events = {}  # Global data structure
current_nba_events = {}  # Global data structure
current_mlb_events = {}  # Global data structure
data_lock = threading.Lock()  # Lock for thread-safe operations
# Initialize the Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)


def fetch_and_emit():
  """ Fetch and process live data, then emit using SocketIO """
  while True:
    # Simulate data fetching and processing
    data = random.randint(1,
                          100)  # Replace this with actual data fetching logic
    print(f"Emitting data: {data}")
    socketio.emit('live_data', {'data': data})
    time.sleep(1)  # Fetch data every second


def fetch_nfl_events():
  """ Fetch and process live data, then emit using SocketIO """
  while True:
    # Simulate data fetching and processing
    with data_lock:
      dates = get_time_range_str()
      sport = 'football'
      league = 'nfl'
      current_nfl_events["data"] = get_current_events(sport, league, dates)
    time.sleep(60 * 5)  # Fetch data every 5 minutes


def fetch_nba_events():
  """ Fetch and process live data, then emit using SocketIO """
  while True:
    # Simulate data fetching and processing
    with data_lock:
      dates = get_time_range_str()
      sport = 'basketball'
      league = 'nba'
      current_nba_events["data"] = get_current_events(sport, league, dates)
    time.sleep(60 * 5)  # Fetch data every 5 minutes


def fetch_mlb_events():
  """ Fetch and process live data, then emit using SocketIO """
  while True:
    # Simulate data fetching and processing
    with data_lock:
      dates = get_time_range_str()
      sport = 'baseball'
      league = 'mlb'
      current_mlb_events["data"] = get_current_events(sport, league, dates)
    time.sleep(60 * 5)  # Fetch data every 5 minutes


@app.route('/')
def index():
  return render_template('themedIndex.html')


@app.route('/sports', methods=['GET'])
def in_season_sports():
  result = get_in_season_sports()
  return jsonify(result)


@app.route('/sports/odds', methods=['GET'])
def odds_endpoint():
  regions = request.args.get('regions')
  sport = request.args.get('sport')
  # Fetch other parameters similarly
  # ...
  markets = request.args.get('markets')
  dateFormat = request.args.get('dateFormat')
  oddsFormat = request.args.get('oddsFormat')
  eventIds = request.args.get('eventIds')
  bookmakers = request.args.get('bookmakers')
  commenceTimeFrom = request.args.get('commenceTimeFrom')
  commenceTimeTo = request.args.get('commenceTimeTo')

  result = get_sports_odds(sport, regions, markets, dateFormat, oddsFormat,
                           eventIds, bookmakers, commenceTimeFrom,
                           commenceTimeTo)
  return jsonify(result)


@app.route('/sports/events', methods=['GET'])
def events_endpoint():
  regions = request.args.get('regions')
  sport = request.args.get('sport')
  eventId = request.args.get('eventId')
  # Fetch other parameters similarly
  # ...
  markets = request.args.get('markets')
  playerPropsFootball = request.args.get('playerPropsFootball')
  playerPropsBasketball = request.args.get('playerPropsBasketball')
  playerPropsBaseball = request.args.get('playerPropsBaseball')
  gamePeriodMarkets = request.args.get('gamePeriodMarkets')
  dateFormat = request.args.get('dateFormat')
  oddsFormat = request.args.get('oddsFormat')
  bookmakers = request.args.get('bookmakers')

  result = get_event_odds(sport, regions, eventId, markets,
                          playerPropsFootball, playerPropsBasketball,
                          playerPropsBaseball, gamePeriodMarkets, dateFormat,
                          oddsFormat, bookmakers)
  return jsonify(result)


@app.route('/sports/scores', methods=['GET'])
def scores_endpoint():
  sport = request.args.get('sport')
  daysFrom = request.args.get('daysFrom')
  dateFormat = request.args.get('dateFormat')
  eventIds = request.args.get('eventIds')

  result = get_sport_scores(sport, daysFrom, dateFormat, eventIds)
  return jsonify(result)


@app.route('/sports/teamdata', methods=['GET'])
def team_data():
  sport = request.args.get('sport')
  league = request.args.get('league')
  year = request.args.get('year')
  team = request.args.get('team')

  result = get_team_data(sport, league, year, team)
  return jsonify(result)


@app.route('/sports/teamrecord', methods=['GET'])
def team_record():
  sport = request.args.get('sport')
  league = request.args.get('league')
  year = request.args.get('year')
  team = request.args.get('team')

  result = get_team_record(sport, league, year, team)
  return jsonify(result)


@app.route('/sports/teaminjuries', methods=['GET'])
def team_injuries():
  sport = request.args.get('sport')
  league = request.args.get('league')
  year = request.args.get('year')
  team = request.args.get('team')

  result = get_team_injuries(sport, league, year, team)
  return jsonify(result)


@app.route('/sports/teamevents', methods=['GET'])
def team_events():
  sport = request.args.get('sport')
  league = request.args.get('league')
  year = request.args.get('year')
  team = request.args.get('team')

  result = get_team_events(sport, league, year, team)
  return jsonify(result)


@app.route('/sports/leagueevents', methods=['GET'])
def league_events():
  #sport   = request.args.get('sport')
  league = request.args.get('league')
  #dates    = request.args.get('dates')
  if league.lower() == 'nfl':
    result = current_nfl_events["data"]
  elif league.lower() == 'nba':
    result = current_nba_events["data"]
  elif league.lower() == 'mlb':
    result = current_mlb_events["data"]
  #result = get_current_events(sport, league, dates)
  return jsonify(result)


@app.route('/search')
def search():
    query = request.args.get('query')
    player_tables = get_team_player_tables('nfl')
    list = search_display_name(player_tables,query)
    print(f"Search results: {list}")
    # Connect to your PostgreSQL database and search
    # Return a list of matching results
    # For example:
    results = [{"displayName": "Example Match"}]
    return jsonify(results)

#################### CHATGPT FUNCTIONS ######################
# ChatGPT will use this route to find our manifest file, ai-plugin.json; it will look in the "".well-known" folder
@app.route('/.well-known/ai-plugin.json')
def serve_ai_plugin():
  return send_from_directory('.',
                             'ai-plugin.json',
                             mimetype='application/json')


# ChatGPT will use this route to find our API specification, openapi.yaml
@app.route('/openapi.yaml')
def serve_openapi_yaml():
  return send_from_directory('.', 'openapi.yaml', mimetype='text/yaml')


# OPTIONAL: If you want a logo to display on your plugin in the Plugin Store, then upload a file named logo.png to the root of your project, and uncomment the code below.
@app.route('/logo.png')
def plugin_logo():
  return send_from_directory('.', 'logo.png')


# Run the app
if __name__ == "__main__":
  # Start the background thread for data fetching
  #data_thread = threading.Thread(target=fetch_and_emit, daemon=True)
  #data_thread.start()
  nfl_events_thread = threading.Thread(target=fetch_nfl_events, daemon=True)
  nfl_events_thread.start()
  nba_events_thread = threading.Thread(target=fetch_nba_events, daemon=True)
  nba_events_thread.start()
  mlb_events_thread = threading.Thread(target=fetch_mlb_events, daemon=True)
  mlb_events_thread.start()
  app.run(host='0.0.0.0', port=80)
