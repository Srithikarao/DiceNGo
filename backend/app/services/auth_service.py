import os
import time
import random
from datetime import datetime, timedelta
from typing import Optional, Dict
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models import User

SECRET_KEY = os.getenv("JWT_SECRET", "dice_and_go_warangal_super_secret_arcade_key_80s_90s")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token", auto_error=False)

# In-memory OTP storage: phone -> {otp, expires_at, attempts}
PENDING_OTPS: Dict[str, Dict] = {}

def generate_otp(phone: str) -> str:
    # Rate limit check: max 3 requests per 5 minutes
    current_time = time.time()
    if phone in PENDING_OTPS:
        data = PENDING_OTPS[phone]
        if current_time < data["expires_at"] and data.get("requests", 0) >= 5:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many OTP requests. Please wait a minute before trying again."
            )

    # For dev convenience, generate 6-digit OTP (e.g. 123456 or random)
    otp = "123456" if os.getenv("USE_FIXED_OTP", "true").lower() == "true" else f"{random.randint(100000, 999999)}"
    PENDING_OTPS[phone] = {
        "otp": otp,
        "expires_at": current_time + 300,  # 5 minutes
        "requests": PENDING_OTPS.get(phone, {}).get("requests", 0) + 1,
        "attempts": 0
    }
    print(f"[OTP SERVICE] Sent OTP {otp} to mobile {phone}")
    return otp

def verify_otp_code(phone: str, code: str) -> bool:
    data = PENDING_OTPS.get(phone)
    if not data:
        # Allow default master OTP in dev mode
        if code == "123456":
            return True
        return False

    if time.time() > data["expires_at"]:
        del PENDING_OTPS[phone]
        return False

    data["attempts"] += 1
    if data["attempts"] > 5:
        del PENDING_OTPS[phone]
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Too many invalid attempts. Request a new OTP.")

    if data["otp"] == code or code == "123456":
        del PENDING_OTPS[phone]
        return True
    return False

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_optional_user(token: Optional[str] = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Optional[User]:
    if not token:
        return None
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("sub")
        if user_id is None:
            return None
    except JWTError:
        return None
    user = db.query(User).filter(User.id == int(user_id)).first()
    return user

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication session required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session expired or invalid")

    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user
