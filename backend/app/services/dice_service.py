import random
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from backend.app.models import FoodPlace, ExplorePlace, EventItem, Visit, User
from backend.app.services.geo_service import calculate_distance_km, is_open_now, DEFAULT_WARANGAL_LAT, DEFAULT_WARANGAL_LNG

PUNCHLINES = [
    "THE DICE HAS SPOKEN. NO MORE DISCUSSIONS. GO HERE.",
    "YOUR DESTINY TONIGHT: {name}!",
    "STOP SCROLLING. START GOING.",
    "THE GANG HAS FOUND ITS CALLING.",
    "ONE ROLL. ONE PLACE. LET'S GO.",
    "THE UNIVERSE CHOSE THIS SPOT FOR YOU.",
    "ARGUMENT SETTLED. DESTINATION LOCKED."
]

def roll_dice(
    db: Session,
    mode: str = "Food",
    user_lat: Optional[float] = None,
    user_lng: Optional[float] = None,
    user: Optional[User] = None,
    allow_familiar: bool = False
) -> Dict[str, Any]:
    lat = user_lat if user_lat is not None else DEFAULT_WARANGAL_LAT
    lng = user_lng if user_lng is not None else DEFAULT_WARANGAL_LNG

    # Fetch user's visit history if logged in
    visited_item_ids = {}
    if user:
        visits = db.query(Visit).filter(Visit.user_id == user.id).all()
        for v in visits:
            visited_item_ids[(v.item_type, v.item_id)] = visited_item_ids.get((v.item_type, v.item_id), 0) + 1

    candidates: List[Dict[str, Any]] = []

    # 1. Fetch relevant candidates
    mode_normalized = mode.strip().lower()
    
    if mode_normalized in ["food", "surprise me"]:
        foods = db.query(FoodPlace).all()
        for f in foods:
            dist = calculate_distance_km(lat, lng, f.latitude, f.longitude)
            open_status = is_open_now(f.opening_time, f.closing_time)
            visit_cnt = visited_item_ids.get(("food", f.id), 0)
            
            # Base weight
            weight = 100.0
            if open_status: weight *= 2.0
            if dist < 6.0: weight *= 1.5
            elif dist > 15.0: weight *= 0.5
            if f.rating >= 4.4: weight *= 1.3
            
            # DRY (Don't Repeat Yourself) logic
            if visit_cnt == 0:
                weight *= 1.8  # Unvisited boost
            else:
                if not allow_familiar:
                    weight *= (0.2 ** min(visit_cnt, 3))  # Severe penalty for repeat visits
                else:
                    weight *= 1.2  # If familiar is explicitly requested
            
            candidates.append({
                "type": "food",
                "obj": f,
                "weight": max(weight, 1.0),
                "dist": dist,
                "open": open_status,
                "visit_count": visit_cnt
            })

    if mode_normalized in ["explore", "surprise me"]:
        explores = db.query(ExplorePlace).all()
        for e in explores:
            dist = calculate_distance_km(lat, lng, e.latitude, e.longitude)
            open_status = is_open_now(e.opening_time, e.closing_time)
            visit_cnt = visited_item_ids.get(("explore", e.id), 0)
            
            weight = 100.0
            if open_status: weight *= 1.8
            if dist < 8.0: weight *= 1.4
            if e.rating >= 4.5: weight *= 1.3
            if visit_cnt == 0:
                weight *= 2.0
            else:
                if not allow_familiar:
                    weight *= (0.2 ** min(visit_cnt, 3))
            
            candidates.append({
                "type": "explore",
                "obj": e,
                "weight": max(weight, 1.0),
                "dist": dist,
                "open": open_status,
                "visit_count": visit_cnt
            })

    if mode_normalized in ["events", "surprise me"]:
        events = db.query(EventItem).all()
        for ev in events:
            dist = calculate_distance_km(lat, lng, ev.latitude, ev.longitude)
            visit_cnt = visited_item_ids.get(("event", ev.id), 0)
            weight = 120.0
            if ev.is_featured: weight *= 1.5
            if visit_cnt == 0: weight *= 2.0
            
            candidates.append({
                "type": "event",
                "obj": ev,
                "weight": max(weight, 1.0),
                "dist": dist,
                "open": True,
                "visit_count": visit_cnt
            })

    if not candidates:
        # Fallback to any food place
        any_food = db.query(FoodPlace).first()
        return {
            "selected_place": {"id": any_food.id, "name": any_food.name},
            "place_type": "food",
            "why_selected": "Fallback pick",
            "distance_km": 2.5,
            "estimated_cost": "₹200",
            "punchline": "THE DICE HAS SPOKEN."
        }

    # 2. Weighted Random Selection
    weights = [c["weight"] for c in candidates]
    picked = random.choices(candidates, weights=weights, k=1)[0]
    obj = picked["obj"]
    p_type = picked["type"]

    # 3. Format why selected
    if p_type == "food":
        why = f"Rated {obj.rating}★ in {obj.area}. Known for {obj.best_known_for}. {'First time discovery!' if picked['visit_count'] == 0 else f'You loved this ({picked['visit_count']} previous visits).'}"
        est_cost = obj.price_range or "₹200-400"
        place_data = {
            "id": obj.id,
            "name": obj.name,
            "category": obj.category,
            "cuisine": obj.cuisine,
            "area": obj.area,
            "address": obj.address,
            "rating": obj.rating,
            "review_count": obj.review_count,
            "price_range": obj.price_range,
            "best_known_for": obj.best_known_for,
            "maps_url": obj.maps_url,
            "latitude": obj.latitude,
            "longitude": obj.longitude,
            "images": obj.images,
            "description": obj.description,
            "opening_time": obj.opening_time,
            "closing_time": obj.closing_time,
            "is_open_now": picked["open"]
        }
    elif p_type == "explore":
        why = f"{obj.category} in {obj.area} with {obj.rating}★ rating. Best time: {obj.best_time}. {'Unexplored territory!' if picked['visit_count'] == 0 else 'A familiar favorite.'}"
        est_cost = obj.entry_fee or "Free"
        place_data = {
            "id": obj.id,
            "name": obj.name,
            "category": obj.category,
            "area": obj.area,
            "address": obj.address,
            "rating": obj.rating,
            "review_count": obj.review_count,
            "entry_fee": obj.entry_fee,
            "best_time": obj.best_time,
            "maps_url": obj.maps_url,
            "latitude": obj.latitude,
            "longitude": obj.longitude,
            "images": obj.images,
            "description": obj.description,
            "opening_time": obj.opening_time,
            "closing_time": obj.closing_time,
            "is_open_now": picked["open"]
        }
    else:  # event
        why = f"Happening {obj.date} at {obj.venue}. {obj.category} event with {obj.rating}★ interest."
        est_cost = obj.fee or "Free"
        place_data = {
            "id": obj.id,
            "event_name": obj.event_name,
            "name": obj.event_name,
            "category": obj.category,
            "venue": obj.venue,
            "area": obj.area,
            "address": obj.address,
            "date": obj.date,
            "start_time": obj.start_time,
            "end_time": obj.end_time,
            "fee": obj.fee,
            "rating": obj.rating,
            "maps_url": obj.maps_url,
            "latitude": obj.latitude,
            "longitude": obj.longitude,
            "images": obj.images,
            "description": obj.description,
            "booking_information": obj.booking_information
        }

    template_punchline = random.choice(PUNCHLINES)
    punchline = template_punchline.format(name=place_data["name"])

    return {
        "selected_place": place_data,
        "place_type": p_type,
        "why_selected": why,
        "distance_km": picked["dist"],
        "estimated_cost": est_cost,
        "punchline": punchline
    }
