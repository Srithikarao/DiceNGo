import random
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from backend.app.models import FoodPlace, ExplorePlace
from backend.app.schemas import ChallengeRequest, ChallengeResponse

def generate_budget_challenge(db: Session, req: ChallengeRequest) -> ChallengeResponse:
    budget = req.budget_limit
    
    # Calculate target allocations
    # Travel reserve: ₹30-50
    travel_est = 40 if budget <= 500 else 60
    spendable = budget - travel_est

    # Targets: 1 food item + 1 free/low-cost explore + optional tea/snack
    all_food = db.query(FoodPlace).all()
    all_explore = db.query(ExplorePlace).all()

    free_explores = [e for e in all_explore if "free" in (e.entry_fee or "").lower()]
    if not free_explores: free_explores = all_explore

    picked_explore = random.choice(free_explores)
    explore_cost = 0 if "free" in (picked_explore.entry_fee or "").lower() else 30

    remaining_for_food = spendable - explore_cost

    # Pick main food matching remaining_for_food
    suitable_foods = []
    for f in all_food:
        if budget <= 300 and f.category in ["Tiffin", "Street Food", "Fast Food"]:
            suitable_foods.append((f, 80))
        elif budget <= 500 and f.category in ["Biryani", "Cafes", "Fast Food", "Restaurants"]:
            suitable_foods.append((f, 180))
        elif budget > 500:
            suitable_foods.append((f, 280))

    if not suitable_foods:
        suitable_foods = [(f, 150) for f in all_food[:15]]

    picked_food, food_cost = random.choice(suitable_foods)

    # Add snack or chai if there's generous headroom
    stops = []
    current_spend = 0

    if remaining_for_food - food_cost >= 60:
        chai_spots = [f for f in all_food if f.category in ["Cafes", "Tiffin"] and "chai" in f.name.lower() or "tea" in f.name.lower() or f.category == "Cafes"]
        if chai_spots:
            chai_pick = random.choice(chai_spots)
            chai_cost = 40
            current_spend += chai_cost
            stops.append({
                "time": "5:00 PM",
                "title": f"☕ Chai / Starter @ {chai_pick.name}",
                "category": chai_pick.category,
                "area": chai_pick.area,
                "cost": chai_cost,
                "note": f"Kickstart with {chai_pick.best_known_for}"
            })

    # Explore stop
    current_spend += explore_cost
    stops.append({
        "time": "6:15 PM",
        "title": f"🌅 Sunset Spot @ {picked_explore.name}",
        "category": picked_explore.category,
        "area": picked_explore.area,
        "cost": explore_cost,
        "note": "Scenic breeze and photography (Free)"
    })

    # Food stop
    current_spend += food_cost
    stops.append({
        "time": "7:45 PM",
        "title": f"🍜 Food Feast @ {picked_food.name}",
        "category": picked_food.category,
        "area": picked_food.area,
        "cost": food_cost,
        "note": f"Signature {picked_food.best_known_for}"
    })

    # Travel
    current_spend += travel_est
    stops.append({
        "time": "En Route",
        "title": "🚌 Estimated Auto / Travel",
        "category": "Travel",
        "area": "Tri-City",
        "cost": travel_est,
        "note": "Shared auto / bike petrol reserve"
    })

    leftover = budget - current_spend
    if leftover >= 50:
        status_cmt = f"₹{leftover} left. Don't spend it all in one place 😎"
    elif leftover > 0:
        status_cmt = f"Masterclass budget management: ₹{leftover} left for mints!"
    else:
        status_cmt = "Hit the exact limit down to the rupee! 🎯"

    return ChallengeResponse(
        challenge_title=f"₹{budget} {req.group_type} Challenge 💸",
        tagline="Maximum Fun. Zero Financial Regret.",
        budget_limit=budget,
        total_estimated_spend=current_spend,
        remaining_balance=max(0, leftover),
        stops=stops,
        status_comment=status_cmt
    )
