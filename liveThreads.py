import threading
import time
import random
from espnApi import get_current_events
from pythonUtils import get_time_range_str
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
    time.sleep(60 * 5)  # Fetch data every 5 minutes


def fetch_nba_events():
  """ Fetch and process live data """
  while True:
    # Simulate data fetching and processing
    with data_lock:
      dates = get_time_range_str(3)
      sport = 'basketball'
      league = 'nba'
      current_nba_events["data"] = get_current_events(sport, league, dates)
    time.sleep(60 * 5)  # Fetch data every 5 minutes


def fetch_mlb_events():
  """ Fetch and process live data """
  while True:
    # Simulate data fetching and processing
    with data_lock:
      dates = get_time_range_str(3)
      sport = 'baseball'
      league = 'mlb'
      current_mlb_events["data"] = get_current_events(sport, league, dates)
    time.sleep(60 * 5)  # Fetch data every 5 minutes


def get_live_games():
    liveGames = []
    dates = get_time_range_str(0)
    nfl_games_today = get_current_events('football', 'nfl', dates)
    nba_games_today = get_current_events('basketball', 'nba', dates)
    mlb_games_today = get_current_events('baseball', 'mlb', dates)
    for key, event in nfl_games_today["events"]: 
        if event["status"]["id"] == '2':
            event["id"] = key
            liveGames.append(event)
    for key,event in nba_games_today["events"]: 
        if event["status"]["id"] == '2':
            event["id"] = key
            liveGames.append(event)
    for key,event in mlb_games_today["events"]: 
        if event["status"]["id"] == '2':
            event["id"] = key
            liveGames.append(event)
    return liveGames

def check_for_new_live_games(socketio):
    while True:
        live_games = get_live_games()  # Your function to get live games
        for game in live_games:
            game_id = game["id"]
            if game_id not in game_threads:
                stop_thread_event = threading.Event()
                thread = threading.Thread(target=handle_live_game, args=(game, stop_thread_event, socketio))
                thread.start()
                game_threads[game_id] = stop_thread_event
        time.sleep(60)  # Check every 1 minutes




def handle_live_game(game, stop_thread_event,socketio):
    game_id = game["id"]
    update_links = dict()
    for key,value in game:
        if isinstance(value,dict):
            if '$ref' in value:
               update_links[key] = [(key,value['$ref'])]

    while not stop_thread_event.is_set():
        update_data = fetch_data(update_links)
        data = dict()
        for dat in update_data:
            key_id   = dat['key-request']
            data[key_id] = dat

        if data["status"]["id"] != 2:  # Check if the game is still live
            stop_thread_event.set()

        socketio.emit('live_game_data', {'game_id': game_id, 'data': data})
        time.sleep(5)  # Update every 5 seconds

    # Once the game is over and the thread is stopping
    del game_threads[game_id]