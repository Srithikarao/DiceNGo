from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models import User, Visit
from backend.app.schemas import (
    SendOtpRequest, SendOtpResponse, VerifyOtpRequest, TokenResponse,
    DemoLoginRequest, UserResponse
)
from backend.app.services.auth_service import (
    generate_otp, verify_otp_code, create_access_token, get_current_user
)

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/send-otp", response_model=SendOtpResponse)
def send_otp(req: SendOtpRequest, db: Session = Depends(get_db)):
    phone = req.phone.strip()
    if len(phone) < 10:
        raise HTTPException(status_code=400, detail="Please enter a valid 10-digit mobile number.")
    
    otp = generate_otp(phone)
    return SendOtpResponse(
        message=f"OTP sent successfully to {phone}",
        phone=phone,
        is_dev=True,
        dev_otp=otp
    )

@router.post("/verify-otp", response_model=TokenResponse)
def verify_otp(req: VerifyOtpRequest, db: Session = Depends(get_db)):
    phone = req.phone.strip()
    code = req.otp.strip()

    if not verify_otp_code(phone, code):
        raise HTTPException(status_code=400, detail="That code didn't work. Try again.")

    # Find or create user
    user = db.query(User).filter(User.phone == phone).first()
    if not user:
        name = req.name.strip() if req.name and req.name.strip() else f"Explorer_{phone[-4:]}"
        user = User(
            name=name,
            phone=phone,
            verified=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        user.verified = True
        if req.name and req.name.strip():
            user.name = req.name.strip()
        db.commit()

    token = create_access_token(data={"sub": str(user.id), "phone": user.phone})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user={
            "id": user.id,
            "name": user.name,
            "phone": user.phone,
            "verified": user.verified
        }
    )

@router.post("/demo-login", response_model=TokenResponse)
def demo_login(req: DemoLoginRequest, db: Session = Depends(get_db)):
    phone = req.phone.strip()
    user = db.query(User).filter(User.phone == phone).first()
    if not user:
        user = User(name=req.name, phone=phone, verified=True)
        db.add(user)
        db.commit()
        db.refresh(user)

    token = create_access_token(data={"sub": str(user.id), "phone": user.phone})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user={
            "id": user.id,
            "name": user.name,
            "phone": user.phone,
            "verified": user.verified
        }
    )

@router.get("/me")
def get_me(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    total_visits = db.query(Visit).filter(Visit.user_id == user.id).count()
    return {
        "id": user.id,
        "name": user.name,
        "phone": user.phone,
        "verified": user.verified,
        "created_at": user.created_at,
        "total_visits": total_visits
    }
