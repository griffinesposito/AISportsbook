import json

def convert_list_to_json(listTable):
    # Extract the header and the rows
    header, *rows = listTable

    # Convert the rows to a list of dictionaries using the header for the keys
    table_dicts = [dict(zip(header, row)) for row in rows]

    # Convert the list of dictionaries to a JSON string
    json_output = json.dumps(table_dicts, indent=4)

    # Printing the JSON object
    return json_output