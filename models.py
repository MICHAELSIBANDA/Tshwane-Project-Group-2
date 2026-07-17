from sqlmodel import Field, SQLModel
from typing import Optional
from datetime import datetime

class Client(SQLModel, table=True):
    __tablename__ = "Client"
    
    ClientID: Optional[int] = Field(default=None, primary_key=True)
    FirstName: str
    LastName: str
    IDNumber: str = Field(max_length=13, unique=True)
    Email: str = Field(max_length=100, unique=True)
    Password: str
    PhoneNumber: Optional[str] = Field(default=None, max_length=15)
    IsVerified: bool = Field(default=False)
    DateRegistered: datetime = Field(default_factory=datetime.utcnow)

class BusCard(SQLModel, table=True):
    __tablename__ = "BusCard"
    
    BusCardID: Optional[int] = Field(default=None, primary_key=True)
    ClientID: int = Field(foreign_key="Client.ClientID")
    CardNumber: str = Field(max_length=20, unique=True)
    Balance: float = Field(default=0.00)
    DateIssued: Optional[datetime] = Field(default=None)

class Notification(SQLModel, table=True):
    __tablename__ = "Notification"
    
    NotificationID: Optional[int] = Field(default=None, primary_key=True)
    ClientID: int = Field(foreign_key="Client.ClientID")
    Type: str = Field(max_length=20)
    Message: str = Field(max_length=255)
    DateSent: datetime = Field(default_factory=datetime.utcnow)
    Status: str = Field(default="Sent", max_length=20)

class OTP(SQLModel, table=True):
    __tablename__ = "OTP"
    
    OTPID: Optional[int] = Field(default=None, primary_key=True)
    ClientID: int = Field(foreign_key="Client.ClientID")
    OTPCode: str = Field(max_length=6)
    DateGenerated: datetime = Field(default_factory=datetime.utcnow)
    IsUsed: bool = Field(default=False)

class BankCard(SQLModel, table=True):
    __tablename__ = "BankCard"
    
    BankCardID: Optional[int] = Field(default=None, primary_key=True)
    ClientID: int = Field(foreign_key="Client.ClientID")
    CardNumber: str = Field(max_length=20)
    CardHolderName: str = Field(max_length=100)
    ExpiryDate: str = Field(max_length=20)
    BankName: Optional[str] = Field(default=None, max_length=50)

class Transaction(SQLModel, table=True):
    __tablename__ = "Transaction"
    
    TransactionID: Optional[int] = Field(default=None, primary_key=True)
    ClientID: int = Field(foreign_key="Client.ClientID")
    BusCardID: int = Field(foreign_key="BusCard.BusCardID")
    BankCardID: int = Field(foreign_key="BankCard.BankCardID")
    Amount: float
    Status: str = Field(default="Pending", max_length=20)
    TransactionDate: datetime = Field(default_factory=datetime.utcnow) # a built-in Python function that returns the current date and time (standard global)