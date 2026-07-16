from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr
from sqlmodel import Session, select
from datetime import datetime, timedelta
from database import get_db
from models import Client, OTP, BusCard

router = APIRouter(
    prefix="/api",
    tags=["Authentication Engine"]
)

class RegistrationRequest(BaseModel):
    firstName: str
    lastName: str
    contact: EmailStr
    idNumber: str
    otp: str = ""

@router.post("/register")
async def register_or_verify(data: RegistrationRequest, session: Session = Depends(get_db)):
    email_str = str(data.contact)

    # STEP 2: The client is submitting their OTP verification pin
    if data.otp:
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

    # STEP 1: The client is submitting registration details for the first time
    existing_stmt = select(Client).where(Client.Email == email_str)
    if session.exec(existing_stmt).first():
        return {"status": {"registered": True, "verified": False}, "message": "Profile already exists. Enter validation PIN."}

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
