from typing import Optional, List
from datetime import datetime, date
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from backend.app.database import get_db
from backend.app.models import FoodPlace, ExplorePlace, EventItem, Favorite, Visit, User
from backend.app.services.auth_service import get_optional_user
from backend.app.services.geo_service import calculate_distance_km, is_open_now, DEFAULT_WARANGAL_LAT, DEFAULT_WARANGAL_LNG

router = APIRouter(tags=["Places & Discovery"])

@router.get("/food")
def list_food(
    category: Optional[str] = None,
    area: Optional[str] = None,
    veg_only: Optional[bool] = None,
    search: Optional[str] = None,
    lat: Optional[float] = None,
    lng: Optional[float] = None,
    limit: int = 60,
    offset: int = 0,
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_optional_user)
):
    query = db.query(FoodPlace)
    if category and category.lower() != "all":
        query = query.filter(FoodPlace.category.ilike(f"%{category}%"))
    if area and area.lower() != "all":
        query = query.filter(FoodPlace.area.ilike(f"%{area}%"))
    if veg_only:
        query = query.filter(FoodPlace.veg == True)
    if search:
        s = f"%{search.strip()}%"
        query = query.filter(or_(
            FoodPlace.name.ilike(s),
            FoodPlace.cuisine.ilike(s),
            FoodPlace.best_known_for.ilike(s),
            FoodPlace.area.ilike(s)
        ))

    total = query.count()
    items = query.order_by(FoodPlace.rating.desc()).offset(offset).limit(limit).all()

    # Pre-fetch user's favorites & visits
    user_favs = set()
    user_visits = {}
    if user:
        favs = db.query(Favorite.item_id).filter(Favorite.user_id == user.id, Favorite.item_type == "food").all()
        user_favs = set(f[0] for f in favs)
        visits = db.query(Visit).filter(Visit.user_id == user.id, Visit.item_type == "food").all()
        for v in visits:
            user_visits[v.item_id] = user_visits.get(v.item_id, 0) + 1

    u_lat = lat if lat is not None else DEFAULT_WARANGAL_LAT
    u_lng = lng if lng is not None else DEFAULT_WARANGAL_LNG

    results = []
    for f in items:
        dist = calculate_distance_km(u_lat, u_lng, f.latitude, f.longitude)
        open_status = is_open_now(f.opening_time, f.closing_time)
        results.append({
            "id": f.id,
            "name": f.name,
            "category": f.category,
            "cuisine": f.cuisine,
            "address": f.address,
            "area": f.area,
            "latitude": f.latitude,
            "longitude": f.longitude,
            "maps_url": f.maps_url,
            "opening_time": f.opening_time,
            "closing_time": f.closing_time,
            "rating": f.rating,
            "review_count": f.review_count,
            "price_range": f.price_range,
            "best_known_for": f.best_known_for,
            "veg": f.veg,
            "non_veg": f.non_veg,
            "indoor_seating": f.indoor_seating,
            "outdoor_seating": f.outdoor_seating,
            "parking": f.parking,
            "discounts": f.discounts,
            "seating_capacity": f.seating_capacity,
            "instagram_url": f.instagram_url,
            "images": f.images,
            "description": f.description,
            "is_new": f.is_new,
            "is_featured": f.is_featured,
            "is_favorite": f.id in user_favs,
            "is_visited": f.id in user_visits,
            "visit_count": user_visits.get(f.id, 0),
            "distance_km": dist,
            "is_open_now": open_status
        })

    return {"total": total, "items": results}

@router.get("/food/{food_id}")
def get_food_detail(
    food_id: int,
    lat: Optional[float] = None,
    lng: Optional[float] = None,
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_optional_user)
):
    f = db.query(FoodPlace).filter(FoodPlace.id == food_id).first()
    if not f:
        raise HTTPException(status_code=404, detail="Food place not found")

    u_lat = lat if lat is not None else DEFAULT_WARANGAL_LAT
    u_lng = lng if lng is not None else DEFAULT_WARANGAL_LNG
    dist = calculate_distance_km(u_lat, u_lng, f.latitude, f.longitude)

    is_fav = False
    is_vis = False
    visit_cnt = 0
    if user:
        is_fav = db.query(Favorite).filter(Favorite.user_id == user.id, Favorite.item_id == f.id, Favorite.item_type == "food").first() is not None
        visits = db.query(Visit).filter(Visit.user_id == user.id, Visit.item_id == f.id, Visit.item_type == "food").all()
        is_vis = len(visits) > 0
        visit_cnt = len(visits)

    return {
        "id": f.id,
        "name": f.name,
        "category": f.category,
        "cuisine": f.cuisine,
        "address": f.address,
        "area": f.area,
        "latitude": f.latitude,
        "longitude": f.longitude,
        "maps_url": f.maps_url,
        "opening_time": f.opening_time,
        "closing_time": f.closing_time,
        "rating": f.rating,
        "review_count": f.review_count,
        "price_range": f.price_range,
        "best_known_for": f.best_known_for,
        "veg": f.veg,
        "non_veg": f.non_veg,
        "indoor_seating": f.indoor_seating,
        "outdoor_seating": f.outdoor_seating,
        "parking": f.parking,
        "discounts": f.discounts,
        "seating_capacity": f.seating_capacity,
        "instagram_url": f.instagram_url,
        "images": f.images,
        "description": f.description,
        "is_new": f.is_new,
        "is_featured": f.is_featured,
        "is_favorite": is_fav,
        "is_visited": is_vis,
        "visit_count": visit_cnt,
        "distance_km": dist,
        "is_open_now": is_open_now(f.opening_time, f.closing_time)
    }

