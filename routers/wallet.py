from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from sqlmodel import Session, select
from database import engine
from models import Client, BusCard, Notification

router = APIRouter(
    prefix="/api/wallet",
    tags=["Wallet Dashboard"]
)

# Pydantic Schemas mapping directly to the React component variables
class WalletSnapshotMessage(BaseModel):
    title: str
    body: str
    tone: str  # Translates to status-info, status-success, status-warning

class WalletSnapshotResponse(BaseModel):
    formattedBalance: str
    progress: int
    message: WalletSnapshotMessage

@router.get("/snapshot", response_model=WalletSnapshotResponse)
async def get_wallet_snapshot(email: str):
    with Session(engine) as session:
        # 1. Fetch Client Profile from MySQL
        client_statement = select(Client).where(Client.Email == email)
        client = session.exec(client_statement).first()
        
        if not client:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="Client profile not found in system."
            )
            
        # 2. Fetch linked Bus Card details
        card_statement = select(BusCard).where(BusCard.ClientID == client.ClientID)
        bus_card = session.exec(card_statement).first()

        # Fallback values if no card exists yet
        raw_balance = bus_card.Balance if bus_card else 0.00
        formatted_balance = f"R {raw_balance:,.2f}"

        # 3. Dynamic layout milestone calculations mapping to React States
        if not client.IsVerified:
            progress_pct = 25
            msg_title = "Verification Required"
            msg_body = "Your client registration is pending. Please verify via the OTP sent to your contact details."
            msg_tone = "warning"
            
        elif client.IsVerified and not bus_card:
            progress_pct = 50
            msg_title = "Account Verified"
            msg_body = "Profile authenticated! Please link your transit bus card to get started."
            msg_tone = "info"
            
        elif bus_card and bus_card.Balance == 0.00:
            progress_pct = 75
            msg_title = "Card Linked Successfully"
            msg_body = "Your Tshwane Bus Card is active. Top up your wallet balance to start travelling."
            msg_tone = "info"
            
        else:
            progress_pct = 100
            msg_title = "Wallet Active"
            msg_body = "Your digital transit wallet is funded and ready for use at all terminal gates."
            msg_tone = "success"

        return WalletSnapshotResponse(
            formattedBalance=formatted_balance,
            progress=progress_pct,
            message=WalletSnapshotMessage(
                title=msg_title,
                body=msg_body,
                tone=msg_tone
            )
        )
