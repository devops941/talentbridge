from fastapi import APIRouter, Depends, HTTPException, status
from app.core.database import get_db
from app.core.security import verify_password, create_access_token, get_current_user
from app.schemas.auth import LoginRequest, TokenResponse, UserProfileResponse

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])

@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest, db = Depends(get_db)):
    user = db.users.find_one({"email": request.email})
    if not user or not verify_password(request.password, user.get("password_hash", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    if user.get("status") != "ACTIVE":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User account is disabled")

    user_id = str(user.get("id"))
    role_name = user.get("role", "HR_RECRUITER")
    access_token = create_access_token(data={"sub": user_id, "role": role_name})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user_id,
        "name": user.get("name", "User"),
        "email": user.get("email"),
        "role": role_name
    }

@router.get("/me", response_model=UserProfileResponse)
def get_current_user_profile(current_user: dict = Depends(get_current_user)):
    return {
        "id": str(current_user.get("id")),
        "name": current_user.get("name"),
        "email": current_user.get("email"),
        "role": current_user.get("role"),
        "status": current_user.get("status")
    }
