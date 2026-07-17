from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr, field_validator
from passlib.context import CryptContext
from sqlmodel import Session, select
from database import get_db, send_email
from models import Client, OTP
import random

router = APIRouter(
    prefix="/api",
    tags=["Authentication"]
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class RegistrationRequest(BaseModel):
    firstName: str
    lastName: str
    contact: EmailStr
    idNumber: str
    password: str
    phoneNumber: str = ""
    otp: str = ""

    @field_validator("idNumber")
    @classmethod
    def validate_id_number(cls, value):
        if not value.isdigit() or len(value) != 13:
            raise ValueError("ID number must be exactly 13 digits.")
        return value

    @field_validator("phoneNumber")
    @classmethod
    def validate_phone_number(cls, value):
        if value and (not value.isdigit() or len(value) != 10):
            raise ValueError("Phone number must be exactly 10 digits.")
        return value

class LoginRequest(BaseModel):
    contact: EmailStr
    password: str


@router.post("/register")
async def register_or_verify(data: RegistrationRequest, db: Session = Depends(get_db)):
    email_key = str(data.contact)

    # 1. Processing OTP Validation Submission
    if data.otp:
        existing_client = db.exec(select(Client).where(Client.Email == email_key)).first()
        if not existing_client:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found.")

        latest_otp = db.exec(
            select(OTP)
            .where(OTP.ClientID == existing_client.ClientID)
            .order_by(OTP.DateGenerated.desc())
        ).first()

        if not latest_otp or data.otp != latest_otp.OTPCode:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid OTP code.")

        existing_client.IsVerified = True
        latest_otp.IsUsed = True
        db.add(existing_client)
        db.add(latest_otp)
        db.commit()

        return {
            "status": {"registered": True, "verified": True},
            "message": "Profile successfully verified!"
        }

    # 2. Processing Initial Account Form Registration
    existing_client = db.exec(select(Client).where(Client.Email == email_key)).first()
    if existing_client:
        if not existing_client.IsVerified:
            otp_code = str(random.randint(100000, 999999))
            new_otp = OTP(ClientID=existing_client.ClientID, OTPCode=otp_code)
            db.add(new_otp)
            db.commit()

        return {
            "status": {"registered": True, "verified": existing_client.IsVerified},
            "message": "Profile already exists. Complete verification."
        }

    # Creating a new account record
    new_client = Client(
        FirstName=data.firstName,
        LastName=data.lastName,
        Email=email_key,
        IDNumber=data.idNumber,
        Password=pwd_context.hash(data.password),
        PhoneNumber=data.phoneNumber
    )
    db.add(new_client)
    db.commit()
    db.refresh(new_client)

    otp_code = str(random.randint(100000, 999999))
    new_otp = OTP(ClientID=new_client.ClientID, OTPCode=otp_code)
    db.add(new_otp)
    db.commit()
    send_email(
        to_address=email_key,
        subject="Your Tshwane Bus Services OTP",
        body=f"Hi {data.firstName},\n\nYour OTP code is: {otp_code}\n\nUse this to verify your account."
    )

    return {
        "status": {"registered": True, "verified": False},
        "message": "Registration received. OTP code generated."
    }


@router.post("/login")
async def login(data: LoginRequest, db: Session = Depends(get_db)):
    email_key = str(data.contact)

    existing_client = db.exec(select(Client).where(Client.Email == email_key)).first()
    if not existing_client:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found.")

    if not pwd_context.verify(data.password, existing_client.Password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Incorrect password.")

    return {
        "status": {"loggedIn": True},
        "message": "Login successful!"
    }