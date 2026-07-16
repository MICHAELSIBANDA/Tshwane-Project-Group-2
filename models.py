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
