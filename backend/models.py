from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime
from sqlalchemy.orm import relationship
import datetime
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    role = Column(String)
    department = Column(String)

class Asset(Base):
    __tablename__ = "assets"
    id = Column(String, primary_key=True, index=True)
    tag = Column(String, unique=True, index=True)
    name = Column(String)
    category = Column(String)
    location = Column(String)
    status = Column(String)
    condition = Column(String)
    isShared = Column(Boolean, default=False)
    qrCode = Column(String, nullable=True)

class Booking(Base):
    __tablename__ = "bookings"
    id = Column(String, primary_key=True, index=True)
    assetId = Column(String, ForeignKey("assets.id"))
    userId = Column(String, ForeignKey("users.id"))
    date = Column(String)
    startTime = Column(String)
    endTime = Column(String)
    status = Column(String)

class Maintenance(Base):
    __tablename__ = "maintenance"
    id = Column(String, primary_key=True, index=True)
    assetId = Column(String, ForeignKey("assets.id"))
    requestedBy = Column(String, ForeignKey("users.id"))
    issue = Column(String)
    priority = Column(String)
    status = Column(String)
    requestDate = Column(String)

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(String, primary_key=True, index=True)
    message = Column(String)
    date = Column(String)
