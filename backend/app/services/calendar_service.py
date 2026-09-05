import calendar
from datetime import datetime, date
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from backend.app.models import Visit, MonthlyRecap, User, FoodPlace, ExplorePlace, EventItem
from backend.app.schemas import CalendarMonthResponse, CalendarDaySummary, CalendarDayActivity, MonthlyRecapResponse

MONTH_NAMES = [
    "", "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
]

def get_calendar_month(db: Session, year: int, month: int, user: Optional[User]) -> CalendarMonthResponse:
    today_str = date.today().isoformat()
    _, num_days = calendar.monthrange(year, month)
    
    # Prefix for matching YYYY-MM
    month_prefix = f"{year:04d}-{month:02d}"
    
    # Query visits for this user in this month
    visits_by_date: Dict[str, List[Visit]] = {}
    if user:
        visits = db.query(Visit).filter(
            Visit.user_id == user.id,
            Visit.visit_date.startswith(month_prefix)
        ).all()
        for v in visits:
            v_date = v.visit_date
            if v_date not in visits_by_date:
                visits_by_date[v_date] = []
            visits_by_date[v_date].append(v)

    days: List[CalendarDaySummary] = []
    total_places = 0
    new_places = 0
    food_cnt = 0
    explore_cnt = 0
    events_cnt = 0

    for day_num in range(1, num_days + 1):
        day_str = f"{year:04d}-{month:02d}-{day_num:02d}"
        day_visits = visits_by_date.get(day_str, [])
        is_explored = len(day_visits) > 0

        activities: List[CalendarDayActivity] = []
        for v in day_visits:
            total_places += 1
            if v.is_new_discovery: new_places += 1
            if v.item_type == "food": food_cnt += 1
            elif v.item_type == "explore": explore_cnt += 1
            elif v.item_type == "event": events_cnt += 1

            activities.append(CalendarDayActivity(
                item_id=v.item_id,
                item_type=v.item_type,
                place_name=v.place_name or "Discovered Spot",
                category=v.category or "Explore",
                area=v.area or "Warangal",
                time=v.visited_at.strftime("%I:%M %p") if v.visited_at else "Daytime",
                is_new=v.is_new_discovery
            ))

        days.append(CalendarDaySummary(
            date=day_str,
            day_number=day_num,
            is_today=(day_str == today_str),
            is_explored=is_explored,
            visit_count=len(day_visits),
            activities=activities
        ))

    explored_days_count = sum(1 for d in days if d.is_explored)

    return CalendarMonthResponse(
        year=year,
        month=month,
        month_name=MONTH_NAMES[month],
        days=days,
        total_explored_days=explored_days_count,
        total_places_explored=total_places,
        new_places_count=new_places,
        food_count=food_cnt,
        explore_count=explore_cnt,
        events_count=events_cnt
    )

def get_monthly_recap(db: Session, month_str: str, user: User) -> MonthlyRecapResponse:
    # month_str e.g. "2026-08" or "2026-09"
    y, m = map(int, month_str.split("-"))
    m_name = MONTH_NAMES[m]

    visits = db.query(Visit).filter(
        Visit.user_id == user.id,
        Visit.visit_date.startswith(month_str)
    ).all()

    unique_dates = set(v.visit_date for v in visits)
    new_disc = [v for v in visits if v.is_new_discovery]

    # Category breakdown
    cat_counts = {}
    for v in visits:
        c = v.category or "General"
        cat_counts[c] = cat_counts.get(c, 0) + 1
    top_cats = [{"category": k, "count": v} for k, v in sorted(cat_counts.items(), key=lambda x: x[1], reverse=True)[:4]]

    places_visited_data = []
    for v in visits[:8]:
        places_visited_data.append({
            "name": v.place_name,
            "category": v.category,
            "area": v.area,
            "item_type": v.item_type,
            "visits": v.visit_count
        })

    new_discoveries_data = []
    for v in new_disc[:5]:
        new_discoveries_data.append({
            "name": v.place_name,
            "category": v.category,
            "area": v.area
        })

    # Forward-looking recommendations (places never visited)
    visited_ids = set((v.item_type, v.item_id) for v in db.query(Visit).filter(Visit.user_id == user.id).all())
    unvisited_food = db.query(FoodPlace).filter(FoodPlace.rating >= 4.3).all()
    unvisited_explore = db.query(ExplorePlace).filter(ExplorePlace.rating >= 4.4).all()
    
    rec_next = []
    for f in unvisited_food:
        if ("food", f.id) not in visited_ids:
            rec_next.append({"name": f.name, "category": f.category, "area": f.area, "tag": "Just opened / Top Rated", "type": "food"})
            if len(rec_next) >= 2: break
            
    for e in unvisited_explore:
        if ("explore", e.id) not in visited_ids:
            rec_next.append({"name": e.name, "category": e.category, "area": e.area, "tag": "You haven't been here yet", "type": "explore"})
            if len(rec_next) >= 4: break

    # Check if recap was viewed
    recap_record = db.query(MonthlyRecap).filter(
        MonthlyRecap.user_id == user.id,
        MonthlyRecap.month == month_str
    ).first()
    seen = recap_record is not None and recap_record.viewed_at is not None

    headline = "Look at you. You actually went places!" if len(visits) > 0 else "A quiet month. Let's make the next one epic!"

    return MonthlyRecapResponse(
        month=month_str,
        month_name=m_name,
        user_name=user.name,
        headline=headline,
        explored_days_count=len(unique_dates),
        total_places_count=len(visits),
        new_discoveries_count=len(new_disc),
        top_categories=top_cats,
        places_visited=places_visited_data,
        new_discoveries=new_discoveries_data,
        next_month_recommendations=rec_next,
        seen=seen
    )
