def parse_tle(tle_line1, tle_line2):
    """
    Parses the TLE lines and extracts the orbital parameters.

    Parameters:
    tle_line1 (str): The first line of the TLE.
    tle_line2 (str): The second line of the TLE.

    Returns:
    dict: A dictionary containing the extracted parameters.
    """
    tle_data = {
        "satellite_number": tle_line1[2:7],
        "classification": tle_line1[7],
        "international_designator_year": tle_line1[9:11],
        "international_designator_launch_number": tle_line1[11:14],
        "international_designator_piece": tle_line1[14:17],
        "epoch_year": tle_line1[18:20],
        "epoch_day": tle_line1[20:32],
        "first_derivative_mean_motion": tle_line1[33:43],
        "second_derivative_mean_motion": tle_line1[44:52],
        "bstar_drag_term": tle_line1[53:61],
        "ephemeris_type": tle_line1[62],
        "element_set_number": tle_line1[64:68],
        "inclination": tle_line2[8:16],
        "ra_of_asc_node": tle_line2[17:25],
        "eccentricity": "0." + tle_line2[26:33],
        "argument_of_perigee": tle_line2[34:42],
        "mean_anomaly": tle_line2[43:51],
        "mean_motion": tle_line2[52:63],
        "revolution_number_at_epoch": tle_line2[63:68],
    }

    return tle_data
