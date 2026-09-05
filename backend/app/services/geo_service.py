import math
from datetime import datetime

DEFAULT_WARANGAL_LAT = 18.0073
DEFAULT_WARANGAL_LNG = 79.5668

def calculate_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Haversine formula to compute great-circle distance in kilometers."""
    R = 6371.0  # Earth's radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)

def is_open_now(opening_str: str, closing_str: str) -> bool:
    """
    Checks if a place is open at the current time.
    Handles standard formats like '11:00 AM', '11:30 PM', '06:00 AM', etc.
    """
    if not opening_str or not closing_str or "24" in opening_str.lower():
        return True
    
    try:
        now = datetime.now()
        current_minutes = now.hour * 60 + now.minute
        
        def parse_to_minutes(time_str: str) -> int:
            time_str = time_str.strip().upper()
            if "-" in time_str:
                time_str = time_str.split("-")[0].strip()
            if "&" in time_str:
                time_str = time_str.split("&")[0].strip()
            
            # Extract basic time
            parts = time_str.split()
            if len(parts) >= 2:
                hh_mm, meridiem = parts[0], parts[1]
            else:
                hh_mm, meridiem = time_str, "AM"
                
            hh, mm = map(int, hh_mm.split(":"))
            if meridiem == "PM" and hh != 12:
                hh += 12
            elif meridiem == "AM" and hh == 12:
                hh = 0
            return hh * 60 + mm

        start_min = parse_to_minutes(opening_str)
        end_min = parse_to_minutes(closing_str)

        # If spans midnight (e.g. 04:00 PM to 02:00 AM)
        if end_min < start_min:
            return current_minutes >= start_min or current_minutes <= end_min
        else:
            return start_min <= current_minutes <= end_min
    except Exception:
        # Graceful fallback: assume open during reasonable daytime
        return True
