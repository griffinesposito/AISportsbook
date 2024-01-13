# Import the libraries we need
import requests
from flask import Flask, request, send_from_directory, jsonify

# Replace "YOUR_API_KEY_HERE" with your actual API key
# Even better, use best practices and store it as a secret (not hard-coded!)
API_KEY_ODDS = "d49677105cab61622d60e57635c1b4dd"
BASE_URL = "https://api.the-odds-api.com/v4/"

# Initialize the Flask app
app = Flask(__name__)


# When a user loads the home page, display 'Hello World!'
# This is not required for the plugin, but makes it easier to see that things are working when we deploy and test
@app.route("/")
def index():
  return "Welcome to AI Sportsbook API"


#
@app.route('/sports', methods=['GET'])
def get_in_season_sports():
  params = {"apiKey": API_KEY_ODDS}

  response = requests.get(BASE_URL + "sports", params=params)
  return response.json()


def get_sports_odds(api_key,
                    sport,
                    regions,
                    markets=None,
                    dateFormat=None,
                    oddsFormat=None,
                    eventIds=None,
                    bookmakers=None,
                    commenceTimeFrom=None,
                    commenceTimeTo=None):
  base_url = "https://api.the-odds-api.com/v4/sports"  # Replace with the actual base URL
  endpoint = f"{base_url}/{sport}/odds/"

  params = {'apiKey': api_key, 'regions': regions}
  # Add other parameters if they exist
  # ...
  if markets is not None:
    params['markets'] = markets
  if dateFormat is not None:
    params['dateFormat'] = dateFormat
  if oddsFormat is not None:
    params['oddsFormat'] = oddsFormat
  else:
    params['oddsFormat'] = 'american'
  if eventIds is not None:
    params['eventIds'] = eventIds
  if bookmakers is not None:
    params['bookmakers'] = bookmakers
  if commenceTimeFrom is not None:
    params['commenceTimeFrom'] = commenceTimeFrom
  if commenceTimeTo is not None:
    params['commenceTimeTo'] = commenceTimeTo

  response = requests.get(endpoint, params=params)
  if response.status_code == 200:
    return response.json()
  else:
    return response.status_code, response.reason


@app.route('/sports/odds', methods=['GET'])
def odds_endpoint():
  api_key = API_KEY_ODDS
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

  result = get_sports_odds(api_key, sport, regions, markets, dateFormat,
                           oddsFormat, eventIds, bookmakers, commenceTimeFrom,
                           commenceTimeTo)
  return jsonify(result)


def get_sport_scores(api_key, sport, daysFrom=None, dateFormat=None, eventIds=None):
  base_url = "https://api.example.com/v4/sports"  # Replace with actual base URL
  endpoint = f"{base_url}/{sport}/scores/"
  
  params = {
      'apiKey': api_key,
      'daysFrom': daysFrom if daysFrom is not None else '',
      'dateFormat': dateFormat if dateFormat is not None else '',
      'eventIds': eventIds if eventIds is not None else ''
  }

  response = requests.get(endpoint, params=params)
  
  if response.status_code == 200:
    return response.json()
  else:
    return response.status_code, response.reason

@app.route('/sports/scores', methods=['GET'])
def scores_endpoint():
  api_key = API_KEY_ODDS
  sport = request.args.get('sport')
  daysFrom = request.args.get('daysFrom')
  dateFormat = request.args.get('dateFormat')
  eventIds = request.args.get('eventIds')

  result = get_sport_scores(api_key, sport, daysFrom, dateFormat, eventIds)
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
