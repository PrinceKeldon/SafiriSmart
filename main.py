
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
import os
from dotenv import load_dotenv

# Routers
from routes.auth import router as auth_router
from routes.leads import router as leads_router
from routes.operators import router as operators_router
from routes.packages import router as packages_router
from routes.admin import router as admin_router
from routes.health import router as health_router
from routes.notes import router as notes_router

# Database setup
from database import create_tables

# Load environment variables
load_dotenv()

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI()

# CORS configuration
origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:8000",
    os.getenv("FRONTEND_URL"),
    os.getenv("ADMIN_URL")
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup event to create database tables
@app.on_event("startup")
async def startup_event():
    logger.info("Starting up and creating database tables...")
    create_tables()
    logger.info("Database tables created.")

# Include all existing routers
app.include_router(auth_router)
app.include_router(leads_router)
app.include_router(operators_router)
app.include_router(packages_router)
app.include_router(admin_router)
app.include_router(health_router)
app.include_router(notes_router)

# Add the new public operators router
from routes.public_operators import router as public_operators_router
app.include_router(public_operators_router)
