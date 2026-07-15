from sqlmodel import Field, SQLModel
from typing import Optional

class UserProfile(SQLModel, table=True):
    __tablename__ = "user_profiles"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    firstName: str
    lastName: str
    contact: str = Field(unique=True, index=True, max_length=255) # Optimized for MySQL string index
    idNumber: str = Field(max_length=50)
    otp: str = Field(default="246810", max_length=10)
    verified: bool = False
    balance: float = Field(default=0.0)
    journey_progress: int = Field(default=0)
