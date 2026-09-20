"""EventSaathi — FastAPI Backend
Hackathon-friendly, single-file API server.
"""

import math
import random
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import engine, Base, get_db
from models import (
    # ORM
    Event, Activity, Person, Announcement,
    # Schemas
    EventCreate, EventUpdate, EventOut,
    ActivityCreate, ActivityUpdate, ActivityOut,
    PersonCreate, PersonUpdate, PersonOut,
    AnnouncementCreate, AnnouncementOut,
    DelayReport, RoomChange, TimeChange,
    ScriptRequest, ScriptResponse,
)

# ─── Create tables ──────────────────────────
Base.metadata.create_all(bind=engine)

# ─── App ────────────────────────────────────
app = FastAPI(title="EventSaathi API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ═══════════════════════════════════════════
#  EVENTS
# ═══════════════════════════════════════════

@app.post("/events", response_model=EventOut)
def create_event(data: EventCreate, db: Session = Depends(get_db)):
    ev = Event(**data.model_dump())
    db.add(ev)
    db.commit()
    db.refresh(ev)
    return ev


@app.get("/events", response_model=list[EventOut])
def list_events(db: Session = Depends(get_db)):
    return db.query(Event).all()


@app.get("/events/{event_id}", response_model=EventOut)
def get_event(event_id: int, db: Session = Depends(get_db)):
    ev = db.query(Event).filter(Event.id == event_id).first()
    if not ev:
        raise HTTPException(404, "Event not found")
    return ev


@app.put("/events/{event_id}", response_model=EventOut)
def update_event(event_id: int, data: EventUpdate, db: Session = Depends(get_db)):
    ev = db.query(Event).filter(Event.id == event_id).first()
    if not ev:
        raise HTTPException(404, "Event not found")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(ev, k, v)
    db.commit()
    db.refresh(ev)
    return ev


# ═══════════════════════════════════════════
#  ACTIVITIES / AGENDA
# ═══════════════════════════════════════════

@app.post("/activities", response_model=ActivityOut)
def create_activity(data: ActivityCreate, db: Session = Depends(get_db)):
    act = Activity(**data.model_dump())
    db.add(act)
    db.commit()
    db.refresh(act)
    return act


@app.get("/activities", response_model=list[ActivityOut])
def list_activities(event_id: int | None = None, db: Session = Depends(get_db)):
    q = db.query(Activity)
    if event_id is not None:
        q = q.filter(Activity.event_id == event_id)
    return q.order_by(Activity.order_index).all()


@app.get("/activities/{activity_id}", response_model=ActivityOut)
def get_activity(activity_id: int, db: Session = Depends(get_db)):
    act = db.query(Activity).filter(Activity.id == activity_id).first()
    if not act:
        raise HTTPException(404, "Activity not found")
    return act


@app.put("/activities/{activity_id}", response_model=ActivityOut)
def update_activity(activity_id: int, data: ActivityUpdate, db: Session = Depends(get_db)):
    act = db.query(Activity).filter(Activity.id == activity_id).first()
    if not act:
        raise HTTPException(404, "Activity not found")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(act, k, v)
    db.commit()
    db.refresh(act)
    return act


@app.delete("/activities/{activity_id}")
def delete_activity(activity_id: int, db: Session = Depends(get_db)):
    act = db.query(Activity).filter(Activity.id == activity_id).first()
    if not act:
        raise HTTPException(404, "Activity not found")
    db.delete(act)
    db.commit()
    return {"ok": True}


# ═══════════════════════════════════════════
#  PEOPLE (speakers, jury, coordinators)
# ═══════════════════════════════════════════

@app.post("/people", response_model=PersonOut)
def create_person(data: PersonCreate, db: Session = Depends(get_db)):
    p = Person(**data.model_dump())
    db.add(p)
    db.commit()
    db.refresh(p)
    return p


@app.get("/people", response_model=list[PersonOut])
def list_people(event_id: int | None = None, role: str | None = None, db: Session = Depends(get_db)):
    q = db.query(Person)
    if event_id is not None:
        q = q.filter(Person.event_id == event_id)
    if role:
        q = q.filter(Person.role == role)
    return q.all()


@app.get("/people/{person_id}", response_model=PersonOut)
def get_person(person_id: int, db: Session = Depends(get_db)):
    p = db.query(Person).filter(Person.id == person_id).first()
    if not p:
        raise HTTPException(404, "Person not found")
    return p


@app.put("/people/{person_id}", response_model=PersonOut)
def update_person(person_id: int, data: PersonUpdate, db: Session = Depends(get_db)):
    p = db.query(Person).filter(Person.id == person_id).first()
    if not p:
        raise HTTPException(404, "Person not found")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(p, k, v)
    db.commit()
    db.refresh(p)
    return p


@app.delete("/people/{person_id}")
def delete_person(person_id: int, db: Session = Depends(get_db)):
    p = db.query(Person).filter(Person.id == person_id).first()
    if not p:
        raise HTTPException(404, "Person not found")
    db.delete(p)
    db.commit()
    return {"ok": True}


# ═══════════════════════════════════════════
#  LIVE CHANGES
# ═══════════════════════════════════════════

def _add_minutes(time_str: str, mins: int) -> str:
    """Add minutes to an 'HH:MM' string. Pure Python, no AI."""
    h, m = map(int, time_str.split(":"))
    total = h * 60 + m + mins
    nh = (total // 60) % 24
    nm = total % 60
    return f"{nh:02d}:{nm:02d}"


@app.post("/live/delay")
def report_delay(data: DelayReport, db: Session = Depends(get_db)):
    """Report a delay — shifts this activity and all subsequent ones forward."""
    act = db.query(Activity).filter(Activity.id == data.activity_id).first()
    if not act:
        raise HTTPException(404, "Activity not found")

    # Get all activities for the same event at or after this one
    subsequent = (
        db.query(Activity)
        .filter(Activity.event_id == act.event_id, Activity.order_index >= act.order_index)
        .filter(Activity.status.notin_(["Completed", "Cancelled"]))
        .order_by(Activity.order_index)
        .all()
    )
    updated_ids = []
    for a in subsequent:
        a.start_time = _add_minutes(a.start_time, data.minutes)
        a.end_time = _add_minutes(a.end_time, data.minutes)
        a.delay_minutes = (a.delay_minutes or 0) + data.minutes
        updated_ids.append(a.id)
    db.commit()
    return {"ok": True, "updated_activity_ids": updated_ids, "delay_minutes": data.minutes}


@app.post("/live/change-time")
def change_activity_time(data: TimeChange, db: Session = Depends(get_db)):
    act = db.query(Activity).filter(Activity.id == data.activity_id).first()
    if not act:
        raise HTTPException(404, "Activity not found")
    act.start_time = data.new_start_time
    act.end_time = data.new_end_time
    db.commit()
    db.refresh(act)
    return ActivityOut.model_validate(act)


@app.post("/live/change-room")
def change_room(data: RoomChange, db: Session = Depends(get_db)):
    act = db.query(Activity).filter(Activity.id == data.activity_id).first()
    if not act:
        raise HTTPException(404, "Activity not found")
    act.room = data.new_room
    db.commit()
    db.refresh(act)
    return ActivityOut.model_validate(act)


@app.post("/live/cancel/{activity_id}")
def cancel_activity(activity_id: int, db: Session = Depends(get_db)):
    act = db.query(Activity).filter(Activity.id == activity_id).first()
    if not act:
        raise HTTPException(404, "Activity not found")
    act.status = "Cancelled"
    db.commit()
    return {"ok": True, "activity_id": activity_id, "status": "Cancelled"}


@app.post("/live/add-activity", response_model=ActivityOut)
def live_add_activity(data: ActivityCreate, db: Session = Depends(get_db)):
    """Add a new activity during a live event."""
    act = Activity(**data.model_dump())
    db.add(act)
    db.commit()
    db.refresh(act)
    return act


@app.post("/live/announcement", response_model=AnnouncementOut)
def create_announcement(data: AnnouncementCreate, db: Session = Depends(get_db)):
    ann = Announcement(**data.model_dump())
    db.add(ann)
    db.commit()
    db.refresh(ann)
    return ann


@app.get("/announcements", response_model=list[AnnouncementOut])
def list_announcements(event_id: int | None = None, db: Session = Depends(get_db)):
    q = db.query(Announcement)
    if event_id is not None:
        q = q.filter(Announcement.event_id == event_id)
    return q.order_by(Announcement.created_at.desc()).all()


# ═══════════════════════════════════════════
#  SMART SCRIPT (mock / template service)
# ═══════════════════════════════════════════

_SCRIPT_TEMPLATES: dict[str, list[str]] = {
    "opening": [
        "Good morning and welcome to {event_name}! We are thrilled to have you all here today. "
        "Let's kick things off with an exciting lineup of activities. Our first session, "
        "'{current_activity}', is about to begin. Stay tuned!",
        "Distinguished guests, welcome to {event_name}. We have an incredible day planned. "
        "Up first is '{current_activity}'. Let us begin!",
    ],
    "speaker_intro": [
        "It is my pleasure to introduce our next speaker, {speaker}. "
        "They will be presenting '{current_activity}'. Please give them a warm welcome!",
        "Let's welcome {speaker} to the stage for '{current_activity}'. "
        "We're excited to hear their insights!",
    ],
    "transition": [
        "Thank you for that wonderful session on '{current_activity}'. "
        "Up next we have '{next_activity}'. Please stay seated as we transition.",
        "That wraps up '{current_activity}'. Coming up next is '{next_activity}'. "
        "Let's keep the momentum going!",
    ],
    "closing": [
        "As we come to the end of {event_name}, I'd like to thank all our speakers, "
        "participants, and organizers for making this event a grand success. "
        "See you next time!",
        "What an incredible day at {event_name}! Thank you all for being here. "
        "We hope you enjoyed every moment. Until next time!",
    ],
    "delay_announcement": [
        "A quick update — {schedule_change}. "
        "We apologize for the inconvenience and appreciate your patience. "
        "'{current_activity}' will resume shortly.",
        "Attention please — {schedule_change}. "
        "Thank you for your understanding. We'll be back on track soon!",
    ],
    "break_announcement": [
        "We will now take a short break. Please return in time for '{next_activity}'. "
        "Refreshments are available in the lobby.",
    ],
    "schedule_change": [
        "Important schedule update — {schedule_change}. "
        "Please check the updated agenda for details. '{next_activity}' is coming up next.",
    ],
    "unexpected": [
        "May I have your attention please for a brief announcement: {schedule_change}.",
    ],
}


@app.post("/scripts/generate", response_model=ScriptResponse)
def generate_script(data: ScriptRequest):
    """Mock / template script generator.
    Isolated so a real AI model can replace the internals later.
    """
    templates = _SCRIPT_TEMPLATES.get(data.script_type, _SCRIPT_TEMPLATES["unexpected"])
    template = random.choice(templates)

    script_text = template.format(
        event_name=data.event_name or "the event",
        current_activity=data.current_activity or "the current session",
        next_activity=data.next_activity or "the next session",
        speaker=data.speaker or "our next speaker",
        schedule_change=data.schedule_change or "there has been a schedule update",
    )

    # Trim to roughly match target_seconds (~2.5 words/sec speaking rate)
    target_words = max(8, math.ceil(data.target_seconds * 2.5))
    words = script_text.split()
    if len(words) > target_words:
        script_text = " ".join(words[:target_words]) + "."

    estimated_seconds = max(5, round(len(script_text.split()) / 2.5))

    return ScriptResponse(
        script=script_text,
        estimated_seconds=estimated_seconds,
        note=f"Mock template · {data.script_type} · ~{data.target_seconds}s target. "
             f"Replace this service with a real AI model for production.",
    )


# ═══════════════════════════════════════════
#  HEALTH
# ═══════════════════════════════════════════

@app.get("/")
def health():
    return {"app": "EventSaathi", "status": "running"}
