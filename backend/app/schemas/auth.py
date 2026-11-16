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
