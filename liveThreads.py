import threading
import time
import random
from espnApi import get_current_events, get_detailed_event_data
from pythonUtils import get_time_range_str, get_current_date_str
from asyncRequests import fetch_data

# Dictionary to keep track of game threads and their stop events
game_threads = {}

# Global Data structures
current_nfl_events = {}  # Global data structure
current_nba_events = {}  # Global data structure
current_mlb_events = {}  # Global data structure
data_lock = threading.Lock()  # Lock for thread-safe operations


def fetch_and_emit(socketio):
  """ Fetch and process live data, then emit using SocketIO """
  while True:
    # Simulate data fetching and processing
    data = random.randint(1,
                          100)  # Replace this with actual data fetching logic
    print(f"Emitting data: {data}")
    socketio.emit('live_data', {'data': data})
    time.sleep(1)  # Fetch data every second


def fetch_nfl_events():
  """ Fetch and process live data """
  while True:
    # Simulate data fetching and processing
    with data_lock:
      dates = get_time_range_str(7)
      sport = 'football'
      league = 'nfl'
      current_nfl_events["data"] = get_current_events(sport, league, dates)
      data = current_nfl_events["data"]
      print(f"Emitting NFL data:")
    time.sleep(300)  # Fetch data every 5 minutes


def fetch_nba_events():
  """ Fetch and process live data """
  while True:
    # Simulate data fetching and processing
    with data_lock:
      dates = get_time_range_str(3)
      sport = 'basketball'
      league = 'nba'
      current_nba_events["data"] = get_current_events(sport, league, dates)
      data = current_nba_events["data"]
      print(f"Emitting NBA data:")
    time.sleep(300)  # Fetch data every 5 minutes


def fetch_mlb_events():
  """ Fetch and process live data """
  while True:
    # Simulate data fetching and processing
    with data_lock:
      dates = get_time_range_str(3)
      sport = 'baseball'
      league = 'mlb'
      current_mlb_events["data"] = get_current_events(sport, league, dates)
    time.sleep(300)  # Fetch data every 5 minutes


def get_live_games():
  liveGames = []
  dates = get_current_date_str()
  nfl_games_today = get_current_events('football', 'nfl', dates)
  nba_games_today = get_current_events('basketball', 'nba', dates)
  mlb_games_today = get_current_events('baseball', 'mlb', dates)
  print('Checking live games for:' + dates)
  print('len(nba_games_today): ' + str(len(nba_games_today)))
  for key, event in nfl_games_today["events"].items():
    if event["status"]["type"]["id"] != '1' and event["status"]["type"]["id"] != '3':
      event["id"] = key
      event["sport"] = 'football'
      event["league"] = 'nfl'
      liveGames.append(event)
  for key, event in nba_games_today["events"].items():
    print(event["name"])
    if event["status"]["type"]["id"] != '1' and event["status"]["type"]["id"] != '3':
      event["id"] = key
      event["sport"] = 'basketball'
      event["league"] = 'nba'
      liveGames.append(event)
  for key, event in mlb_games_today["events"].items():
    if event["status"]["type"]["id"] != '1' and event["status"]["type"]["id"] != '3':
      event["id"] = key
      event["sport"] = 'baseball'
      event["league"] = 'mlb'
      liveGames.append(event)
  return liveGames


def check_for_new_live_games(socketio):
  while True:
    with data_lock:
      print('Checking for new live games...')
      live_games = get_live_games()  # Your function to get live games
      for game in live_games:
        game_id = game["id"]
        if game_id not in game_threads:
          stop_thread_event = threading.Event()
          thread = threading.Thread(target=handle_live_game,
                                    args=(game, stop_thread_event, socketio))
          thread.start()
          game_threads[game_id] = stop_thread_event
    time.sleep(60)  # Check every 1 minutes


def handle_live_game(game, stop_thread_event, socketio):
  game_id = game["id"]
  update_links = dict()
  for key, value in game.items():
    if isinstance(value, dict):
      if '$ref' in value:
        update_links[key] = [(key, value['$ref'])]

  data = None
  while not stop_thread_event.is_set():
    with data_lock:
      if data is None:
        data = get_detailed_event_data(game["sport"], game["league"], game_id)
      else:
        data = get_detailed_event_data(game["sport"], game["league"], game_id, data["event"]["details"]["newLink"])

      if data["event"]["status"]["type"]["id"] == '1' or data["event"]["status"]["type"]["id"] == '3':  # Check if the game is still live
        stop_thread_event.set()

      socketio.emit('live_game_data', {'game_id': game_id, 'data': data["event"]})
    time.sleep(5)  # Update every 5 seconds

  # Once the game is over and the thread is stopping
  del game_threads[game_id]
