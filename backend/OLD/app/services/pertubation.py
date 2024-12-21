def perturbation_gravitational(tle_data, time):
    """
    Calculates gravitational perturbations (both from Earth and celestial bodies).

    Parameters:
    tle_data (dict): The TLE data.
    time (float): Time at which to calculate the perturbation.

    Returns:
    dict: Adjustments to the orbital elements due to gravitational perturbations.
    """
    # Implement gravitational perturbation calculations.
    pass


def perturbation_solar_radiation(tle_data, time):
    """
    Calculates perturbations due to solar radiation pressure.

    Parameters:
    tle_data (dict): The TLE data.
    time (float): Time at which to calculate the perturbation.

    Returns:
    dict: Adjustments to the orbital elements due to solar radiation.
    """
    # Implement solar radiation pressure calculations.
    pass


def perturbation_atmospheric_drag(tle_data, time):
    """
    Calculates perturbations due to atmospheric drag. More significant for low Earth orbits.

    Parameters:
    tle_data (dict): The TLE data.
    time (float): Time at which to calculate the perturbation.

    Returns:
    dict: Adjustments to the orbital elements due to atmospheric drag.
    """
    # Implement atmospheric drag calculations.
    pass


def perturbation_third_body(tle_data, time):
    """
    Calculates perturbations due to third bodies (e.g., the Moon, the Sun).

    Parameters:
    tle_data (dict): The TLE data.
    time (float): Time at which to calculate the perturbation.

    Returns:
    dict: Adjustments to the orbital elements due to third-body effects.
    """
    # Implement third-body effect calculations.
    pass
