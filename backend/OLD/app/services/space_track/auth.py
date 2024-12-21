import logging
import os
import configparser
import requests
from requests import post

# Environment variables for credentials
SPACETRACK_USER = "topher.sikorra@gmail.com"
SPACETRACK_PASS = "spacetrack.orgsK5_water17!"


async def get_session(session):
    """
    Authenticate to Space-Track.org and return the session.
    """
    url = "https://www.space-track.org/ajaxauth/login"
    credentials = {"identity": SPACETRACK_USER, "password": SPACETRACK_PASS}
    logging.info(f"{credentials}")
    response = await session.post(
        url,
        data=credentials,
    )

    if response.status_code == 200:
        print("Successfully authenticated.")
    else:
        print("Authentication failed.")
        response.raise_for_status()
