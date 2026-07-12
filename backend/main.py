from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

import models, schemas
from database import engine, Base, get_db
import datetime

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="AssetFlow API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- USERS ---
@app.get("/api/users", response_model=List[schemas.User])
def read_users(db: Session = Depends(get_db)):
    return db.query(models.User).all()

@app.post("/api/users", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = models.User(**user.model_dump())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# --- ASSETS ---
@app.get("/api/assets", response_model=List[schemas.Asset])
def read_assets(db: Session = Depends(get_db)):
    return db.query(models.Asset).all()

@app.post("/api/assets", response_model=schemas.Asset)
def create_asset(asset: schemas.AssetCreate, db: Session = Depends(get_db)):
    db_asset = models.Asset(**asset.model_dump())
    db.add(db_asset)
    db.commit()
    db.refresh(db_asset)
    return db_asset

@app.put("/api/assets/{asset_id}", response_model=schemas.Asset)
def update_asset(asset_id: str, asset: schemas.AssetCreate, db: Session = Depends(get_db)):
    db_asset = db.query(models.Asset).filter(models.Asset.id == asset_id).first()
    if not db_asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    for key, value in asset.model_dump().items():
        setattr(db_asset, key, value)
    
    db.commit()
    db.refresh(db_asset)
    return db_asset

# --- BOOKINGS ---
@app.get("/api/bookings", response_model=List[schemas.Booking])
def read_bookings(db: Session = Depends(get_db)):
    return db.query(models.Booking).all()

@app.post("/api/bookings", response_model=schemas.Booking)
def create_booking(booking: schemas.BookingCreate, db: Session = Depends(get_db)):
    db_booking = models.Booking(**booking.model_dump())
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)
    return db_booking

@app.put("/api/bookings/{booking_id}", response_model=schemas.Booking)
def update_booking(booking_id: str, booking: schemas.BookingCreate, db: Session = Depends(get_db)):
    db_booking = db.query(models.Booking).filter(models.Booking.id == booking_id).first()
    if not db_booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    for key, value in booking.model_dump().items():
        setattr(db_booking, key, value)
    
    db.commit()
    db.refresh(db_booking)
    return db_booking

# --- MAINTENANCE ---
@app.get("/api/maintenance", response_model=List[schemas.Maintenance])
def read_maintenance(db: Session = Depends(get_db)):
    return db.query(models.Maintenance).all()

@app.post("/api/maintenance", response_model=schemas.Maintenance)
def create_maintenance(maintenance: schemas.MaintenanceCreate, db: Session = Depends(get_db)):
    db_maintenance = models.Maintenance(**maintenance.model_dump())
    db.add(db_maintenance)
    db.commit()
    db.refresh(db_maintenance)
    return db_maintenance

@app.put("/api/maintenance/{maintenance_id}", response_model=schemas.Maintenance)
def update_maintenance(maintenance_id: str, maintenance: schemas.MaintenanceCreate, db: Session = Depends(get_db)):
    db_maintenance = db.query(models.Maintenance).filter(models.Maintenance.id == maintenance_id).first()
    if not db_maintenance:
        raise HTTPException(status_code=404, detail="Maintenance request not found")
    
    for key, value in maintenance.model_dump().items():
        setattr(db_maintenance, key, value)
    
    db.commit()
    db.refresh(db_maintenance)
    return db_maintenance

# --- NOTIFICATIONS ---
@app.get("/api/notifications", response_model=List[schemas.Notification])
def read_notifications(db: Session = Depends(get_db)):
    return db.query(models.Notification).order_by(models.Notification.date.desc()).all()

@app.post("/api/notifications", response_model=schemas.Notification)
def create_notification(notification: schemas.NotificationCreate, db: Session = Depends(get_db)):
    db_notif = models.Notification(**notification.model_dump())
    db.add(db_notif)
    db.commit()
    db.refresh(db_notif)
    return db_notif

# Initialize DB with mock data if empty
@app.post("/api/init_db")
def init_db(db: Session = Depends(get_db)):
    if db.query(models.User).count() == 0:
        default_user = models.User(
            id="user1", 
            name="John Doe", 
            email="name@company.com", 
            role="Admin", 
            department="IT"
        )
        db.add(default_user)
        db.commit()
        return {"status": "Database initialized with default user"}
    return {"status": "Database already initialized"}
