import os
from pydantic import BaseModel
from typing import Dict
from dotenv import load_dotenv

load_dotenv()

# =====================================================================
# 🟡 DATABASE PLACEHOLDER: UNCOMMENT THIS BLOCK WHEN SWITCHING TO MYSQL
# =====================================================================
# from sqlmodel import create_engine
# DATABASE_URL = os.getenv("DATABASE_URL", "mysql+pymysql://user:pass@host:3306/db")
# engine = create_engine(DATABASE_URL, pool_pre_ping=True)


# --- CURRENT WORKFLOW: Local In-Memory Mock Store ---
class MockUserRecord(BaseModel):
    firstName: str
    lastName: str
    contact: str
    idNumber: str
    otp: str = "246810"
    verified: bool = False
    balance: float = 0.0
    journey_progress: int = 0

# Acts as your global temporary user database table in RAM
MOCK_USER_DB: Dict[str, MockUserRecord] = {}
