import threading
import time
import random
from espnApi import get_current_events
from pythonUtils import get_time_range_str

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