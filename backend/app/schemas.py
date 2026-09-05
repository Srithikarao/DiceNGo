from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field
import datetime

# --- AUTH SCHEMAS ---
class SendOtpRequest(BaseModel):
    phone: str = Field(..., description="10-digit Indian mobile number")
    name: Optional[str] = Field(None, description="User's name")

class SendOtpResponse(BaseModel):
    message: str
    phone: str
    is_dev: bool = True
    dev_otp: Optional[str] = None

class VerifyOtpRequest(BaseModel):
    phone: str
    otp: str
    name: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

class DemoLoginRequest(BaseModel):
    name: str = "Warangal Explorer"
    phone: str = "9876543210"

class UserResponse(BaseModel):
    id: int
    name: str
    phone: str
    verified: bool
    created_at: datetime.datetime
    preferences: Optional[str] = "{}"

    class Config:
        from_attributes = True

# --- PLACE SCHEMAS ---
class FoodPlaceBase(BaseModel):
    name: str
    category: str
    cuisine: Optional[str] = None
    address: Optional[str] = None
    area: Optional[str] = None
    latitude: float
    longitude: float
    maps_url: Optional[str] = None
    opening_time: Optional[str] = None
    closing_time: Optional[str] = None
    rating: float = 4.0
    review_count: int = 0
    price_range: Optional[str] = None
    best_known_for: Optional[str] = None
    veg: bool = True
    non_veg: bool = False
    indoor_seating: bool = True
    outdoor_seating: bool = False
    parking: bool = True
    discounts: Optional[str] = "None"
    seating_capacity: int = 40
    instagram_url: Optional[str] = None
    images: Optional[str] = None
    description: Optional[str] = None
    is_new: bool = False
    is_featured: bool = False

class FoodPlaceCreate(FoodPlaceBase):
    pass

class FoodPlaceResponse(FoodPlaceBase):
    id: int
    created_at: Optional[datetime.datetime] = None
    is_favorite: bool = False
    is_visited: bool = False
    visit_count: int = 0
    distance_km: Optional[float] = None
    is_open_now: Optional[bool] = None

    class Config:
        from_attributes = True

class ExplorePlaceBase(BaseModel):
    name: str
    category: str
    address: Optional[str] = None
    area: Optional[str] = None
    latitude: float
    longitude: float
    maps_url: Optional[str] = None
    best_time: Optional[str] = None
    entry_fee: Optional[str] = None
    opening_time: Optional[str] = None
    closing_time: Optional[str] = None
    rating: float = 4.0
    review_count: int = 0
    parking: bool = True
    friends_suitable: bool = True
    family_suitable: bool = True
    images: Optional[str] = None
    description: Optional[str] = None
    is_new: bool = False
    is_featured: bool = False

class ExplorePlaceCreate(ExplorePlaceBase):
    pass

class ExplorePlaceResponse(ExplorePlaceBase):
    id: int
    created_at: Optional[datetime.datetime] = None
    is_favorite: bool = False
    is_visited: bool = False
    visit_count: int = 0
    distance_km: Optional[float] = None

    class Config:
        from_attributes = True

class EventItemBase(BaseModel):
    event_name: str
    venue: Optional[str] = None
    category: str
    address: Optional[str] = None
    area: Optional[str] = None
    latitude: float
    longitude: float
    date: str
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    individual_or_group: Optional[str] = None
    contact: Optional[str] = None
    maps_url: Optional[str] = None
    instagram_url: Optional[str] = None
    website_url: Optional[str] = None
    fee: Optional[str] = None
    rating: float = 4.5
    reviews: int = 0
    images: Optional[str] = None
    description: Optional[str] = None
    booking_information: Optional[str] = None
    is_featured: bool = False

class EventItemCreate(EventItemBase):
    pass

class EventItemResponse(EventItemBase):
    id: int
    created_at: Optional[datetime.datetime] = None
    is_favorite: bool = False
    is_visited: bool = False
    time_bucket: Optional[str] = "This Week"

    class Config:
        from_attributes = True

# --- FAVORITE & VISIT SCHEMAS ---
class FavoriteCreate(BaseModel):
    item_id: int
    item_type: str  # 'food', 'explore', 'event'

