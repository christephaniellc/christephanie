import asyncio
import json
import logging
import math
import os
import time
from datetime import datetime, timedelta
from logging import info
from typing import List, Tuple

import boto3
import httpx
import matplotlib.pyplot as plt
import requests
from fastapi import HTTPException
from requests import get, post
from skyfield.api import load
from skyfield.sgp4lib import EarthSatellite

from app.api.v1.models.tle import TLEData
from app.constants import norad_ids
from app.services import tle as tle_service
from app.services.local_file import file_modified_within, read_from_file, save_to_file
from app.services.space_track import auth as space_track_auth


def handle_non_compliant_floats(obj):
    if isinstance(obj, float):
        if math.isnan(obj):
            return None  # or a suitable replacement like 0
        if math.isinf(obj):
            return None  # or a suitable maximum/minimum value
    return obj


def parse_tle_epoch_t0(tle_line1):
    year = int(tle_line1[18:20])
    year += 2000 if year < 57 else 1900  # Adjust for century
    day_of_year = float(tle_line1[20:32])
    epoch = datetime(year, 1, 1) + timedelta(days=day_of_year - 1)
    t0 = load.timescale().utc(
        epoch.year, epoch.month, epoch.day, epoch.hour, epoch.minute, epoch.second
    )

    return t0, epoch


def format_time_delta(t0, t):
    delta = t.utc_datetime() - t0.utc_datetime()
    days = delta.days
    hours, remainder = divmod(delta.seconds, 3600)
    minutes, _ = divmod(remainder, 60)
    return f"{days}d {hours}hr {minutes}min"


def get_positions_from_tles(tle_data, days=7):
    ts = load.timescale()
    start_time = ts.now()

    satellite_positions = {}
    for name, line1, line2 in tle_data:
        satellite = EarthSatellite(line1, line2, name)
        t0, _ = parse_tle_epoch_t0(line1)
        end_time = ts.utc(t0.utc_datetime() + timedelta(days=days))
        positions = []
        t = t0
        while t.tt < end_time.tt:
            position = satellite.at(t).position.km
            time_delta = format_time_delta(t0, t)
            positions.append(
                {
                    "time": t.utc_iso(),
                    "position": [position[0], position[1], position[2]],
                    "delta_from_tle_t0": time_delta,
                }
            )
            t += timedelta(hours=1)
        satellite_positions[satellite.name] = positions

    return satellite_positions


def plot_positions(tles: dict[str, list[dict]]):
    fig = plt.figure()
    ax = fig.add_subplot(111, projection="3d")
    for key, value in tles.items():
        for pos in value:
            x, y, z = pos["position"]
            ax.scatter(x, y, z)

            ax.set_xlabel("X")
            ax.set_ylabel("Y")
            ax.set_zlabel("Z")
    return plt.show()


def convert_tles_to_sat_positions(tles: list[tuple]):
    sat_positions = []

    for item in tles:
        if isinstance(item, tuple) and len(item) == 3:
            name, line1, line2 = item
            t0, epoch = parse_tle_epoch_t0(line1)
            satellite = EarthSatellite(line1, line2, name.split("0 ").pop())
            position = satellite.at(t0)
            x, y, z = position.position.km
            vx, vy, vz = position.velocity.km_per_s

            sat_positions.append(
                {
                    "name": item[0],
                    "position": (x, y, z),
                    "velocity": (vx, vy, vz),
                    "at_time": t0.utc_strftime(),
                }
            )

    # Your data to be saved
    data_to_save = {"tles": sat_positions}

    # The file path
    file_path = "~/code/tlepath-client/public/satellite_data.json"
    try:
        # Using a context manager to ensure the file is properly closed
        with open(file_path, "w") as file:
            json.dump(data_to_save, file)
        print(f"File saved successfully at {os.path.abspath(file_path)}")
    except IOError as e:
        print(f"An error occurred while writing the file: {e}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

    return {"sat_positions": sat_positions}

SPACETRACK_API_URL = "https://www.space-track.org/basicspacedata/query/class/tle_latest/epoch/2022-01-01--2022-12-31/ORDINAL/1/format/3le"
async def get_spacetrack_tles() -> List[Tuple[str, str, str]]:
    async with httpx.AsyncClient() as client:
        response = await client.get(SPACETRACK_API_URL)
        if response.status_code == 200:
            tle_data = response.text.strip().split("\n")
            tles = [(tle_data[i], tle_data[i + 1], tle_data[i + 2]) for i in range(0, len(tle_data), 3)]
            return tles
        else:
            raise HTTPException(status_code=response.status_code, detail="Failed to fetch TLE data from SpaceTrack")


def save_to_file(data, file_path):
    with open(file_path, "w") as file:
        json.dump(data, file)


def read_from_file(file_path):
    with open(file_path, "r") as file:
        return json.load(file)


async def download_with_rate_limit(
        url, rate_limit_kbps=100, chunk_size=1024, temp_file_path="download.tmp"
):
    async with httpx.AsyncClient() as client:
        start_time = time.time()
        response = await client.get(url)

        downloaded = 0
        # Open a temporary file in binary write mode
        with open(temp_file_path, "wb") as temp_file:
            async for chunk in response.aiter_bytes(chunk_size):
                now = time.time()
                downloaded += len(chunk)

                # Write the chunk to the temporary file
                temp_file.write(chunk)

                # Calculate the desired download rate in bytes per second
                desired_rate_bps = rate_limit_kbps * 1024
                # Calculate how long it should take to download the current amount of data at the desired rate
                expected_time = downloaded / desired_rate_bps
                # Calculate how much time we need to sleep to maintain the rate limit
                sleep_time = start_time + expected_time - now

                if sleep_time > 0:
                    await asyncio.sleep(sleep_time)

        # At this point, all chunks have been written to the temp file

    # # Now you can upload the file to S3
    # s3_client = boto3.client("s3")
    # s3_bucket = "dev.data.orbitalanalytics.org"
    # s3_key = "2022_tles"
    #
    # s3_client.upload_file(temp_file_path, s3_bucket, s3_key)
    # save the file to the local file system
    save_to_file(temp_file_path, "2022_tles.txt")
    return response
    # Optionally delete the temporary file after upload
    # os.remove(temp_file_path)


def extract_sat_number_from_tle(tle: tuple[str, str]) -> str:
    return tle[0][2:7]
