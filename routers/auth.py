from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr
<<<<<<< HEAD
from fastapi import Depends
from passlib.context import CryptContext #Imports the tool we'll use to securely hash passwords, instead of storing them as plain readable text
from sqlmodel import Session, select
from database import get_db
from models import Client, OTP
import random #to help generate random digits
=======
from sqlmodel import Session, select
from datetime import datetime, timedelta
from database import get_db
from models import Client, OTP, BusCard
>>>>>>> 062fcd7b508c8bb20025940c464bdc062779b009

router = APIRouter(
    prefix="/api",
    tags=["Authentication Engine"]
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
<<<<<<< HEAD
async def register_or_verify(data: RegistrationRequest,db: Session = Depends(get_db)):
    email_key = str(data.contact)
=======
async def register_or_verify(data: RegistrationRequest, session: Session = Depends(get_db)):
    email_str = str(data.contact)
>>>>>>> 062fcd7b508c8bb20025940c464bdc062779b009

    # STEP 2: The client is submitting their OTP verification pin
    if data.otp:
<<<<<<< HEAD
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
=======
        client_stmt = select(Client).where(Client.Email == email_str)
        client = session.exec(client_stmt).first()
        
        if not client:
            raise HTTPException(status_code=404, detail="Client account not found.")
            
        # Verify unused tokens attached to the user record inside your OTP schema table
        otp_stmt = select(OTP).where(OTP.ClientID == client.ClientID, OTP.IsUsed == False)
        active_otp = session.exec(otp_stmt).first()
        
        if not active_otp or data.otp != active_otp.OTPCode:
            raise HTTPException(status_code=400, detail="Invalid verification credentials.")
            
        # Flip verification configurations in MySQL
        client.IsVerified = True
        active_otp.IsUsed = True
        session.add(client)
        session.add(active_otp)
        
        # Instantiate a brand new default bus card row for this client
        new_card = BusCard(ClientID=client.ClientID, CardNumber=f"TBS-{client.ClientID}877", Balance=0.00)
        session.add(new_card)
        
        session.commit()
        return {"status": {"registered": True, "verified": True}, "message": "Profile verified and saved to database!"}
>>>>>>> 062fcd7b508c8bb20025940c464bdc062779b009

    # STEP 1: The client is submitting registration details for the first time
    existing_stmt = select(Client).where(Client.Email == email_str)
    if session.exec(existing_stmt).first():
        return {"status": {"registered": True, "verified": False}, "message": "Profile already exists. Enter validation PIN."}

<<<<<<< HEAD
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
=======
    # Insert a fresh record block into your custom MySQL Client table
    new_client = Client(
        FirstName=data.firstName,
        LastName=data.lastName,
        Email=email_str,
        IDNumber=data.idNumber,
        Password="demo_hashed_password",
        IsVerified=False
    )
    session.add(new_client)
    session.commit()
    session.refresh(new_client)

    # Insert a standard associated temporary record row inside your OTP tracking schema
    new_otp = OTP(ClientID=new_client.ClientID, OTPCode="246810", ExpiryTime=datetime.utcnow() + timedelta(hours=1))
    session.add(new_otp)
    session.commit()

    return {"status": {"registered": True, "verified": False}, "message": "Account created! Demo OTP: 246810 generated."}
>>>>>>> 062fcd7b508c8bb20025940c464bdc062779b009
