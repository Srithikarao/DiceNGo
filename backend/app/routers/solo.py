from typing import Optional, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models import FoodPlace, ExplorePlace, Visit, User
from backend.app.services.auth_service import get_optional_user

router = APIRouter(prefix="/solo", tags=["Solo Mode"])

@router.get("/recommendations")
def get_solo_spots(
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_optional_user)
):
    # Solo friendly food: Cafes, Bakeries, Quiet Tiffins
    cafes = db.query(FoodPlace).filter(FoodPlace.category.in_(["Cafes", "Tiffin", "Ice Cream", "Desserts"])).order_by(FoodPlace.rating.desc()).limit(12).all()
    
    # Solo friendly explore: Temples, Lakes, Scenic, Photography, Hidden Gems, Parks
    explores = db.query(ExplorePlace).filter(ExplorePlace.category.in_(["Temples", "Lakes", "Scenic", "Photography", "Hidden Gems", "Parks"])).order_by(ExplorePlace.rating.desc()).limit(10).all()

    # Repeat visit warning check
    repeat_warning = None
    if user:
        visits = db.query(Visit).filter(Visit.user_id == user.id).all()
        counts = {}
        for v in visits:
            counts[v.place_name] = counts.get(v.place_name, 0) + 1
        for name, cnt in counts.items():
            if cnt >= 3:
                repeat_warning = f"You've been to {name} {cnt} times. We know you love it, but... don't repeat yourself 😏 Time for something new."
                break

    spots = []
    for c in cafes[:6]:
        spots.append({
            "id": c.id,
            "name": c.name,
            "category": c.category,
            "area": c.area,
            "rating": c.rating,
            "type": "food",
            "solo_tag": "Quiet corner + Wifi + Coffee",
            "best_for": c.best_known_for,
            "image": c.images,
            "maps_url": c.maps_url
        })
    for e in explores[:6]:
        spots.append({
            "id": e.id,
            "name": e.name,
            "category": e.category,
            "area": e.area,
            "rating": e.rating,
            "type": "explore",
            "solo_tag": "Peaceful walk & introspection",
            "best_for": e.best_time,
            "image": e.images,
            "maps_url": e.maps_url
        })

    return {
        "tagline": "WHY WAIT FOR EVERYONE? GO SOLO.",
        "repeat_warning": repeat_warning,
        "spots": spots
    }
