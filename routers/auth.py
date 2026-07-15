from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
from database import MOCK_USER_DB, MockUserRecord

router = APIRouter(
    prefix="/api",
    tags=["Authentication"]
)

class RegistrationRequest(BaseModel):
    firstName: str
    lastName: str
    contact: EmailStr
    idNumber: str
    otp: str = ""

@router.post("/register")
async def register_or_verify(data: RegistrationRequest):
    email_key = str(data.contact)

    # 1. Processing OTP Validation Submission
    if data.otp:
        # =================================================================
        # 🟡 DATABASE PLACEHOLDER: Replace this block with a MySQL SELECT query
        # =================================================================
        if email_key not in MOCK_USER_DB:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found.")
        
        user_record = MOCK_USER_DB[email_key]
        if data.otp != user_record.otp:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid OTP code.")
        
        # Updating memory state
        user_record.verified = True
        user_record.journey_progress = 50
        # =================================================================
        # 🟡 DATABASE PLACEHOLDER: Run session.add() and session.commit() here
        # =================================================================

        return {
            "status": {"registered": True, "verified": True},
            "message": "Profile successfully verified!"
        }

    # 2. Processing Initial Account Form Registration
    # =====================================================================
    # 🟡 DATABASE PLACEHOLDER: Check if user exists using a MySQL query here
    # =====================================================================
    if email_key in MOCK_USER_DB:
        user_record = MOCK_USER_DB[email_key]
        return {
            "status": {"registered": True, "verified": user_record.verified},
            "message": "Profile already exists. Complete verification."
        }

    # Creating a new account record
    MOCK_USER_DB[email_key] = MockUserRecord(
        firstName=data.firstName,
        lastName=data.lastName,
        contact=email_key,
        idNumber=data.idNumber,
        journey_progress=25
    )
    # =====================================================================
    # 🟡 DATABASE PLACEHOLDER: Instantiate UserProfile and session.commit() here
    # =====================================================================

    return {
        "status": {"registered": True, "verified": False},
        "message": "Registration received. OTP code generated."
    }
