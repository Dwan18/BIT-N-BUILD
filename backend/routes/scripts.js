import express from 'express';
import { store } from '../db/store.js';
import { buildScriptContext, generateStageScript, estimateSpokenSeconds } from '../services/ai.js';
import { requireRole } from './auth.js';

export const scriptsRouter = express.Router();

// GET /api/events/:id/scripts - All scripts for event
scriptsRouter.get('/events/:id/scripts', (req, res) => {
  const scripts = store.getScripts(req.params.id);
  res.json(scripts);
});

// GET /api/activities/:id/scripts - All versions for activity
scriptsRouter.get('/activities/:id/scripts', (req, res) => {
  const act = store.getActivityById(req.params.id);
  if (!act) return res.status(404).json({ message: 'Activity not found' });

  const scripts = store.getScripts(act.event_id, act.id);
  res.json(scripts);
});

// POST /api/events/:id/scripts/generate - Generate single script
scriptsRouter.post('/events/:id/scripts/generate', requireRole('ORGANIZER', 'ANCHOR'), async (req, res) => {
  const { activity_id, script_type = 'speaker_introduction', target_duration_seconds, length_mode, tone, language } = req.body;
  const eventId = req.params.id;

  const event = store.getEventById(eventId);
  if (!event) return res.status(404).json({ message: 'Event not found' });

  const context = buildScriptContext(eventId, activity_id, script_type, {
    target_duration_seconds,
    length_mode,
    tone,
    language
  });

  const generated = await generateStageScript(context);

  const saved = store.saveScript({
    event_id: eventId,
    activity_id: activity_id || null,
    script_type,
    content: generated.script,
    alternative: generated.alternative,
    target_duration_seconds: generated.target_duration_seconds || target_duration_seconds || 30,
    estimated_duration_seconds: generated.estimated_duration_seconds,
    length_mode: length_mode || 'short',
    tone: tone || 'warm_formal',
    source: generated.source,
    grounded: generated.grounded,
    context_note: generated.context_note
  });

  res.status(201).json(saved);
});

// POST /api/events/:id/scripts/generate-batch - Pre-generate opening, intros, transitions, closing
scriptsRouter.post('/events/:id/scripts/generate-batch', requireRole('ORGANIZER'), async (req, res) => {
  const eventId = req.params.id;
  const event = store.getEventById(eventId);
  if (!event) return res.status(404).json({ message: 'Event not found' });

  const activities = store.getActivities(eventId);
  const results = [];

  // 1. Opening script for the first activity or event
  const firstAct = activities[0];
  const openingCtx = buildScriptContext(eventId, firstAct?.id, 'opening', { length_mode: 'short', target_duration_seconds: 45 });
  const openingRes = await generateStageScript(openingCtx);
  results.push(store.saveScript({
    event_id: eventId,
    activity_id: firstAct?.id || null,
    script_type: 'opening',
    content: openingRes.script,
    alternative: openingRes.alternative,
    target_duration_seconds: 45,
    estimated_duration_seconds: openingRes.estimated_duration_seconds,
    source: openingRes.source,
    grounded: openingRes.grounded,
    context_note: 'Pre-generated opening ceremony script.'
  }));

  // 2. Speaker introductions for activities with people
  for (const act of activities) {
    if (act.person_id || act.type === 'KEYNOTE' || act.type === 'TALK' || act.type === 'WORKSHOP') {
      const introCtx = buildScriptContext(eventId, act.id, 'speaker_introduction', { length_mode: 'short', target_duration_seconds: 30 });
      const introRes = await generateStageScript(introCtx);
      results.push(store.saveScript({
        event_id: eventId,
        activity_id: act.id,
        script_type: 'speaker_introduction',
        content: introRes.script,
        alternative: introRes.alternative,
        target_duration_seconds: 30,
        estimated_duration_seconds: introRes.estimated_duration_seconds,
        source: introRes.source,
        grounded: introRes.grounded,
        context_note: 'Pre-generated speaker introduction.'
      }));
    }

    // Transitions
    const transCtx = buildScriptContext(eventId, act.id, 'transition', { length_mode: 'very_short', target_duration_seconds: 20 });
    const transRes = await generateStageScript(transCtx);
    results.push(store.saveScript({
      event_id: eventId,
      activity_id: act.id,
      script_type: 'transition',
      content: transRes.script,
      alternative: transRes.alternative,
      target_duration_seconds: 20,
      estimated_duration_seconds: transRes.estimated_duration_seconds,
      source: transRes.source,
      grounded: transRes.grounded,
      context_note: 'Pre-generated transition bridge.'
    }));
  }

  // 3. Closing script for the last activity
  const lastAct = activities[activities.length - 1];
  const closingCtx = buildScriptContext(eventId, lastAct?.id, 'closing', { length_mode: 'medium', target_duration_seconds: 60 });
  const closingRes = await generateStageScript(closingCtx);
  results.push(store.saveScript({
    event_id: eventId,
    activity_id: lastAct?.id || null,
    script_type: 'closing',
    content: closingRes.script,
    alternative: closingRes.alternative,
    target_duration_seconds: 60,
    estimated_duration_seconds: closingRes.estimated_duration_seconds,
    source: closingRes.source,
    grounded: closingRes.grounded,
    context_note: 'Pre-generated closing ceremony script.'
  }));

  res.json({
    ok: true,
    total_generated: results.length,
    scripts: results
  });
});

