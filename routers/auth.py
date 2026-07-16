import random
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from sqlmodel import Session, select
from database import get_db
from models import Client, OTP, BusCard

router = APIRouter(
    prefix="/api",
    tags=["Authentication Engine"]
)

# Password hashing configuration instance context setup
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# --- REQUEST VALIDATION SCHEMAS ---
class RegistrationRequest(BaseModel):
    firstName: str
    lastName: str
    contact: EmailStr
    idNumber: str
    password: str
    phoneNumber: str = ""
    otp: str = ""

class LoginRequest(BaseModel):
    contact: EmailStr
    password: str


# --- ROUTE 1: CLIENT REGISTRATION & VERIFICATION ---
@router.post("/register")
async def register_or_verify(data: RegistrationRequest, session: Session = Depends(get_db)):
    email_str = str(data.contact)

    # STEP 2: The client is submitting their OTP verification pin
    if data.otp:
        client_stmt = select(Client).where(Client.Email == email_str)
        client = session.exec(client_stmt).first()
        
        if not client:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Client account not found.")
            
        # Verify unused tokens attached to the user record inside your OTP schema table
        otp_stmt = select(OTP).where(OTP.ClientID == client.ClientID, OTP.IsUsed == False).order_by(OTP.DateGenerated.desc())
        active_otp = session.exec(otp_stmt).first()
        
        if not active_otp or data.otp != active_otp.OTPCode:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid verification credentials.")
            
        # Flip verification configurations in MySQL
        client.IsVerified = True
        active_otp.IsUsed = True
        session.add(client)
        session.add(active_otp)
        
        # Generate card format like 'AY-4829-3310' to match your frontend mock text!
        generated_card_no = f"AY-{random.randint(1000, 9999)}-{random.randint(1000, 9999)}"
        
        # Instantiate a brand new default bus card row for this client
        new_card = BusCard(
            ClientID=client.ClientID, 
            CardNumber=generated_card_no, 
            Balance=0.00,
            DateIssued=datetime.utcnow()
        )
        session.add(new_card)
        session.commit()
        
        return {
            "status": {"registered": True, "verified": True}, 
            "message": f"Profile verified! Your new Tshwane Bus Card number is: {generated_card_no}. Use OTP 246810 as your default PIN to login."
        }

    # STEP 1: The client is submitting registration details for the first time
    existing_stmt = select(Client).where(Client.Email == email_str)
    existing_client = session.exec(existing_stmt).first()
    
    if existing_client:
        if not existing_client.IsVerified:
            # If they already exist but aren't verified, refresh their OTP record options cleanly
            otp_code = "246810" # Default testing PIN matching your React component layout string placeholders
            new_otp = OTP(
                ClientID=existing_client.ClientID, 
                OTPCode=otp_code, 
                ExpiryTime=datetime.utcnow() + timedelta(hours=1)
            )
            session.add(new_otp)
            session.commit()
            return {
                "status": {"registered": True, "verified": False}, 
                "message": "Profile already exists. A fresh demo validation PIN (246810) has been generated."
            }
        return {
            "status": {"registered": True, "verified": True}, 
            "message": "Profile already exists and is fully verified. Please proceed to the Login Page."
        }

    # Insert a fresh record block into your custom MySQL Client table securely hiding passwords
    new_client = Client(
        FirstName=data.firstName,
        LastName=data.lastName,
        Email=email_str,
        IDNumber=data.idNumber,
        Password=pwd_context.hash(data.password), # Securely encrypts passwords using BCrypt
        PhoneNumber=data.phoneNumber,
        IsVerified=False
    )
    session.add(new_client)
    session.commit()
    session.refresh(new_client)

    # Insert a standard associated temporary record row inside your OTP tracking schema
    new_otp = OTP(
        ClientID=new_client.ClientID, 
        OTPCode="246810", 
        ExpiryTime=datetime.utcnow() + timedelta(hours=1)
    )
    session.add(new_otp)
    session.commit()

    return {"status": {"registered": True, "verified": False}, "message": "Account created! Demo OTP: 246810 generated."}


# --- ROUTE 2: CLEAN CLIENT SECURE LOGIN ---
@router.post("/login")
async def login(data: LoginRequest, session: Session = Depends(get_db)):
    email_key = str(data.contact)
    
    # Query MySQL database instance to locate profile records matching emails
    existing_client = session.exec(select(Client).where(Client.Email == email_key)).first()
    if not existing_client:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile account matching address not found.")
        
    # Verify cryptographic password string hashes
    if not pwd_context.verify(data.password, existing_client.Password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Incorrect account password validation match.")
        
    return {
        "status": {"loggedIn": True}, 
        "message": f"Login successful! Welcome back, {existing_client.FirstName}.",
        "email": existing_client.Email
    }
