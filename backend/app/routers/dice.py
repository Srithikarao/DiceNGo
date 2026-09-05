from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models import User
from backend.app.schemas import DiceRollRequest, DiceRollResponse
from backend.app.services.auth_service import get_optional_user
from backend.app.services.dice_service import roll_dice

router = APIRouter(prefix="/dice", tags=["Dice & Go"])

@router.post("/roll", response_model=DiceRollResponse)
def handle_dice_roll(
    req: DiceRollRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_optional_user)
):
    result = roll_dice(
        db=db,
        mode=req.mode,
        user_lat=req.user_lat,
        user_lng=req.user_lng,
        user=user,
        allow_familiar=req.allow_familiar
    )
    return DiceRollResponse(**result)
