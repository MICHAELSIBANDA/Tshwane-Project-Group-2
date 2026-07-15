from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from database import MOCK_USER_DB

router = APIRouter(
    prefix="/api/wallet",
    tags=["Wallet"]
)

class WalletSnapshotMessage(BaseModel):
    title: str
    body: str
    tone: str

class WalletSnapshotResponse(BaseModel):
    formattedBalance: str
    progress: int
    message: WalletSnapshotMessage

@router.get("/snapshot", response_model=WalletSnapshotResponse)
async def get_wallet_snapshot(user_email: str):
    # =====================================================================
    # 🟡 DATABASE PLACEHOLDER: Query MySQL for user matching user_email here
    # =====================================================================
    if user_email not in MOCK_USER_DB:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User dashboard profile not found.")
        
    user = MOCK_USER_DB[user_email]
    formatted_balance = f"R {user.balance:,.2f}"
    
    # Calculate state details based on system progress milestones
    if not user.verified:
        msg_title, msg_body, msg_tone, progress_pct = "Account Pending Verification", "Enter OTP code.", "warning", 25
    elif user.verified and user.balance == 0.0:
        msg_title, msg_body, msg_tone, progress_pct = "Card Linked Successfully", "Top up your balance to start traveling.", "info", 50
    else:
        msg_title, msg_body, msg_tone, progress_pct = "Wallet Active", "Transit wallet funded and ready.", "success", 100

    user.journey_progress = progress_pct
    # =====================================================================
    # 🟡 DATABASE PLACEHOLDER: Update progress state in MySQL and session.commit()
    # =====================================================================

    return WalletSnapshotResponse(
        formattedBalance=formatted_balance,
        progress=user.journey_progress,
        message=WalletSnapshotMessage(title=msg_title, body=msg_body, tone=msg_tone)
    )
