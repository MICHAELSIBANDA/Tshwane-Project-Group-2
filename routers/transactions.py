from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from sqlmodel import Session, select
from database import get_db
from models import Client, BusCard, BankCard, Transaction
from datetime import datetime
import random

#Sets up a new router, using the same /api/wallet prefix as your teammate's file, so all wallet-related endpoints stay grouped together in /docs
router = APIRouter(
    prefix="/api/wallet",
    tags=["Transactions"]
)

#data we expected when a client wants to link a bus card
class LinkBusCardRequest(BaseModel):
    contact: str

#data we expected when a client wants to link a bank card
class AddBankCardRequest(BaseModel):
    contact: str
    cardNumber: str
    cardHolderName: str
    expiryDate: str
    bankName: str = ""

#data we expected when a client wants to link a bank card
class TopUpRequest(BaseModel):
    contact: str
    bankCardId: int
    amount: float

#Creates a new endpoint at /api/wallet/link-card
@router.post("/link-card")
async def link_bus_card(data: LinkBusCardRequest, db: Session = Depends(get_db)):
    client = db.exec(select(Client).where(Client.Email == data.contact)).first()
    if not client:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Client not found.")

    existing_card = db.exec(select(BusCard).where(BusCard.ClientID == client.ClientID)).first()
    if existing_card:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Client already has a linked bus card.")

    card_number = str(random.randint(1000000000000000, 9999999999999999))
    new_card = BusCard(
        ClientID=client.ClientID,
        CardNumber=card_number,
        Balance=0.00
    )
    db.add(new_card)
    db.commit()
    db.refresh(new_card)

    return {
        "status": {"linked": True},
        "message": "Bus card linked successfully!",
        "cardNumber": new_card.CardNumber
    }
#Find client,Creates new BankCard,Saves and returns confirmatio
@router.post("/add-bank-card")
async def add_bank_card(data: AddBankCardRequest, db: Session = Depends(get_db)):
    client = db.exec(select(Client).where(Client.Email == data.contact)).first()
    if not client:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Client not found.")

    new_bank_card = BankCard(
        ClientID=client.ClientID,
        CardNumber=data.cardNumber,
        CardHolderName=data.cardHolderName,
        ExpiryDate=data.expiryDate,
        BankName=data.bankName
    )
    db.add(new_bank_card)
    db.commit()
    db.refresh(new_bank_card)

    return {
        "status": {"cardAdded": True},
        "message": "Bank card added successfully!",
        "bankCardId": new_bank_card.BankCardID
    }

@router.post("/topup")
async def top_up_balance(data: TopUpRequest, db: Session = Depends(get_db)):
    client = db.exec(select(Client).where(Client.Email == data.contact)).first()
    if not client:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Client not found.")

    bus_card = db.exec(select(BusCard).where(BusCard.ClientID == client.ClientID)).first()
    if not bus_card:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No linked bus card found for this client.")

    bank_card = db.exec(select(BankCard).where(BankCard.BankCardID == data.bankCardId, BankCard.ClientID == client.ClientID)).first()
    if not bank_card:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bank card not found for this client.")

    if data.amount <= 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Top-up amount must be greater than zero.")

    bus_card.Balance += data.amount # adds the top up amount to their existing bus card balance
    db.add(bus_card)

    new_transaction = Transaction(
        ClientID=client.ClientID,
        BusCardID=bus_card.BusCardID,
        BankCardID=bank_card.BankCardID,
        Amount=data.amount,
        Status="Successful",
        TransactionDate=datetime.utcnow()
    )
    db.add(new_transaction)
    db.commit()
    db.refresh(bus_card)
    db.refresh(new_transaction)

    return {
        "status": {"success": True},
        "message": f"Top-up successful! R{data.amount:.2f} added to your bus card.",
        "newBalance": float(bus_card.Balance),
        "transactionId": new_transaction.TransactionID
    }