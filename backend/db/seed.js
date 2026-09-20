import { store } from './store.js';

export function seedTechFest2026() {
  const existing = store.getEventByCode('TF2026');
  if (existing) {
    console.log('[Seed] TechFest 2026 (TF2026) already present.');
    return existing;
  }

  console.log('[Seed] Seeding TechFest 2026 (TF2026)...');
  const event = store.createEvent({
    id: 'evt_techfest2026',
    code: 'TF2026',
    name: 'TechFest 2026',
    type: 'Technical Festival',
    date: '2026-02-14',
    venue: 'Main Auditorium, Block A',
    description: 'Premier national collegiate technology symposium and hackathon gathering industry leaders and student innovators.',
    status: 'READY', // Ready to start
    organizer_pin: '1234'
  });

  // Seed People
  const mehta = store.createPerson({
    id: 'per_mehta',
    event_id: event.id,
    role_type: 'SPEAKER',
    name: 'Dr. Mehta',
    designation: 'Chief Technology Officer',
    organization: 'ABC Technologies',
    topic: 'Future of AI',
    bio: null // No bio to test grounded anti-hallucination constraint
  });

  const patel = store.createPerson({
    id: 'per_patel',
    event_id: event.id,
    role_type: 'SPEAKER',
    name: 'Ms. Patel',
    designation: 'Senior Engineer',
    organization: 'XYZ Labs',
    topic: 'Building with LLMs',
    bio: 'Lead research engineer specializing in distributed inference systems.'
  });

  const shah = store.createPerson({
    id: 'per_shah',
    event_id: event.id,
    role_type: 'JURY',
    name: 'Prof. Shah',
    designation: 'HOD, Computer Engineering',
    organization: 'Host Institute of Technology',
    topic: 'Hackathon Project Evaluation',
    bio: 'Distinguished academic with 20+ years of software architecture research.'
  });

  const rao = store.createPerson({
    id: 'per_rao',
    event_id: event.id,
    role_type: 'GUEST',
    name: 'Dr. Rao',
    designation: 'Principal & Patron',
    organization: 'Host Institute of Technology',
    topic: 'Welcome Address',
    bio: 'Campus leadership and academic director.'
  });

  // Seed Team
  store.addUser({
    event_id: event.id,
    role: 'ORGANIZER',
    name: 'Aarav (Lead Organizer)'
  });
  store.addUser({
    event_id: event.id,
    role: 'COORDINATOR',
    name: 'Rahul (Stage Coordinator)'
  });
  store.addUser({
    event_id: event.id,
    role: 'ANCHOR',
    name: 'Priya (Master of Ceremonies)'
  });

  // Seed Activities (TechFest 2026 worked example from Section 16)
  const act1 = store.createActivity({
    id: 'act_01',
    event_id: event.id,
    sequence: 1,
    title: 'Opening Ceremony',
    type: 'CEREMONY',
    planned_start: '10:00',
    duration_min: 10,
    break_after_min: 0,
    room: 'Main Auditorium',
    person_id: null,
    status: 'SCHEDULED'
  });

  const act2 = store.createActivity({
    id: 'act_02',
    event_id: event.id,
    sequence: 2,
    title: 'Welcome Address',
    type: 'TALK',
    planned_start: '10:10',
    duration_min: 10,
    break_after_min: 0,
    room: 'Main Auditorium',
    person_id: rao.id,
    status: 'SCHEDULED'
  });

  const act3 = store.createActivity({
    id: 'act_03',
    event_id: event.id,
    sequence: 3,
    title: 'Keynote — Future of AI',
    type: 'KEYNOTE',
    planned_start: '10:20',
    duration_min: 40,
    break_after_min: 0,
    room: 'Main Auditorium',
    person_id: mehta.id,
    status: 'SCHEDULED'
  });

  const act4 = store.createActivity({
    id: 'act_04',
    event_id: event.id,
    sequence: 4,
    title: 'Workshop — Building with LLMs',
    type: 'WORKSHOP',
    planned_start: '11:00',
    duration_min: 60,
    break_after_min: 0,
    room: 'Room B',
    person_id: patel.id,
    status: 'SCHEDULED'
  });

  const act5 = store.createActivity({
    id: 'act_05',
    event_id: event.id,
    sequence: 5,
    title: 'Refreshment Break',
    type: 'BREAK',
    planned_start: '12:00',
    duration_min: 20,
    break_after_min: 0,
    room: 'Foyer',
    person_id: null,
    status: 'SCHEDULED'
  });

  const act6 = store.createActivity({
    id: 'act_06',
    event_id: event.id,
    sequence: 6,
    title: 'Jury Interaction & Project Pitches',
    type: 'JUDGING',
    planned_start: '12:20',
    duration_min: 40,
    break_after_min: 0,
    room: 'Main Auditorium',
    person_id: shah.id,
    status: 'SCHEDULED'
  });

  // Seed baseline v1 scripts
  store.saveScript({
    event_id: event.id,
    activity_id: act1.id,
    script_type: 'opening',
    content: 'Good morning everyone, and a very warm welcome to TechFest 2026 here at the Main Auditorium! Today we celebrate technology, ingenuity, and collegiate collaboration. Let us officially commence this prestigious symposium.',
    alternative: 'A warm welcome to TechFest 2026! We are thrilled to welcome students, faculty, and innovators to today’s summit.',
    target_duration_seconds: 45,
    estimated_duration_seconds: 22,
    length_mode: 'short',
    tone: 'warm_formal',
    source: 'ai',
    grounded: true,
    context_note: 'Pre-generated opening ceremony script.'
  });

  store.saveScript({
    event_id: event.id,
    activity_id: act3.id,
    script_type: 'speaker_introduction',
    content: 'Our keynote this morning comes from Dr. Mehta, Chief Technology Officer at ABC Technologies, speaking on the Future of AI. Please join me in welcoming him to the stage.',
    alternative: 'Please put your hands together for Dr. Mehta, CTO of ABC Technologies, sharing insights on the Future of AI.',
    target_duration_seconds: 30,
    estimated_duration_seconds: 14,
    length_mode: 'short',
    tone: 'warm_formal',
    source: 'ai',
    grounded: true,
    context_note: 'Grounded strictly in speaker profile (no bio hallucinated).'
  });

  store.saveScript({
    event_id: event.id,
    activity_id: act4.id,
    script_type: 'transition',
    content: 'Thank you Dr. Mehta for those visionary thoughts. Up next, we transition immediately to our hands-on workshop on Building with LLMs conducted by Ms. Patel in Room B.',
    alternative: 'Next up: Ms. Patel leads the hands-on workshop on Building with LLMs in Room B.',
    target_duration_seconds: 20,
    estimated_duration_seconds: 13,
    length_mode: 'short',
    tone: 'warm_formal',
    source: 'ai',
    grounded: true,
    context_note: 'Pre-generated bridge script.'
  });

  store.saveScript({
    event_id: event.id,
    activity_id: act6.id,
    script_type: 'closing',
    content: 'What an extraordinary day of innovation, insights, and technological achievement at TechFest 2026. On behalf of the entire organizing committee, faculty, and guests, thank you all for your passionate participation. Have a wonderful evening ahead!',
    alternative: 'Thank you all for making TechFest 2026 an unforgettable success. Safe travels and keep innovating!',
    target_duration_seconds: 60,
    estimated_duration_seconds: 24,
    length_mode: 'short',
    tone: 'warm_formal',
    source: 'ai',
    grounded: true,
    context_note: 'Pre-generated closing ceremony script.'
  });

  // Seed initial event update
  store.appendUpdate({
    event_id: event.id,
    activity_id: null,
    type: 'ANNOUNCEMENT',
    message: 'Welcome to TechFest 2026. Registration desk is active at the North Gate.',
    reason: '',
    created_by: 'Organizing Team'
  });

  console.log('[Seed] TechFest 2026 seeded successfully.');
  return event;
}
