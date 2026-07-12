from pydantic import BaseModel
from typing import Optional, List

class AssetBase(BaseModel):
    tag: str
    name: str
    category: str
    location: str
    status: str
    condition: str
    isShared: bool = False
    qrCode: Optional[str] = None

class AssetCreate(AssetBase):
    id: str

class Asset(AssetBase):
    id: str
    class Config:
        from_attributes = True

class UserBase(BaseModel):
    name: str
    email: str
    role: str
    department: str

class UserCreate(UserBase):
    id: str

class User(UserBase):
    id: str
    class Config:
        from_attributes = True

class BookingBase(BaseModel):
    assetId: str
    userId: str
    date: str
    startTime: str
    endTime: str
    status: str

class BookingCreate(BookingBase):
    id: str

class Booking(BookingBase):
    id: str
    class Config:
        from_attributes = True

class MaintenanceBase(BaseModel):
    assetId: str
    requestedBy: str
    issue: str
    priority: str
    status: str
    requestDate: str

class MaintenanceCreate(MaintenanceBase):
    id: str

class Maintenance(MaintenanceBase):
    id: str
    class Config:
        from_attributes = True

class NotificationBase(BaseModel):
    message: str
    date: str

class NotificationCreate(NotificationBase):
    id: str

class Notification(NotificationBase):
    id: str
    class Config:
        from_attributes = True
