import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .api import auth
from .api import memes, likes, galleries, users
from .database import init_db

UPLOAD_DIR = "static/uploads"

app = FastAPI(title="Memit API")

# CORS Settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development, allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup event to initialize DB and ensure upload directory exists
@app.on_event("startup")
def on_startup():
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    init_db()

# Serve uploaded images
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
def read_root():
    return {"message": "Welcome to Memit API", "status": "ok"}

# Include routers
app.include_router(auth.router)
app.include_router(memes.router)
app.include_router(likes.router)
app.include_router(galleries.router)
app.include_router(users.router)
