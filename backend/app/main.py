from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.database import engine, Base, SessionLocal
from backend.app.services.seeder import seed_database_from_excel
from backend.app.models import FoodPlace, ExplorePlace, EventItem
from backend.app.routers import auth, places, dice, planner, solo, visits, favorites, calendar, admin

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="DiceNGo — Dice & Go Warangal API",
    description="Backend API powering the retro-arcade city exploration companion for Warangal, Hanamkonda & Kazipet.",
    version="1.0.0"
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    db = SessionLocal()
    try:
        seed_database_from_excel(db)
    finally:
        db.close()

# Mount routers
app.include_router(auth.router)
app.include_router(places.router)
app.include_router(dice.router)
app.include_router(planner.router)
app.include_router(solo.router)
app.include_router(visits.router)
app.include_router(favorites.router)
app.include_router(calendar.router)
app.include_router(admin.router)

@app.get("/")
def root():
    db = SessionLocal()
    try:
        food_cnt = db.query(FoodPlace).count()
        explore_cnt = db.query(ExplorePlace).count()
        event_cnt = db.query(EventItem).count()
    finally:
        db.close()

    return {
        "app": "DiceNGo — Dice & Go Warangal",
        "tagline": "Stop Deciding. Let's Roll.",
        "status": "online",
        "dataset": {
            "food_places": food_cnt,
            "explore_places": explore_cnt,
            "events": event_cnt
        }
    }