@router.get("/explore")
def list_explore(
    category: Optional[str] = None,
    area: Optional[str] = None,
    search: Optional[str] = None,
    lat: Optional[float] = None,
    lng: Optional[float] = None,
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_optional_user)
):
    query = db.query(ExplorePlace)
    if category and category.lower() != "all":
        query = query.filter(ExplorePlace.category.ilike(f"%{category}%"))
    if area and area.lower() != "all":
        query = query.filter(ExplorePlace.area.ilike(f"%{area}%"))
    if search:
        s = f"%{search.strip()}%"
        query = query.filter(or_(
            ExplorePlace.name.ilike(s),
            ExplorePlace.description.ilike(s),
            ExplorePlace.area.ilike(s)
        ))

    total = query.count()
    items = query.order_by(ExplorePlace.rating.desc()).offset(offset).limit(limit).all()

    user_favs = set()
    user_visits = {}
    if user:
        favs = db.query(Favorite.item_id).filter(Favorite.user_id == user.id, Favorite.item_type == "explore").all()
        user_favs = set(f[0] for f in favs)
        visits = db.query(Visit).filter(Visit.user_id == user.id, Visit.item_type == "explore").all()
        for v in visits:
            user_visits[v.item_id] = user_visits.get(v.item_id, 0) + 1

    u_lat = lat if lat is not None else DEFAULT_WARANGAL_LAT
    u_lng = lng if lng is not None else DEFAULT_WARANGAL_LNG

    results = []
    for e in items:
        dist = calculate_distance_km(u_lat, u_lng, e.latitude, e.longitude)
        results.append({
            "id": e.id,
            "name": e.name,
            "category": e.category,
            "address": e.address,
            "area": e.area,
            "latitude": e.latitude,
            "longitude": e.longitude,
            "maps_url": e.maps_url,
            "best_time": e.best_time,
            "entry_fee": e.entry_fee,
            "opening_time": e.opening_time,
            "closing_time": e.closing_time,
            "rating": e.rating,
            "review_count": e.review_count,
            "parking": e.parking,
            "friends_suitable": e.friends_suitable,
            "family_suitable": e.family_suitable,
            "images": e.images,
            "description": e.description,
            "is_new": e.is_new,
            "is_featured": e.is_featured,
            "is_favorite": e.id in user_favs,
            "is_visited": e.id in user_visits,
            "visit_count": user_visits.get(e.id, 0),
            "distance_km": dist,
            "is_open_now": is_open_now(e.opening_time, e.closing_time)
        })

    return {"total": total, "items": results}

@router.get("/explore/{explore_id}")
def get_explore_detail(
    explore_id: int,
    lat: Optional[float] = None,
    lng: Optional[float] = None,
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_optional_user)
):
    e = db.query(ExplorePlace).filter(ExplorePlace.id == explore_id).first()
    if not e:
        raise HTTPException(status_code=404, detail="Explore place not found")

    u_lat = lat if lat is not None else DEFAULT_WARANGAL_LAT
    u_lng = lng if lng is not None else DEFAULT_WARANGAL_LNG
    dist = calculate_distance_km(u_lat, u_lng, e.latitude, e.longitude)

    is_fav = False
    is_vis = False
    visit_cnt = 0
    if user:
        is_fav = db.query(Favorite).filter(Favorite.user_id == user.id, Favorite.item_id == e.id, Favorite.item_type == "explore").first() is not None
        visits = db.query(Visit).filter(Visit.user_id == user.id, Visit.item_id == e.id, Visit.item_type == "explore").all()
        is_vis = len(visits) > 0
        visit_cnt = len(visits)

    return {
        "id": e.id,
        "name": e.name,
        "category": e.category,
        "address": e.address,
        "area": e.area,
        "latitude": e.latitude,
        "longitude": e.longitude,
        "maps_url": e.maps_url,
        "best_time": e.best_time,
        "entry_fee": e.entry_fee,
        "opening_time": e.opening_time,
        "closing_time": e.closing_time,
        "rating": e.rating,
        "review_count": e.review_count,
        "parking": e.parking,
        "friends_suitable": e.friends_suitable,
        "family_suitable": e.family_suitable,
        "images": e.images,
        "description": e.description,
        "is_new": e.is_new,
        "is_featured": e.is_featured,
        "is_favorite": is_fav,
        "is_visited": is_vis,
        "visit_count": visit_cnt,
        "distance_km": dist,
        "is_open_now": is_open_now(e.opening_time, e.closing_time)
    }