// POST /api/scripts/:id/regenerate - Quick actions (Make shorter, 20s, formal/casual, etc.)
scriptsRouter.post('/scripts/:id/regenerate', requireRole('ORGANIZER', 'ANCHOR'), async (req, res) => {
  const existing = store.getScriptById(req.params.id);
  if (!existing) return res.status(404).json({ message: 'Script not found' });

  const { modifier, target_duration_seconds, tone, length_mode } = req.body;

  let newLengthMode = length_mode || existing.length_mode;
  let newTone = tone || existing.tone;
  let newTargetDuration = target_duration_seconds || existing.target_duration_seconds;

  // Apply Quick Action modifier presets (§8.5)
  if (modifier === 'shorter') {
    newLengthMode = newLengthMode === 'detailed' ? 'medium' : newLengthMode === 'medium' ? 'short' : 'very_short';
    newTargetDuration = Math.max(10, Math.round(newTargetDuration * 0.65));
  } else if (modifier === 'longer') {
    newLengthMode = newLengthMode === 'very_short' ? 'short' : newLengthMode === 'short' ? 'medium' : 'detailed';
    newTargetDuration = Math.min(120, Math.round(newTargetDuration * 1.5));
  } else if (modifier === 'formal') {
    newTone = 'formal';
  } else if (modifier === 'casual') {
    newTone = 'casual';
  } else if (modifier === '20_seconds') {
    newTargetDuration = 20;
    newLengthMode = 'very_short';
  }

  const context = buildScriptContext(existing.event_id, existing.activity_id, existing.script_type, {
    target_duration_seconds: newTargetDuration,
    length_mode: newLengthMode,
    tone: newTone
  });

  const generated = await generateStageScript(context);

  const saved = store.saveScript({
    event_id: existing.event_id,
    activity_id: existing.activity_id,
    script_type: existing.script_type,
    content: generated.script,
    alternative: generated.alternative,
    target_duration_seconds: newTargetDuration,
    estimated_duration_seconds: generated.estimated_duration_seconds,
    length_mode: newLengthMode,
    tone: newTone,
    source: generated.source,
    grounded: generated.grounded,
    context_note: `Regenerated with modifier: "${modifier || 'custom'}"`
  });

  res.status(201).json(saved);
});

// PUT /api/scripts/:id - Manual edit -> saves as a new version with source='manual'
scriptsRouter.put('/scripts/:id', requireRole('ORGANIZER', 'ANCHOR'), (req, res) => {
  const existing = store.getScriptById(req.params.id);
  if (!existing) return res.status(404).json({ message: 'Script not found' });

  const { content, alternative } = req.body;
  if (!content) return res.status(400).json({ message: 'Content is required' });

  const estimatedSec = estimateSpokenSeconds(content);

  const saved = store.saveScript({
    event_id: existing.event_id,
    activity_id: existing.activity_id,
    script_type: existing.script_type,
    content,
    alternative: alternative || existing.alternative,
    target_duration_seconds: existing.target_duration_seconds,
    estimated_duration_seconds: estimatedSec,
    length_mode: existing.length_mode,
    tone: existing.tone,
    source: 'manual',
    grounded: true,
    context_note: 'Manually edited by anchor/organizer.'
  });

  res.json(saved);
});
