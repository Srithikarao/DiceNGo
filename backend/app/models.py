import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    phone = Column(String(20), unique=True, index=True, nullable=False)
    verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    preferences = Column(Text, default="{}")  # JSON string

    favorites = relationship("Favorite", back_populates="user", cascade="all, delete-orphan")
    visits = relationship("Visit", back_populates="user", cascade="all, delete-orphan")
    recaps = relationship("MonthlyRecap", back_populates="user", cascade="all, delete-orphan")


class FoodPlace(Base):
    __tablename__ = "food_places"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), index=True, nullable=False)
    category = Column(String(50), index=True, nullable=False)
    cuisine = Column(String(100))
    address = Column(String(255))
    area = Column(String(80), index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    maps_url = Column(String(255))
    opening_time = Column(String(50))
    closing_time = Column(String(50))
    rating = Column(Float, default=4.0)
    review_count = Column(Integer, default=0)
    price_range = Column(String(50))
    best_known_for = Column(String(150))
    veg = Column(Boolean, default=True)
    non_veg = Column(Boolean, default=False)
    indoor_seating = Column(Boolean, default=True)
    outdoor_seating = Column(Boolean, default=False)
    parking = Column(Boolean, default=True)
    discounts = Column(String(100), default="None")
    seating_capacity = Column(Integer, default=40)
    instagram_url = Column(String(255))
    images = Column(Text)
    description = Column(Text)
    is_new = Column(Boolean, default=False)
    is_featured = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)


class ExplorePlace(Base):
    __tablename__ = "explore_places"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), index=True, nullable=False)
    category = Column(String(50), index=True, nullable=False)
    address = Column(String(255))
    area = Column(String(80), index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    maps_url = Column(String(255))
    best_time = Column(String(100))
    entry_fee = Column(String(50))
    opening_time = Column(String(50))
    closing_time = Column(String(50))
    rating = Column(Float, default=4.0)
    review_count = Column(Integer, default=0)
    parking = Column(Boolean, default=True)
    friends_suitable = Column(Boolean, default=True)
    family_suitable = Column(Boolean, default=True)
    images = Column(Text)
    description = Column(Text)
    is_new = Column(Boolean, default=False)
    is_featured = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)


class EventItem(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    event_name = Column(String(150), index=True, nullable=False)
    venue = Column(String(150))
    category = Column(String(50), index=True, nullable=False)
    address = Column(String(255))
    area = Column(String(80), index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    date = Column(String(30), index=True)  # YYYY-MM-DD
    start_time = Column(String(30))
    end_time = Column(String(30))
    individual_or_group = Column(String(50))
    contact = Column(String(100))
    maps_url = Column(String(255))
    instagram_url = Column(String(255))
    website_url = Column(String(255))
    fee = Column(String(80))
    rating = Column(Float, default=4.5)
    reviews = Column(Integer, default=0)
    images = Column(Text)
    description = Column(Text)
    booking_information = Column(Text)
    is_featured = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)


class Favorite(Base):
    __tablename__ = "favorites"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    item_id = Column(Integer, nullable=False)
    item_type = Column(String(20), nullable=False)  # 'food', 'explore', 'event'
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="favorites")


class Visit(Base):
    __tablename__ = "visits"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    item_id = Column(Integer, nullable=False)
    item_type = Column(String(20), nullable=False)  # 'food', 'explore', 'event'
    place_name = Column(String(150))
    category = Column(String(50))
    area = Column(String(80))
    visited_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    visit_date = Column(String(20), index=True)  # YYYY-MM-DD
    visit_count = Column(Integer, default=1)
    discovery_source = Column(String(50), default="Direct")  # 'Dice & Go', 'AI Planner', 'Mission', 'Solo', 'Challenge'
    is_new_discovery = Column(Boolean, default=True)
    notes = Column(Text, nullable=True)

    user = relationship("User", back_populates="visits")


class MonthlyRecap(Base):
    __tablename__ = "monthly_recaps"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    month = Column(String(20), nullable=False, index=True)  # YYYY-MM
    recap_data = Column(Text, nullable=False)  # JSON string
    viewed_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="recaps")


class DailyMission(Base):
    __tablename__ = "daily_missions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=False)
    mission_type = Column(String(50), default="Category")
    target_category = Column(String(50))
    target_count = Column(Integer, default=1)
    reward_points = Column(Integer, default=50)
    date = Column(String(20), index=True)
