from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, wallet

app = FastAPI(title="Tshwane Bus Services API Backend")

# =====================================================================
# 🟡 DATABASE PLACEHOLDER: Add on_startup() block to create database tables
# =====================================================================
# from sqlmodel import SQLModel
# from database import engine
# @app.on_event("startup")
# def on_startup():
#     SQLModel.metadata.create_all(engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"], # Connects to Vite / CRA ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connects your independent route modules into the application map
app.include_router(auth.router)
app.include_router(wallet.router)
