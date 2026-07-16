from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
from fastapi import Depends
from passlib.context import CryptContext #Imports the tool we'll use to securely hash passwords, instead of storing them as plain readable text
from sqlmodel import Session, select
from database import get_db
from models import Client, OTP
import random #to help generate random digits

router = APIRouter(
    prefix="/api",
    tags=["Authentication"]
)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto") #

class RegistrationRequest(BaseModel):
    firstName: str
    lastName: str
    contact: EmailStr
    idNumber: str
    password: str
    phoneNumber: str = ""
    otp: str = ""
    #what we exect when user tries to login
class LoginRequest(BaseModel):
    contact: EmailStr
    password: str

@router.post("/register")
async def register_or_verify(data: RegistrationRequest,db: Session = Depends(get_db)):
    email_key = str(data.contact)

    # 1. Processing OTP Validation Submission
    if data.otp:
        existing_client = db.exec(select(Client).where(Client.Email == email_key)).first()
        if not existing_client:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found.")

        latest_otp = db.exec(
            select(OTP)
            .where(OTP.ClientID == existing_client.ClientID)
            .order_by(OTP.DateGenerated.desc()) #grabs most recently generated OTP, since a new one may have been created if retried.
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
    existing_client = db.exec(select(Client).where(Client.Email == email_key)).first() #If existing client hasn't verified yet, generate and save new OTP so they can try verification again even if they lost their first code
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
        Password=pwd_context.hash(data.password), #hides password
        PhoneNumber=data.phoneNumber
    )
    db.add(new_client)
    db.commit()
    db.refresh(new_client)

    otp_code = str(random.randint(100000, 999999)) #covert 6 digit number to string
    new_otp = OTP(ClientID=new_client.ClientID, OTPCode=otp_code) #creates a new OTP row, linked to the client we just created
    db.add(new_otp) #saves that OTP permanently into the OTP table
    db.commit()

    return {
        "status": {"registered": True, "verified": False},
        "message": "Registration received. OTP code generated."
    }

@router.post("/login")
async def login(data: LoginRequest, db: Session = Depends(get_db)):
    email_key = str(data.contact) #gets email user typed

    existing_client = db.exec(select(Client).where(Client.Email == email_key)).first()
    if not existing_client: #searches client table for user
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found.")

    if not pwd_context.verify(data.password, existing_client.Password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Incorrect password.")
    return {
        "status": {"loggedIn": True},
        "message": "Login successful!"
    }