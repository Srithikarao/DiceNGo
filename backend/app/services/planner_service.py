import os
import re
import json
import random
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from backend.app.models import FoodPlace, ExplorePlace, EventItem, User
from backend.app.schemas import PlannerRequest, PlannerResponse, ItineraryStop
from backend.app.services.geo_service import calculate_distance_km, DEFAULT_WARANGAL_LAT, DEFAULT_WARANGAL_LNG

def generate_itinerary(db: Session, req: PlannerRequest, user: Optional[User] = None) -> PlannerResponse:
    # 1. Parse situation text heuristics if needed
    text = req.situation.lower()
    
    group_size = req.group_size
    if "three friends" in text or "3 friends" in text or "four people" in text or "4 people" in text:
        group_size = 4
    elif "two of us" in text or "couple" in text or "2 of us" in text:
        group_size = 2
    elif "solo" in text or "myself" in text or "alone" in text:
        group_size = 1

    budget = req.budget_per_person or 500
    budget_matches = re.findall(r'₹?\s*(\d{3,4})', text)
    if budget_matches:
        try:
            budget = int(budget_matches[0])
        except ValueError:
            pass

    max_dist = req.max_distance_km or 12.0
    dist_matches = re.findall(r'(\d{1,2})\s*km', text)
    if dist_matches:
        try:
            max_dist = float(dist_matches[0])
        except ValueError:
            pass

    user_lat = req.user_lat or DEFAULT_WARANGAL_LAT
    user_lng = req.user_lng or DEFAULT_WARANGAL_LNG

    # 2. Select Candidates strictly from Database within distance
    all_food = db.query(FoodPlace).all()
    all_explore = db.query(ExplorePlace).all()
    all_events = db.query(EventItem).all()

    # Filter by distance
    cafes = [f for f in all_food if f.category in ["Cafes", "Tiffin"] and calculate_distance_km(user_lat, user_lng, f.latitude, f.longitude) <= max_dist]
    dinners = [f for f in all_food if f.category in ["Biryani", "Restaurants", "Drive-ins", "Fast Food"] and calculate_distance_km(user_lat, user_lng, f.latitude, f.longitude) <= max_dist]
    desserts = [f for f in all_food if f.category in ["Ice Cream", "Desserts", "Street Food"] and calculate_distance_km(user_lat, user_lng, f.latitude, f.longitude) <= max_dist]
    explores = [e for e in all_explore if calculate_distance_km(user_lat, user_lng, e.latitude, e.longitude) <= max_dist]
    events = [ev for ev in all_events if calculate_distance_km(user_lat, user_lng, ev.latitude, ev.longitude) <= max_dist]

    # Fallbacks if strict distance empty
    if not cafes: cafes = [f for f in all_food if f.category in ["Cafes", "Tiffin"]]
    if not dinners: dinners = [f for f in all_food if f.category in ["Biryani", "Restaurants"]]
    if not explores: explores = all_explore

    # 3. Assemble stops based on duration and vibe
    stops: List[ItineraryStop] = []
    current_cost_pp = 0
    total_distance = 0.0

    # Stop 1: Afternoon / Evening Starter (Cafe / Chai)
    cafe_pick = random.choice(cafes) if cafes else all_food[0]
    cafe_cost = 90 if "₹ (" in (cafe_pick.price_range or "") else 150
    current_cost_pp += cafe_cost
    stops.append(ItineraryStop(
        time="4:30 PM",
        type="cafe",
        name=cafe_pick.name,
        item_id=cafe_pick.id,
        category=cafe_pick.category,
        area=cafe_pick.area,
        estimated_cost_per_person=cafe_cost,
        description=cafe_pick.description[:120] + "...",
        why_selected=f"Prime hangout spot in {cafe_pick.area}. Great starter for {cafe_pick.best_known_for}.",
        maps_url=cafe_pick.maps_url,
        image=cafe_pick.images
    ))
    last_lat, last_lng = cafe_pick.latitude, cafe_pick.longitude

    # Stop 2: Sunset / Explore Spot
    sunset_explores = [e for e in explores if e.category in ["Sunset Spots", "Lakes", "Parks", "Temples", "Scenic"]]
    explore_pick = random.choice(sunset_explores) if sunset_explores else random.choice(explores)
    exp_dist = calculate_distance_km(last_lat, last_lng, explore_pick.latitude, explore_pick.longitude)
    total_distance += exp_dist
    explore_cost = 0 if "free" in (explore_pick.entry_fee or "").lower() else 30
    current_cost_pp += explore_cost
    stops.append(ItineraryStop(
        time="5:45 PM",
        type="explore",
        name=explore_pick.name,
        item_id=explore_pick.id,
        category=explore_pick.category,
        area=explore_pick.area,
        estimated_cost_per_person=explore_cost,
        description=explore_pick.description[:120] + "...",
        why_selected=f"Golden hour scenery in {explore_pick.area}. {explore_pick.best_time}.",
        maps_url=explore_pick.maps_url,
        image=explore_pick.images
    ))
    last_lat, last_lng = explore_pick.latitude, explore_pick.longitude

    # Stop 3: Main Dinner / Feast
    dinner_pick = random.choice(dinners) if dinners else all_food[1]
    din_dist = calculate_distance_km(last_lat, last_lng, dinner_pick.latitude, dinner_pick.longitude)
    total_distance += din_dist
    dinner_cost = 220 if "₹₹" in (dinner_pick.price_range or "") else 160
    # Adjust to fit budget
    if current_cost_pp + dinner_cost > budget - 50:
        dinner_cost = max(100, budget - current_cost_pp - 60)
    current_cost_pp += dinner_cost
    stops.append(ItineraryStop(
        time="7:30 PM",
        type="dinner",
        name=dinner_pick.name,
        item_id=dinner_pick.id,
        category=dinner_pick.category,
        area=dinner_pick.area,
        estimated_cost_per_person=dinner_cost,
        description=dinner_pick.description[:120] + "...",
        why_selected=f"Legendary for {dinner_pick.best_known_for}. Fills the gang up without breaking the bank.",
        maps_url=dinner_pick.maps_url,
        image=dinner_pick.images
    ))
    last_lat, last_lng = dinner_pick.latitude, dinner_pick.longitude

    # Stop 4 (If budget and time allow): Dessert or Late Night Ice Cream / Drive-in
    if req.duration_hours and req.duration_hours >= 3 and current_cost_pp < budget - 60 and desserts:
        dessert_pick = random.choice(desserts)
        des_dist = calculate_distance_km(last_lat, last_lng, dessert_pick.latitude, dessert_pick.longitude)
        total_distance += des_dist
        des_cost = 60
        current_cost_pp += des_cost
        stops.append(ItineraryStop(
            time="9:15 PM",
            type="dessert",
            name=dessert_pick.name,
            item_id=dessert_pick.id,
            category=dessert_pick.category,
            area=dessert_pick.area,
            estimated_cost_per_person=des_cost,
            description=dessert_pick.description[:120] + "...",
            why_selected=f"Sweet finish in {dessert_pick.area}. {dessert_pick.best_known_for}.",
            maps_url=dessert_pick.maps_url,
            image=dessert_pick.images
        ))

    # Travel estimate: flat ₹40-50 per person for auto/fuel
    travel_cost = 40
    current_cost_pp += travel_cost
    remaining = max(0, budget - current_cost_pp)

    # 4. Generate retro conversational message
    user_name = user.name if user else "Friend"
    retro_messages = [
        f"Okay {user_name}, ₹{budget} each, {round(max_dist)} km max, {group_size} {'people' if group_size > 1 else 'person'} and you're bored? The mission is planned.",
        f"Relax {user_name}, I've organized your Warangal outing. Total estimated spend is ₹{current_cost_pp} per head.",
        f"Say no more, {user_name}. 3 stops, zero arguments. Here is your battle-tested hangout plan."
    ]
    summary_msg = random.choice(retro_messages)

    # Check for Gemini API key enhancement if available
    gemini_key = os.getenv("GEMINI_API_KEY")
    if gemini_key:
        try:
            import google.generativeai as genai
            genai.configure(api_key=gemini_key)
            model = genai.GenerativeModel("gemini-1.5-flash")
            prompt = (
                f"You are Dice & Go, a quirky retro-arcade Indian college guide for Warangal. "
                f"User: '{req.situation}', Budget: ₹{budget}, Group: {group_size}. "
                f"Write a 2-sentence energetic retro intro for this itinerary with stops: {[s.name for s in stops]}."
            )
            response = model.generate_content(prompt)
            if response and response.text:
                summary_msg = response.text.strip()
        except Exception:
            pass

    return PlannerResponse(
        itinerary_title=f"The {req.vibe or 'Warangal'} Mission 🚀",
        summary_message=summary_msg,
        stops=stops,
        total_cost_per_person=current_cost_pp,
        total_group_cost=current_cost_pp * group_size,
        remaining_budget_per_person=remaining,
        estimated_travel_cost=travel_cost,
        total_distance_km=round(total_distance, 1)
    )
