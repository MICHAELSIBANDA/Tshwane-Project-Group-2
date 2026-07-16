import os
from sqlmodel import create_engine, Session
from dotenv import load_dotenv

load_dotenv()

# Match these string tokens perfectly with your MySQL Workbench config window
MYSQL_USER = os.getenv("DB_USER", "root")
MYSQL_HOST = os.getenv("DB_HOST", "localhost")
MYSQL_PORT = os.getenv("DB_PORT", "3306")
MYSQL_DB_NAME = os.getenv("DB_NAME", "tbs_db")

# ⚠️ Change "your_actual_root_password_here" to your true local MySQL password
MYSQL_PASSWORD = os.getenv("DB_PASSWORD", "Rea@dc#39")

DATABASE_URL = f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DB_NAME}"

# Instantiating the engine pool connection context
engine = create_engine(DATABASE_URL, pool_pre_ping=True)

def get_db():
    with Session(engine) as session:
        yield session
