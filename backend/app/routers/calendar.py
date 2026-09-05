from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models import User, MonthlyRecap
from backend.app.schemas import CalendarMonthResponse, MonthlyRecapResponse
from backend.app.services.auth_service import get_optional_user, get_current_user
from backend.app.services.calendar_service import get_calendar_month, get_monthly_recap

router = APIRouter(tags=["Calendar & Recaps"])

@router.get("/calendar/{year}/{month}", response_model=CalendarMonthResponse)
def get_month_calendar(
    year: int,
    month: int,
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_optional_user)
):
    return get_calendar_month(db=db, year=year, month=month, user=user)

@router.get("/recaps/{month}", response_model=MonthlyRecapResponse)
def get_recap(
    month: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    return get_monthly_recap(db=db, month_str=month, user=user)

@router.post("/recaps/{month}/seen")
def mark_recap_seen(
    month: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    recap = db.query(MonthlyRecap).filter(
        MonthlyRecap.user_id == user.id,
        MonthlyRecap.month == month
    ).first()
    if not recap:
        recap = MonthlyRecap(
            user_id=user.id,
            month=month,
            recap_data="{}",
            viewed_at=datetime.utcnow()
        )
        db.add(recap)
    else:
        recap.viewed_at = datetime.utcnow()
    db.commit()
    return {"message": "Monthly recap marked as seen"}
