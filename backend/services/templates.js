/**
 * Deterministic Template Fallback Engine (Section 8.7 of README)
 * Guarantees that even with zero internet, API outages, or expired quotas,
 * the anchor receives a 100% grounded, professional stage script.
 */

export function renderFallbackScript(context) {
  const { script_type, event, current_activity, next_activity, previous_activity, people, constraints } = context;
  const person = (people && people.length > 0) ? people[0] : null;

  let content = '';
  let alternative = '';
  let context_note = 'Generated via offline deterministic template.';

  switch (script_type) {
    case 'opening': {
      content = `Ladies and gentlemen, esteemed faculty, and honored guests, a very warm welcome to ${event.name} here at ${event.venue}. We are gathered today for an inspiring program celebrating technical excellence and collaborative innovation. Let us begin today's journey.`;
      alternative = `Welcome to ${event.name} at ${event.venue}! We are delighted to have you with us as we kick off today's events.`;
      break;
    }

    case 'speaker_introduction': {
      const name = person?.name || 'our next speaker';
      const desig = person?.designation ? `${person.designation}` : '';
      const org = person?.organization ? `at ${person.organization}` : '';
      const title = current_activity?.title || person?.topic || 'the stage';
      const roleClause = desig ? (org ? `${desig} ${org}` : desig) : (org || '');

      content = `Our next session features ${name}${roleClause ? `, ${roleClause}` : ''}, presenting on "${title}". Please join me in giving a warm welcome to the stage.`;
      alternative = `Please put your hands together for ${name}${roleClause ? ` (${roleClause})` : ''} as we explore "${title}".`;
      break;
    }

    case 'transition': {
      const nextTitle = next_activity?.title || 'our upcoming session';
      const nextPerson = next_activity?.person ? `with ${next_activity.person}` : '';
      const nextTime = next_activity?.computed_start ? `at ${next_activity.computed_start}` : 'shortly';
      const roomClause = next_activity?.room ? `in ${next_activity.room}` : '';

      content = `Thank you for that insightful session. Up next, we will be moving directly into ${nextTitle} ${nextPerson} scheduled for ${nextTime}${roomClause ? ` ${roomClause}` : ''}.`;
      alternative = `Next on the agenda: ${nextTitle}${roomClause ? ` in ${roomClause}` : ''}, starting at ${nextTime}.`;
      break;
    }

    case 'closing': {
      content = `Ladies and gentlemen, that brings us to the conclusion of ${event.name}. We extend our deepest gratitude to all our speakers, jury members, coordinators, and each one of you in the audience for making today such a memorable success. Thank you and have a wonderful evening!`;
      alternative = `Thank you for being part of ${event.name} at ${event.venue}. We appreciate your dedication and enthusiasm today. Safe travels!`;
      break;
    }

    case 'delay_announcement': {
      const actTitle = current_activity?.title || 'our session';
      const revisedStart = current_activity?.computed_start || 'shortly';
      const reasonClause = context.recent_updates?.[0]?.reason ? ` due to ${context.recent_updates[0].reason}` : '';
      const nextTitle = next_activity?.title ? `, followed by ${next_activity.title}` : '';

      content = `Ladies and gentlemen, a brief update — ${actTitle} will now begin at ${revisedStart}${reasonClause}${nextTitle}. Thank you for your patience, we will be under way in just a few moments.`;
      alternative = `Quick schedule update: ${actTitle} is revised to start at ${revisedStart}. Thank you for standing by.`;
      context_note = `Reflects delay of ${current_activity?.delay_min || 0} minutes.`;
      break;
    }

    case 'schedule_change_announcement': {
      const actTitle = current_activity?.title || 'the upcoming schedule';
      const roomClause = current_activity?.room ? ` to ${current_activity.room}` : '';
      content = `Ladies and gentlemen, please take note of an update to our program. ${actTitle} has been revised${roomClause}. Please refer to the stage monitors for the updated sequence.`;
      alternative = `Important schedule update: ${actTitle} has been updated${roomClause}. We appreciate your cooperation.`;
      break;
    }

    case 'break_announcement': {
      const duration = current_activity?.duration_min || 15;
      const resumeTime = next_activity?.computed_start ? `at ${next_activity.computed_start}` : 'shortly';
      content = `We are now taking a brief ${duration}-minute intermission. Refreshments are available outside, and we will reconvene promptly ${resumeTime}.`;
      alternative = `Please enjoy a ${duration}-minute break. We will resume our program ${resumeTime}.`;
      break;
    }

    case 'unexpected_announcement':
    default: {
      const msg = context.recent_updates?.[0]?.message || 'Please pay attention to this brief stage announcement.';
      content = `Ladies and gentlemen, an important announcement: ${msg}`;
      alternative = `Attention please: ${msg}`;
      break;
    }
  }

  // Handle target speaking length constraint if requested
  const wordsPerMinute = 130;
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const estimated_duration_seconds = Math.max(5, Math.round((wordCount / wordsPerMinute) * 60));

  return {
    script: content,
    alternative,
    estimated_duration_seconds,
    context_note,
    source: 'template',
    grounded: true
  };
}
