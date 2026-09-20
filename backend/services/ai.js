import { store } from '../db/store.js';
import { recompute } from './scheduler.js';
import { renderFallbackScript } from './templates.js';

const WORDS_PER_MINUTE = 130;

export function estimateSpokenSeconds(text) {
  if (!text) return 0;
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(5, Math.round((words / WORDS_PER_MINUTE) * 60));
}

/**
 * Builds the tight structured context object (Section 8.2 of README)
 */
export function buildScriptContext(eventId, activityId, scriptType, options = {}) {
  const event = store.getEventById(eventId);
  let activities = recompute(store.getActivities(eventId));
  const people = store.getPeople(eventId);
  const peopleMap = new Map(people.map(p => [p.id, p]));

  let currentAct = activityId ? activities.find(a => a.id === activityId) : null;
  if (!currentAct && activities.length > 0) {
    currentAct = activities[0];
  }

  let prevAct = null;
  let nextAct = null;
  if (currentAct) {
    const idx = activities.findIndex(a => a.id === currentAct.id);
    if (idx > 0) prevAct = activities[idx - 1];
    if (idx < activities.length - 1) nextAct = activities[idx + 1];
  }

  const actPerson = currentAct?.person_id ? peopleMap.get(currentAct.person_id) : null;
  const assignedPeople = actPerson ? [actPerson] : people.filter(p => p.role_type === 'SPEAKER' || p.role_type === 'GUEST');

  const updates = store.getUpdates(eventId);

  const targetDuration = options.target_duration_seconds || (
    options.length_mode === 'very_short' ? 15 :
    options.length_mode === 'short' ? 25 :
    options.length_mode === 'detailed' ? 80 : 45
  );

  return {
    script_type: scriptType,
    event: {
      name: event?.name || 'College Event',
      type: event?.type || 'Technical Festival',
      venue: event?.venue || 'Main Stage',
      date: event?.date || 'Today',
      tone: options.tone || 'warm_formal',
      language: options.language || 'en'
    },
    previous_activity: prevAct ? {
      title: prevAct.title,
      person: prevAct.person_id ? peopleMap.get(prevAct.person_id)?.name : null,
      status: prevAct.status
    } : null,
    current_activity: currentAct ? {
      title: currentAct.title,
      type: currentAct.type,
      person_id: currentAct.person_id,
      status: currentAct.status,
      planned_start: currentAct.planned_start,
      computed_start: currentAct.computed_start,
      computed_end: currentAct.computed_end,
      delay_min: currentAct.delay_min || 0,
      room: currentAct.room
    } : null,
    next_activity: nextAct ? {
      title: nextAct.title,
      person: nextAct.person_id ? peopleMap.get(nextAct.person_id)?.name : null,
      computed_start: nextAct.computed_start,
      room: nextAct.room
    } : null,
    people: assignedPeople.map(p => ({
      id: p.id,
      name: p.name,
      designation: p.designation,
      organization: p.organization,
      topic: p.topic,
      bio: p.bio
    })),
    recent_updates: updates.slice(0, 3).map(u => ({
      type: u.type,
      message: u.message,
      reason: u.reason,
      at: u.created_at
    })),
    constraints: {
      available_seconds: options.available_seconds || targetDuration,
      target_duration_seconds: targetDuration,
      length_mode: options.length_mode || 'short',
      tone: options.tone || 'warm_formal',
      must_not_invent: true
    }
  };
}

/**
 * Validate AI response against anti-hallucination rules (Section 8.6)
 */
function validateScript(result, context) {
  if (!result || !result.script) return false;

  const script = result.script;
  const bannedWords = ['award-winning', 'renowned', 'pioneer', 'visionary', 'celebrated'];
  const hasBannedWord = bannedWords.some(w => script.toLowerCase().includes(w));
  if (hasBannedWord) {
    console.warn('[AI Validator] Banned credential word detected in AI script');
    return false;
  }

  // Verify time patterns
  const timeMatches = script.match(/\b\d{1,2}:\d{2}\b/g) || [];
  const contextStr = JSON.stringify(context);
  for (const t of timeMatches) {
    if (!contextStr.includes(t)) {
      console.warn(`[AI Validator] Time "${t}" was not present in context!`);
      return false;
    }
  }

  return true;
}

/**
 * Generate a smart stage script via Gemini API, with automatic fallback to offline templates
 */
export async function generateStageScript(context) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.log('[AI] No GEMINI_API_KEY found, using grounded template engine.');
    return renderFallbackScript(context);
  }

  const targetDuration = context.constraints.target_duration_seconds || 30;
  const wordBudget = Math.round(targetDuration * (WORDS_PER_MINUTE / 60));

  const systemInstruction = `You are a real-time anchor assistant for college events.
Your job is to generate grounded stage scripts for the Master of Ceremonies (Anchor).
STRICT RULES:
1. Grounding: Use ONLY the exact fields supplied in the context JSON.
2. Anti-hallucination: Never invent awards, degrees, accolades, organizations, or past achievements not explicitly listed in the profile. If bio is null or empty, introduce the speaker using only name, designation, organization, and topic.
3. Schedule precision: Never invent a time. Only reference times that appear in the context.
4. Word Budget: Aim for approximately ${wordBudget} words so the spoken duration is around ${targetDuration} seconds (calibrated at 130 words per minute).
5. Format: Return valid JSON ONLY. Do NOT include markdown fences, backticks, or preamble.
The JSON must follow this exact schema:
{
  "script": "spoken text for the anchor",
  "alternative": "shorter punchy alternative",
  "context_note": "one sentence explaining how the script was adapted to current context"
}`;

  const prompt = `Context:\n${JSON.stringify(context, null, 2)}\nGenerate the ${context.script_type} script now in JSON format:`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: `${systemInstruction}\n\n${prompt}` }] }
        ],
        generationConfig: {
          temperature: 0.3,
          responseMimeType: 'application/json'
        }
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`[AI] Gemini API returned status ${response.status}. Falling back to template.`);
      return renderFallbackScript(context);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return renderFallbackScript(context);
    }

    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);

    // Validate anti-hallucination
    if (!validateScript(parsed, context)) {
      console.warn('[AI] Generated script failed anti-hallucination checks, falling back to template.');
      return renderFallbackScript(context);
    }

    const estimatedSec = estimateSpokenSeconds(parsed.script);

    return {
      script: parsed.script,
      alternative: parsed.alternative || '',
      estimated_duration_seconds: estimatedSec,
      target_duration_seconds: targetDuration,
      context_note: parsed.context_note || 'Generated by Gemini Flash grounded in live state.',
      source: 'ai',
      grounded: true
    };
  } catch (err) {
    console.error('[AI] Generation failed or timed out:', err.message);
    return renderFallbackScript(context);
  }
}
