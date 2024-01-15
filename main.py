# Import the libraries we need
from flask import Flask, request, send_from_directory, jsonify
from oddsApi import get_in_season_sports, get_sports_odds, get_event_odds, get_sport_scores
from espnApi import get_team_data, get_team_record, get_team_injuries, get_team_events

# Initialize the Flask app
app = Flask(__name__)


# When a user loads the home page, display 'Hello World!'
# This is not required for the plugin, but makes it easier to see that things are working when we deploy and test
@app.route("/")
def index():
  return "Welcome to AI Sportsbook API"


@app.route('/sports', methods=['GET'])
def in_season_sports():
  result = get_in_season_sports()
  return jsonify(result)


@app.route('/sports/odds', methods=['GET'])
def odds_endpoint():
  regions = request.args.get('regions')
  sport   = request.args.get('sport')
  # Fetch other parameters similarly
  # ...
  markets = request.args.get('markets')
  dateFormat = request.args.get('dateFormat')
  oddsFormat = request.args.get('oddsFormat')
  eventIds = request.args.get('eventIds')
  bookmakers = request.args.get('bookmakers')
  commenceTimeFrom = request.args.get('commenceTimeFrom')
  commenceTimeTo = request.args.get('commenceTimeTo')

  result = get_sports_odds(sport, regions, markets, dateFormat,
                           oddsFormat, eventIds, bookmakers, commenceTimeFrom,
                           commenceTimeTo)
  return jsonify(result)


@app.route('/sports/events', methods=['GET'])
def events_endpoint():
  regions = request.args.get('regions')
  sport   = request.args.get('sport')
  eventId = request.args.get('eventId')
  # Fetch other parameters similarly
  # ...
  markets               = request.args.get('markets')
  playerPropsFootball   = request.args.get('playerPropsFootball')
  playerPropsBasketball = request.args.get('playerPropsBasketball')
  playerPropsBaseball   = request.args.get('playerPropsBaseball')
  gamePeriodMarkets     = request.args.get('gamePeriodMarkets')
  dateFormat            = request.args.get('dateFormat')
  oddsFormat            = request.args.get('oddsFormat')
  bookmakers            = request.args.get('bookmakers')

  result = get_event_odds(sport, regions, eventId, markets,
                            playerPropsFootball, playerPropsBasketball, playerPropsBaseball, 
                            gamePeriodMarkets,
                            dateFormat, oddsFormat, bookmakers)
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
  sport   = request.args.get('sport')
  league  = request.args.get('league')
  year    = request.args.get('year')
  team    = request.args.get('team')

  result = get_team_data(sport, league, year, team)
  return jsonify(result)

@app.route('/sports/teamrecord', methods=['GET'])
def team_data():
  sport   = request.args.get('sport')
  league  = request.args.get('league')
  year    = request.args.get('year')
  team    = request.args.get('team')

  result = get_team_record(sport, league, year, team)
  return jsonify(result)

@app.route('/sports/teaminjuries', methods=['GET'])
def team_data():
  sport   = request.args.get('sport')
  league  = request.args.get('league')
  year    = request.args.get('year')
  team    = request.args.get('team')

  result = get_team_injuries(sport, league, year, team)
  return jsonify(result)

@app.route('/sports/teamevents', methods=['GET'])
def team_data():
  sport   = request.args.get('sport')
  league  = request.args.get('league')
  year    = request.args.get('year')
  team    = request.args.get('team')

  result = get_team_events(sport, league, year, team)
  return jsonify(result)


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
  app.run(host='0.0.0.0', port=80)
