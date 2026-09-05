from datetime import datetime, date
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models import Visit, FoodPlace, ExplorePlace, EventItem, User
from backend.app.schemas import VisitCreate, VisitResponse
from backend.app.services.auth_service import get_current_user

router = APIRouter(prefix="/visits", tags=["Visits & History"])

@router.post("", response_model=VisitResponse)
def record_visit(
    req: VisitCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    # Resolve place details
    place_name = "Unknown Spot"
    category = "General"
    area = "Warangal"

    if req.item_type == "food":
        f = db.query(FoodPlace).filter(FoodPlace.id == req.item_id).first()
        if f:
            place_name = f.name
            category = f.category
            area = f.area
    elif req.item_type == "explore":
        e = db.query(ExplorePlace).filter(ExplorePlace.id == req.item_id).first()
        if e:
            place_name = e.name
            category = e.category
            area = e.area
    elif req.item_type == "event":
        ev = db.query(EventItem).filter(EventItem.id == req.item_id).first()
        if ev:
            place_name = ev.event_name
            category = ev.category
            area = ev.area

    # Check if this place was ever visited before by this user
    previous_visits = db.query(Visit).filter(
        Visit.user_id == user.id,
        Visit.item_type == req.item_type,
        Visit.item_id == req.item_id
    ).count()

    is_new = (previous_visits == 0)
    v_date = req.visited_at.date().isoformat() if req.visited_at else date.today().isoformat()

    new_visit = Visit(
        user_id=user.id,
        item_id=req.item_id,
        item_type=req.item_type,
        place_name=place_name,
        category=category,
        area=area,
        visited_at=req.visited_at or datetime.utcnow(),
        visit_date=v_date,
        visit_count=previous_visits + 1,
        discovery_source=req.discovery_source or "Direct",
        is_new_discovery=is_new,
        notes=req.notes
    )
    db.add(new_visit)
    db.commit()
    db.refresh(new_visit)

    return new_visit

@router.get("", response_model=List[VisitResponse])
def get_visits(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    return db.query(Visit).filter(Visit.user_id == user.id).order_by(Visit.visited_at.desc()).all()

@router.get("/stats")
def get_visit_stats(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    visits = db.query(Visit).filter(Visit.user_id == user.id).all()
    total_visits = len(visits)
    new_discoveries = sum(1 for v in visits if v.is_new_discovery)
    
    unique_places = len(set((v.item_type, v.item_id) for v in visits))
    total_available = (db.query(FoodPlace).count() + db.query(ExplorePlace).count()) or 420
    unlocked_percent = min(100, round((unique_places / total_available) * 100, 1))

    # Calculate active streak (distinct dates)
    dates = sorted(set(v.visit_date for v in visits), reverse=True)
    streak_days = len(dates)

    # Categories breakdown
    cats = {}
    for v in visits:
        c = v.category or "General"
        cats[c] = cats.get(c, 0) + 1

    return {
        "total_visits": total_visits,
        "new_discoveries": new_discoveries,
        "unique_places": unique_places,
        "unlocked_percent": unlocked_percent,
        "progress_copy": f"{unlocked_percent}% unlocked. Warangal still has secrets.",
        "streak_days": streak_days,
        "category_breakdown": cats
    }