class FavoriteResponse(BaseModel):
    id: int
    item_id: int
    item_type: str
    item_details: Optional[Dict[str, Any]] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class VisitCreate(BaseModel):
    item_id: int
    item_type: str  # 'food', 'explore', 'event'
    discovery_source: Optional[str] = "Direct"  # 'Dice & Go', 'AI Planner', 'Mission', 'Solo', 'Challenge'
    notes: Optional[str] = None
    visited_at: Optional[datetime.datetime] = None

class VisitResponse(BaseModel):
    id: int
    item_id: int
    item_type: str
    place_name: Optional[str] = None
    category: Optional[str] = None
    area: Optional[str] = None
    visit_date: str
    visit_count: int
    discovery_source: str
    is_new_discovery: bool
    notes: Optional[str] = None

    class Config:
        from_attributes = True

# --- DICE & RANDOMIZER SCHEMAS ---
class DiceRollRequest(BaseModel):
    mode: str = "Food"  # 'Food', 'Explore', 'Events', 'Surprise Me'
    user_lat: Optional[float] = None
    user_lng: Optional[float] = None
    budget_level: Optional[str] = None
    allow_familiar: bool = False

class DiceRollResponse(BaseModel):
    selected_place: Dict[str, Any]
    place_type: str
    why_selected: str
    distance_km: Optional[float] = None
    estimated_cost: str
    punchline: str

# --- AI PLANNER SCHEMAS ---
class PlannerRequest(BaseModel):
    situation: str
    group_size: int = 1
    budget_per_person: Optional[int] = 500
    vibe: Optional[str] = "Chill"  # Chill, Foodie, Adventure, Peaceful, Crazy, Something new
    duration_hours: Optional[int] = 4
    max_distance_km: Optional[float] = 10.0
    user_lat: Optional[float] = 18.0073
    user_lng: Optional[float] = 79.5668

class ItineraryStop(BaseModel):
    time: str
    type: str  # cafe, explore, dinner, event
    name: str
    item_id: int
    category: str
    area: str
    estimated_cost_per_person: int
    description: str
    why_selected: str
    maps_url: Optional[str] = None
    image: Optional[str] = None

class PlannerResponse(BaseModel):
    itinerary_title: str
    summary_message: str
    stops: List[ItineraryStop]
    total_cost_per_person: int
    total_group_cost: int
    remaining_budget_per_person: int
    estimated_travel_cost: int
    total_distance_km: float

# --- CHALLENGE SCHEMAS ---
class ChallengeRequest(BaseModel):
    budget_limit: int = 500
    group_type: str = "Friends"  # Solo, Friends, Couple, Family
    user_lat: Optional[float] = None
    user_lng: Optional[float] = None

class ChallengeResponse(BaseModel):
    challenge_title: str
    tagline: str
    budget_limit: int
    total_estimated_spend: int
    remaining_balance: int
    stops: List[Dict[str, Any]]
    status_comment: str

# --- CALENDAR & RECAP SCHEMAS ---
class CalendarDayActivity(BaseModel):
    item_id: int
    item_type: str
    place_name: str
    category: str
    area: str
    time: str
    is_new: bool

class CalendarDaySummary(BaseModel):
    date: str  # YYYY-MM-DD
    day_number: int
    is_today: bool
    is_explored: bool
    visit_count: int
    activities: List[CalendarDayActivity] = []

class CalendarMonthResponse(BaseModel):
    year: int
    month: int
    month_name: str
    days: List[CalendarDaySummary]
    total_explored_days: int
    total_places_explored: int
    new_places_count: int
    food_count: int
    explore_count: int
    events_count: int

class MonthlyRecapResponse(BaseModel):
    month: str
    month_name: str
    user_name: str
    headline: str
    explored_days_count: int
    total_places_count: int
    new_discoveries_count: int
    top_categories: List[Dict[str, Any]]
    places_visited: List[Dict[str, Any]]
    new_discoveries: List[Dict[str, Any]]
    next_month_recommendations: List[Dict[str, Any]]
    seen: bool