@router.get("/events")
def list_events(
    bucket: Optional[str] = None,  # 'Today', 'This Week', 'Coming Soon'
    category: Optional[str] = None,
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_optional_user)
):
    query = db.query(EventItem)
    if category and category.lower() != "all":
        query = query.filter(EventItem.category.ilike(f"%{category}%"))

    all_evs = query.order_by(EventItem.date.asc()).all()
    today_str = date.today().isoformat()

    user_favs = set()
    if user:
        favs = db.query(Favorite.item_id).filter(Favorite.user_id == user.id, Favorite.item_type == "event").all()
        user_favs = set(f[0] for f in favs)

    categorized = []
    for ev in all_evs:
        # Determine time bucket
        ev_date = ev.date
        if ev_date == today_str:
            time_bucket = "Today"
        elif ev_date > today_str and ev_date <= "2026-09-20":
            time_bucket = "This Week"
        else:
            time_bucket = "Coming Soon"

        if bucket and bucket.lower() != "all" and time_bucket.lower() != bucket.lower():
            continue

        categorized.append({
            "id": ev.id,
            "event_name": ev.event_name,
            "name": ev.event_name,
            "venue": ev.venue,
            "category": ev.category,
            "address": ev.address,
            "area": ev.area,
            "latitude": ev.latitude,
            "longitude": ev.longitude,
            "date": ev.date,
            "start_time": ev.start_time,
            "end_time": ev.end_time,
            "individual_or_group": ev.individual_or_group,
            "contact": ev.contact,
            "maps_url": ev.maps_url,
            "instagram_url": ev.instagram_url,
            "website_url": ev.website_url,
            "fee": ev.fee,
            "rating": ev.rating,
            "reviews": ev.reviews,
            "images": ev.images,
            "description": ev.description,
            "booking_information": ev.booking_information,
            "is_featured": ev.is_featured,
            "is_favorite": ev.id in user_favs,
            "time_bucket": time_bucket
        })

    return {"total": len(categorized), "items": categorized}

@router.get("/search")
def search_all(
    q: str = Query(..., min_length=1),
    lat: Optional[float] = None,
    lng: Optional[float] = None,
    db: Session = Depends(get_db)
):
    search_str = f"%{q.strip()}%"
    foods = db.query(FoodPlace).filter(or_(
        FoodPlace.name.ilike(search_str),
        FoodPlace.category.ilike(search_str),
        FoodPlace.cuisine.ilike(search_str),
        FoodPlace.best_known_for.ilike(search_str),
        FoodPlace.area.ilike(search_str)
    )).limit(10).all()

    explores = db.query(ExplorePlace).filter(or_(
        ExplorePlace.name.ilike(search_str),
        ExplorePlace.category.ilike(search_str),
        ExplorePlace.area.ilike(search_str)
    )).limit(10).all()

    events = db.query(EventItem).filter(or_(
        EventItem.event_name.ilike(search_str),
        EventItem.venue.ilike(search_str),
        EventItem.category.ilike(search_str),
        EventItem.area.ilike(search_str)
    )).limit(6).all()

    return {
        "query": q,
        "food": [{"id": f.id, "name": f.name, "category": f.category, "area": f.area, "rating": f.rating, "type": "food", "best_for": f.best_known_for} for f in foods],
        "explore": [{"id": e.id, "name": e.name, "category": e.category, "area": e.area, "rating": e.rating, "type": "explore"} for e in explores],
        "events": [{"id": ev.id, "name": ev.event_name, "category": ev.category, "venue": ev.venue, "date": ev.date, "type": "event"} for ev in events]
    }

@router.get("/new")
def get_new_in_warangal(db: Session = Depends(get_db)):
    new_food = db.query(FoodPlace).filter(FoodPlace.is_new == True).limit(6).all()
    new_explore = db.query(ExplorePlace).filter(ExplorePlace.is_new == True).limit(4).all()
    return {
        "food": [{"id": f.id, "name": f.name, "category": f.category, "area": f.area, "rating": f.rating, "image": f.images, "best_for": f.best_known_for, "type": "food"} for f in new_food],
        "explore": [{"id": e.id, "name": e.name, "category": e.category, "area": e.area, "rating": e.rating, "image": e.images, "type": "explore"} for e in new_explore]
    }
