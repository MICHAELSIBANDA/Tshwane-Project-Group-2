from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import wallet, auth, transactions
app = FastAPI(title="Tshwane Bus Services - API Management Dashboard")

# Configure Cross-Origin Resource Sharing (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Bind modular routers
app.include_router(wallet.router)
app.include_router(auth.router)
app.include_router(transactions.router)
