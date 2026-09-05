from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models import Favorite, FoodPlace, ExplorePlace, EventItem, User
from backend.app.schemas import FavoriteCreate
from backend.app.services.auth_service import get_current_user

router = APIRouter(prefix="/favorites", tags=["Favorites"])

@router.get("")
def list_favorites(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    favs = db.query(Favorite).filter(Favorite.user_id == user.id).order_by(Favorite.created_at.desc()).all()
    results = []
    for f in favs:
        details = None
        if f.item_type == "food":
            item = db.query(FoodPlace).filter(FoodPlace.id == f.item_id).first()
            if item:
                details = {"name": item.name, "category": item.category, "area": item.area, "rating": item.rating, "image": item.images, "best_for": item.best_known_for, "maps_url": item.maps_url}
        elif f.item_type == "explore":
            item = db.query(ExplorePlace).filter(ExplorePlace.id == f.item_id).first()
            if item:
                details = {"name": item.name, "category": item.category, "area": item.area, "rating": item.rating, "image": item.images, "best_for": item.best_time, "maps_url": item.maps_url}
        elif f.item_type == "event":
            item = db.query(EventItem).filter(EventItem.id == f.item_id).first()
            if item:
                details = {"name": item.event_name, "category": item.category, "venue": item.venue, "date": item.date, "image": item.images, "maps_url": item.maps_url}

        if details:
            results.append({
                "id": f.id,
                "item_id": f.item_id,
                "item_type": f.item_type,
                "created_at": f.created_at,
                "item": details
            })
    return results

@router.post("")
def add_favorite(
    req: FavoriteCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    existing = db.query(Favorite).filter(
        Favorite.user_id == user.id,
        Favorite.item_id == req.item_id,
        Favorite.item_type == req.item_type
    ).first()

    if existing:
        return {"message": "Already in scrapbook", "favorite_id": existing.id}

    fav = Favorite(
        user_id=user.id,
        item_id=req.item_id,
        item_type=req.item_type
    )
    db.add(fav)
    db.commit()
    db.refresh(fav)
    return {"message": "Saved to scrapbook ❤️", "favorite_id": fav.id}

@router.delete("/{item_type}/{item_id}")
def remove_favorite(
    item_type: str,
    item_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    fav = db.query(Favorite).filter(
        Favorite.user_id == user.id,
        Favorite.item_id == item_id,
        Favorite.item_type == item_type
    ).first()
    if not fav:
        raise HTTPException(status_code=404, detail="Favorite not found")
    db.delete(fav)
    db.commit()
    return {"message": "Removed from scrapbook"}
