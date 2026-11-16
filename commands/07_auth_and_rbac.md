# Phase 07: Authentication & Authorization (RBAC)

## 1. Objectives
- Implement secure password hashing with Bcrypt and JWT token lifecycle.
- Implement login endpoint (`/api/v1/auth/login`) and current user endpoint (`/api/v1/auth/me`).
- Create Role-Based Access Control (RBAC) dependency guards for `ADMIN`, `HR_RECRUITER`, and `HR_MANAGER`.

## 2. Implementation Commands & Source Files
Run the following PowerShell commands:

```powershell
# 1. Create core/security.py
Set-Content -Path "backend\app\core\security.py" -Value @"
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db
from app.models.entities import User

pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')
oauth2_scheme = OAuth2PasswordBearer(tokenUrl='/api/v1/auth/login')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({'exp': expire})
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail='Could not validate credentials',
        headers={'WWW-Authenticate': 'Bearer'},
    )
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        user_id: str = payload.get('sub')
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.id == user_id).first()
    if user is None or user.status != 'ACTIVE':
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='User inactive or deleted')
    return user

def require_roles(allowed_roles: list[str]):
    def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role.role_name not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f'Access denied. Required roles: {allowed_roles}'
            )
        return current_user
    return role_checker
"@

# 2. Create schemas/auth.py
Set-Content -Path "backend\app\schemas\auth.py" -Value @"
from pydantic import BaseModel, EmailStr
from typing import Optional

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = 'bearer'
    user_id: str
    name: str
    email: str
    role: str

class UserProfileResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    status: str
"@

# 3. Create routes/auth.py
Set-Content -Path "backend\app\routes\auth.py" -Value @"
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_password, create_access_token, get_current_user
from app.models.entities import User
from app.schemas.auth import LoginRequest, TokenResponse, UserProfileResponse

router = APIRouter(prefix='/api/v1/auth', tags=['Authentication'])

@router.post('/login', response_model=TokenResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()
    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Incorrect email or password'
        )
    if user.status != 'ACTIVE':
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='User account is disabled')

    access_token = create_access_token(data={'sub': user.id, 'role': user.role.role_name})
    return {
        'access_token': access_token,
        'token_type': 'bearer',
        'user_id': user.id,
        'name': user.name,
        'email': user.email,
        'role': user.role.role_name
    }

@router.get('/me', response_model=UserProfileResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return {
        'id': current_user.id,
        'name': current_user.name,
        'email': current_user.email,
        'role': current_user.role.role_name,
        'status': current_user.status
    }
"@
```

## 3. Register Auth Router in `app/main.py`
Add to `backend/app/main.py`:
```python
from app.routes.auth import router as auth_router
app.include_router(auth_router)
```

## 4. Test Verification Commands
```powershell
# 1. Run seed script to generate database & admin user
python backend/app/core/seed.py

# 2. Test Login API with PowerShell
$loginBody = @{
    email = "admin@talentbridge.com"
    password = "Admin@12345"
} | ConvertTo-Json

$response = Invoke-RestMethod -Method Post -Uri "http://127.0.0.1:8000/api/v1/auth/login" -ContentType "application/json" -Body $loginBody
$token = $response.access_token
Write-Host "Received Token: $token"

# 3. Test /me Protected Route with Bearer Token
$headers = @{ Authorization = "Bearer $token" }
Invoke-RestMethod -Method Get -Uri "http://127.0.0.1:8000/api/v1/auth/me" -Headers $headers
```

## 5. Phase 07 Acceptance Criteria Check
- [x] Login endpoint validates credentials and returns signed JWT token.
- [x] Protected `/api/v1/auth/me` validates token and returns user details with role.
- [x] Role-based dependency restrictions functioning.

