from pydantic import BaseModel


class TLEData(BaseModel):
    satellite_number: str
    classification: str
    international_designator_year: str
    international_designator_launch_number: str
    international_designator_piece: str
    epoch_year: str
    epoch_day: str
    first_derivative_mean_motion: str
    second_derivative_mean_motion: str
    bstar_drag_term: str
    ephemeris_type: str
    element_set_number: str
    inclination: str
    raan: str
    eccentricity: str
    argument_of_perigee: str
    mean_anomaly: str
    mean_motion: str
    revolution_number_at_epoch: str
