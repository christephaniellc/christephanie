import json
import os
from datetime import datetime, timedelta


def cache_file_dir():
    # If __file__ is not defined in your environment (e.g., in a REPL or notebook),
    # you may need to set the current directory manually.
    # current_dir = os.getcwd()  # Uncomment if __file__ is not defined
    current_dir = os.path.dirname(__file__)
    parent_dir = os.path.dirname(current_dir)
    cache_dir = os.path.join(parent_dir, "cache")
    # Create the cache directory if it does not exist
    os.makedirs(cache_dir, exist_ok=True)
    return cache_dir


def save_to_file(data: str, filename):
    filepath = os.path.join(cache_file_dir(), filename)
    with open(filepath, "w") as file:
        file.write(data)


def read_from_file(filename):
    filepath = os.path.join(cache_file_dir(), filename)
    if not os.path.exists(filepath):
        return None  # Return None if the file does not exist
    with open(filepath, "r") as file:
        return file.read()


def file_modified_within(filename, hours=24):
    filepath = os.path.join(cache_file_dir(), filename)
    if not os.path.exists(filepath):
        return False  # The file doesn't exist, so it's not within the time frame
    last_modified = datetime.fromtimestamp(os.path.getmtime(filepath))
    return (datetime.now() - last_modified) < timedelta(hours=hours)
