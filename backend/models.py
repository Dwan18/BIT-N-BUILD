"""SQLAlchemy models + Pydantic schemas — all in one file for hackathon simplicity."""

from __future__ import annotations
from datetime import datetime
from typing import Optional
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from pydantic import BaseModel

from database import Base


# ────────────────────────────────────────────
#  SQLAlchemy ORM models
# ────────────────────────────────────────────

class Event(Base):
    __tablename__ = "events"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    date = Column(String, nullable=False)  # "YYYY-MM-DD"
    venue = Column(String, default="")
    description = Column(Text, default="")
    status = Column(String, default="Draft")  # Draft | Ready | Live | Ended
    created_at = Column(DateTime, default=datetime.utcnow)

    activities = relationship("Activity", back_populates="event", cascade="all, delete-orphan")
    people = relationship("Person", back_populates="event", cascade="all, delete-orphan")
    announcements = relationship("Announcement", back_populates="event", cascade="all, delete-orphan")


class Activity(Base):
    __tablename__ = "activities"
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    title = Column(String, nullable=False)
    start_time = Column(String, nullable=False)  # "HH:MM"
    end_time = Column(String, nullable=False)     # "HH:MM"
    speaker = Column(String, default="")
    room = Column(String, default="")
    status = Column(String, default="Scheduled")  # Scheduled | Upcoming | InProgress | Completed | Cancelled | Postponed
    order_index = Column(Integer, default=0)
    delay_minutes = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    event = relationship("Event", back_populates="activities")


class Person(Base):
    __tablename__ = "people"
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    name = Column(String, nullable=False)
    role = Column(String, nullable=False)  # speaker | jury | coordinator
    designation = Column(String, default="")
    organization = Column(String, default="")
    topic = Column(String, default="")
    bio = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)

    event = relationship("Event", back_populates="people")


class Announcement(Base):
    __tablename__ = "announcements"
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    message = Column(Text, nullable=False)
    priority = Column(String, default="normal")  # normal | important | urgent
    created_by = Column(String, default="system")
    created_at = Column(DateTime, default=datetime.utcnow)

    event = relationship("Event", back_populates="announcements")


# ────────────────────────────────────────────
#  Pydantic schemas (request / response)
# ────────────────────────────────────────────

# --- Event ---
class EventCreate(BaseModel):
    name: str
    date: str
    venue: str = ""
    description: str = ""
    status: str = "Draft"

class EventUpdate(BaseModel):
    name: Optional[str] = None
    date: Optional[str] = None
    venue: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None

class EventOut(BaseModel):
    id: int
    name: str
    date: str
    venue: str
    description: str
    status: str
    created_at: datetime
    model_config = {"from_attributes": True}


# --- Activity ---
class ActivityCreate(BaseModel):
    event_id: int
    title: str
    start_time: str
    end_time: str
    speaker: str = ""
    room: str = ""
    status: str = "Scheduled"
    order_index: int = 0

class ActivityUpdate(BaseModel):
    title: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    speaker: Optional[str] = None
    room: Optional[str] = None
    status: Optional[str] = None
    order_index: Optional[int] = None

class ActivityOut(BaseModel):
    id: int
    event_id: int
    title: str
    start_time: str
    end_time: str
    speaker: str
    room: str
    status: str
    order_index: int
    delay_minutes: int
    created_at: datetime
    model_config = {"from_attributes": True}


# --- Person ---
class PersonCreate(BaseModel):
    event_id: int
    name: str
    role: str       # speaker | jury | coordinator
    designation: str = ""
    organization: str = ""
    topic: str = ""
    bio: str = ""

class PersonUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    designation: Optional[str] = None
    organization: Optional[str] = None
    topic: Optional[str] = None
    bio: Optional[str] = None

class PersonOut(BaseModel):
    id: int
    event_id: int
    name: str
    role: str
    designation: str
    organization: str
    topic: str
    bio: str
    created_at: datetime
    model_config = {"from_attributes": True}


# --- Announcement ---
class AnnouncementCreate(BaseModel):
    event_id: int
    message: str
    priority: str = "normal"
    created_by: str = "system"

class AnnouncementOut(BaseModel):
    id: int
    event_id: int
    message: str
    priority: str
    created_by: str
    created_at: datetime
    model_config = {"from_attributes": True}


# --- Live changes ---
class DelayReport(BaseModel):
    activity_id: int
    minutes: int
    reason: str = ""

class RoomChange(BaseModel):
    activity_id: int
    new_room: str

class TimeChange(BaseModel):
    activity_id: int
    new_start_time: str
    new_end_time: str


# --- Smart Script ---
class ScriptRequest(BaseModel):
    script_type: str          # opening, speaker_intro, transition, closing, delay_announcement, etc.
    event_name: str = ""
    current_activity: str = ""
    next_activity: str = ""
    speaker: str = ""
    schedule_change: str = ""
    target_seconds: int = 30

class ScriptResponse(BaseModel):
    script: str
    estimated_seconds: int
    note: str
