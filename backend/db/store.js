import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BUNDLED_DATA_FILE = path.join(__dirname, 'smart_stage_data.json');
const DATA_FILE = process.env.VERCEL
  ? path.join('/tmp', 'smart_stage_data.json')
  : BUNDLED_DATA_FILE;

class Store {
  constructor() {
    this.data = {
      events: [],
      activities: [],
      people: [],
      event_users: [],
      scripts: [],
      event_updates: []
    };
    this.load();
  }

  load() {
    try {
      const targetFile = fs.existsSync(DATA_FILE) ? DATA_FILE : (fs.existsSync(BUNDLED_DATA_FILE) ? BUNDLED_DATA_FILE : null);
      if (targetFile) {
        const raw = fs.readFileSync(targetFile, 'utf-8');
        this.data = JSON.parse(raw);
      }
    } catch (err) {
      console.error('[Store] Error reading data file, using fresh store:', err.message);
    }
  }


  save() {
    try {
      const tempPath = `${DATA_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tempPath, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tempPath, DATA_FILE);
    } catch (err) {
      console.error('[Store] Error persisting data file:', err.message);
    }
  }

  // --- Events ---
  getEvents() {
    return this.data.events;
  }

  getEventById(id) {
    return this.data.events.find(e => e.id === id);
  }

  getEventByCode(code) {
    return this.data.events.find(e => e.code?.toUpperCase() === code?.toUpperCase());
  }

  createEvent(eventData) {
    const id = eventData.id || `evt_${crypto.randomBytes(4).toString('hex')}`;
    const code = (eventData.code || crypto.randomBytes(3).toString('hex')).toUpperCase();
    const event = {
      id,
      code,
      name: eventData.name,
      type: eventData.type || 'Technical Festival',
      date: eventData.date || new Date().toISOString().split('T')[0],
      venue: eventData.venue || 'Main Auditorium',
      description: eventData.description || '',
      status: eventData.status || 'DRAFT', // DRAFT | READY | LIVE | PAUSED | COMPLETED
      organizer_pin: eventData.organizer_pin || '1234',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.data.events.push(event);
    this.save();
    return event;
  }

  updateEvent(id, updates) {
    const event = this.getEventById(id);
    if (!event) return null;
    Object.assign(event, updates, { updated_at: new Date().toISOString() });
    this.save();
    return event;
  }

  deleteEvent(id) {
    this.data.events = this.data.events.filter(e => e.id !== id);
    this.data.activities = this.data.activities.filter(a => a.event_id !== id);
    this.data.people = this.data.people.filter(p => p.event_id !== id);
    this.data.scripts = this.data.scripts.filter(s => s.event_id !== id);
    this.data.event_updates = this.data.event_updates.filter(u => u.event_id !== id);
    this.save();
    return true;
  }

  // --- Activities ---
  getActivities(eventId) {
    return this.data.activities
      .filter(a => a.event_id === eventId)
      .sort((a, b) => a.sequence - b.sequence);
  }

  getActivityById(id) {
    return this.data.activities.find(a => a.id === id);
  }

  createActivity(actData) {
    const id = actData.id || `act_${crypto.randomBytes(4).toString('hex')}`;
    const currentList = this.getActivities(actData.event_id);
    const sequence = actData.sequence ?? (currentList.length + 1);

    const activity = {
      id,
      event_id: actData.event_id,
      sequence,
      title: actData.title,
      type: actData.type || 'TALK', // CEREMONY | TALK | KEYNOTE | WORKSHOP | PANEL | BREAK | JUDGING | PERFORMANCE | OTHER
      planned_start: actData.planned_start || '10:00',
      duration_min: Math.max(1, Number(actData.duration_min) || 15),
      break_after_min: Math.max(0, Number(actData.break_after_min) || 0),
      delay_min: Math.max(0, Number(actData.delay_min) || 0),
      computed_start: actData.computed_start || actData.planned_start || '10:00',
      computed_end: actData.computed_end || '10:15',
      actual_start: actData.actual_start || null,
      actual_end: actData.actual_end || null,
      status: actData.status || 'SCHEDULED', // SCHEDULED | UPCOMING | IN_PROGRESS | COMPLETED | DELAYED | CANCELLED | POSTPONED
      room: actData.room || 'Main Auditorium',
      person_id: actData.person_id || null,
      notes: actData.notes || '',
      allow_pull_forward: Boolean(actData.allow_pull_forward),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.data.activities.push(activity);
    this.save();
    return activity;
  }

  updateActivity(id, updates) {
    const activity = this.getActivityById(id);
    if (!activity) return null;
    Object.assign(activity, updates, { updated_at: new Date().toISOString() });
    this.save();
    return activity;
  }

  deleteActivity(id) {
    const act = this.getActivityById(id);
    if (!act) return false;
    const eventId = act.event_id;
    this.data.activities = this.data.activities.filter(a => a.id !== id);
    // Re-sequence remaining
    const remaining = this.getActivities(eventId);
    remaining.forEach((a, idx) => {
      a.sequence = idx + 1;
    });
    this.save();
    return true;
  }

  reorderActivities(eventId, orderedIds) {
    orderedIds.forEach((id, idx) => {
      const act = this.getActivityById(id);
      if (act && act.event_id === eventId) {
        act.sequence = idx + 1;
      }
    });
    this.save();
    return this.getActivities(eventId);
  }

  // --- People ---
  getPeople(eventId, roleType = null) {
    let list = this.data.people.filter(p => p.event_id === eventId);
    if (roleType) {
      list = list.filter(p => p.role_type === roleType);
    }
    return list;
  }

  getPersonById(id) {
    return this.data.people.find(p => p.id === id);
  }

  createPerson(personData) {
    const id = personData.id || `per_${crypto.randomBytes(4).toString('hex')}`;
    const person = {
      id,
      event_id: personData.event_id,
      role_type: personData.role_type || 'SPEAKER', // SPEAKER | GUEST | JURY | CHIEF_GUEST | TEAM
      name: personData.name,
      designation: personData.designation || '',
      organization: personData.organization || '',
      bio: personData.bio || null,
      topic: personData.topic || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.data.people.push(person);
    this.save();
    return person;
  }

  updatePerson(id, updates) {
    const person = this.getPersonById(id);
    if (!person) return null;
    Object.assign(person, updates, { updated_at: new Date().toISOString() });
    this.save();
    return person;
  }

  deletePerson(id) {
    this.data.people = this.data.people.filter(p => p.id !== id);
    // Clear person reference on any activities
    this.data.activities.forEach(a => {
      if (a.person_id === id) a.person_id = null;
    });
    this.save();
    return true;
  }

  // --- Event Users ---
  getUsers(eventId) {
    return this.data.event_users.filter(u => u.event_id === eventId);
  }

  addUser(userData) {
    const id = userData.id || `usr_${crypto.randomBytes(4).toString('hex')}`;
    const user = {
      id,
      event_id: userData.event_id,
      role: userData.role || 'ANCHOR', // ORGANIZER | COORDINATOR | ANCHOR
      name: userData.name || 'Team Member',
      joined_at: new Date().toISOString()
    };
    this.data.event_users.push(user);
    this.save();
    return user;
  }

  // --- Scripts ---
  getScripts(eventId, activityId = null) {
    let list = this.data.scripts.filter(s => s.event_id === eventId);
    if (activityId) {
      list = list.filter(s => s.activity_id === activityId);
    }
    return list.sort((a, b) => b.version - a.version);
  }

  getScriptById(id) {
    return this.data.scripts.find(s => s.id === id);
  }

  saveScript(scriptData) {
    // Determine next version for this activity and script_type
    const existing = this.data.scripts.filter(
      s => s.event_id === scriptData.event_id &&
           s.activity_id === scriptData.activity_id &&
           s.script_type === scriptData.script_type
    );
    const nextVersion = existing.length > 0 ? Math.max(...existing.map(s => s.version)) + 1 : 1;

    const id = scriptData.id || `scr_${crypto.randomBytes(4).toString('hex')}`;
    const script = {
      id,
      event_id: scriptData.event_id,
      activity_id: scriptData.activity_id || null,
      script_type: scriptData.script_type, // opening | speaker_introduction | transition | closing | delay_announcement | schedule_change_announcement | break_announcement | unexpected_announcement
      content: scriptData.content,
      alternative: scriptData.alternative || '',
      target_duration_seconds: scriptData.target_duration_seconds || 30,
      estimated_duration_seconds: scriptData.estimated_duration_seconds || 20,
      length_mode: scriptData.length_mode || 'short',
      tone: scriptData.tone || 'warm_formal',
      source: scriptData.source || 'ai', // ai | template | manual
      version: nextVersion,
      grounded: scriptData.grounded !== false,
      is_stale: false,
      context_note: scriptData.context_note || '',
      generated_at: new Date().toISOString()
    };
    this.data.scripts.push(script);
    this.save();
    return script;
  }

  markScriptsStale(eventId, activityId = null, reason = 'schedule_changed') {
    this.data.scripts.forEach(s => {
      if (s.event_id === eventId && (!activityId || s.activity_id === activityId)) {
        s.is_stale = true;
        s.stale_reason = reason;
      }
    });
    this.save();
  }

  // --- Event Updates (Append-only Audit Log) ---
  getUpdates(eventId, sinceTimestamp = null) {
    let list = this.data.event_updates.filter(u => u.event_id === eventId);
    if (sinceTimestamp) {
      list = list.filter(u => new Date(u.created_at) > new Date(sinceTimestamp));
    }
    return list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  appendUpdate(updateData) {
    const id = `upd_${crypto.randomBytes(4).toString('hex')}`;
    const update = {
      id,
      event_id: updateData.event_id,
      activity_id: updateData.activity_id || null,
      type: updateData.type, // DELAY | ACTIVITY_START | ACTIVITY_COMPLETE | CANCEL | POSTPONE | ROOM_CHANGE | TIME_CHANGE | BREAK_CHANGE | PEOPLE_CHANGE | ANNOUNCEMENT
      message: updateData.message,
      reason: updateData.reason || '',
      payload: updateData.payload || {},
      created_by: updateData.created_by || 'System',
      created_at: new Date().toISOString()
    };
    this.data.event_updates.push(update);
    this.save();
    return update;
  }
}

export const store = new Store();
