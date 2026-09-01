FT_PER_UNIT = {
    "FEET": 1.0,
    "INCHES": 1 / 12,
    "METERS": 3.280839895,
    "CENTIMETERS": 0.03280839895,
}


def to_feet(value: float, unit: str) -> float:
    return value * FT_PER_UNIT[unit]


def to_sqft(length: float, width: float, unit: str) -> float:
    return round(to_feet(length, unit) * to_feet(width, unit), 2)
