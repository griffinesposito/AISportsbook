import json
from datetime import datetime, timedelta

def convert_list_to_json(listTable):
    # Extract the header and the rows
    header, *rows = listTable

    # Convert the rows to a list of dictionaries using the header for the keys
    table_dicts = [dict(zip(header, row)) for row in rows]

    # Convert the list of dictionaries to a JSON string
    json_output = json.dumps(table_dicts, indent=4)

    # Printing the JSON object
    return json_output


def get_time_range_str(daysRange):
    # Get the current datetime
    current_time = datetime.now()

    # Calculate one week ago and one week in the future
    one_week_ago = current_time - timedelta(days=daysRange)
    one_week_future = current_time + timedelta(days=daysRange)

    # Format dates as 'YYYYMMDD'
    formatted_one_week_ago = one_week_ago.strftime('%Y%m%d')
    formatted_one_week_future = one_week_future.strftime('%Y%m%d')

    # Concatenate the dates
    date_range = f"{formatted_one_week_ago}-{formatted_one_week_future}"
    return date_range