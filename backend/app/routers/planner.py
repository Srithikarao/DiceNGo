from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models import User
from backend.app.schemas import PlannerRequest, PlannerResponse, ChallengeRequest, ChallengeResponse
from backend.app.services.auth_service import get_optional_user
from backend.app.services.planner_service import generate_itinerary
from backend.app.services.challenge_service import generate_budget_challenge

router = APIRouter(tags=["Planning & Challenges"])

@router.post("/planner/generate", response_model=PlannerResponse)
def plan_outing(
    req: PlannerRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_optional_user)
):
    return generate_itinerary(db=db, req=req, user=user)

@router.post("/challenge/plan", response_model=ChallengeResponse)
def take_challenge(
    req: ChallengeRequest,
    db: Session = Depends(get_db)
):
    return generate_budget_challenge(db=db, req=req)
