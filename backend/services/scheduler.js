/**
 * Deterministic Scheduling Engine (Section 7 of README)
 * The source of truth for schedule math, cascade recomputation, drift, and speaking gaps.
 */

// Parse "HH:MM" or ISO string into total minutes from midnight
export function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  if (timeStr.includes('T')) {
    const d = new Date(timeStr);
    return d.getHours() * 60 + d.getMinutes();
  }
  const parts = timeStr.split(':');
  return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
}

// Convert minutes from midnight back to "HH:MM" 24h format
export function minutesToTime(totalMin) {
  const normalized = ((totalMin % (24 * 60)) + (24 * 60)) % (24 * 60);
  const hrs = Math.floor(normalized / 60).toString().padStart(2, '0');
  const mins = Math.floor(normalized % 60).toString().padStart(2, '0');
  return `${hrs}:${mins}`;
}

// Add minutes to "HH:MM"
export function addMinutesToTime(timeStr, deltaMinutes) {
  const min = timeToMinutes(timeStr) + deltaMinutes;
  return minutesToTime(min);
}

/**
 * Cascade recompute algorithm (Section 7.2)
 * @param {Array} activities - ordered by sequence
 * @returns {Array} activities with recomputed computed_start and computed_end
 */
export function recompute(activities) {
  let cursorMinutes = null;

  for (const act of activities) {
    if (['CANCELLED', 'POSTPONED'].includes(act.status)) {
      act.computed_start = null;
      act.computed_end = null;
      continue;
    }

    const plannedStartMin = timeToMinutes(act.planned_start);
    const delayMin = Math.max(0, Number(act.delay_min) || 0);
    const durationMin = Math.max(1, Number(act.duration_min) || 15);
    const breakAfterMin = Math.max(0, Number(act.break_after_min) || 0);

    let startMin;
    if (act.actual_start) {
      // 1. Reality wins if activity already started
      startMin = timeToMinutes(act.actual_start);
    } else if (cursorMinutes === null) {
      // First active activity
      startMin = plannedStartMin + delayMin;
    } else {
      // 2. No accidental pull-forward: finish early does not drag next session earlier unless allow_pull_forward is true
      const naturalMin = act.allow_pull_forward ? cursorMinutes : Math.max(cursorMinutes, plannedStartMin);
      startMin = naturalMin + delayMin;
    }

    let endMin;
    if (act.actual_end) {
      endMin = timeToMinutes(act.actual_end);
    } else {
      endMin = startMin + durationMin;
    }

    act.computed_start = minutesToTime(startMin);
    act.computed_end = minutesToTime(endMin);

    // Cursor for downstream activities
    cursorMinutes = endMin + breakAfterMin;
  }

  return activities;
}

/**
 * Compute derived timing metrics for live state (Section 7.3)
 */
export function computeTimingMetrics(event, activities) {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
  const currentSecondsOfDay = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

  const activeActivities = activities.filter(a => !['CANCELLED', 'POSTPONED'].includes(a.status));
  
  // Current activity: IN_PROGRESS or first DELAYED / UPCOMING
  let current = activeActivities.find(a => a.status === 'IN_PROGRESS');
  if (!current) {
    current = activeActivities.find(a => a.status === 'DELAYED') ||
              activeActivities.find(a => a.status === 'UPCOMING') ||
              activeActivities.find(a => a.status === 'SCHEDULED');
  }

  // Next activity: first non-completed activity after current
  let next = null;
  if (current) {
    const currentIndex = activeActivities.findIndex(a => a.id === current.id);
    next = activeActivities.slice(currentIndex + 1).find(a => !['COMPLETED', 'CANCELLED', 'POSTPONED'].includes(a.status)) || null;
  }

  // Drift calculation: computed_start(current or next) - planned_start
  let driftMin = 0;
  const targetForDrift = current || next;
  if (targetForDrift && targetForDrift.computed_start && targetForDrift.planned_start) {
    driftMin = timeToMinutes(targetForDrift.computed_start) - timeToMinutes(targetForDrift.planned_start);
  }

  // Remaining & Overrun seconds
  let remainingSec = null;
  let overrunSec = null;
  if (current && current.computed_end) {
    const endSeconds = timeToMinutes(current.computed_end) * 60;
    const diff = endSeconds - currentSecondsOfDay;
    if (diff >= 0) {
      remainingSec = Math.round(diff);
      overrunSec = 0;
    } else {
      remainingSec = 0;
      overrunSec = Math.round(Math.abs(diff));
    }
  }

  // Speaking window for anchor (gap_to_next_sec)
  let gapToNextSec = 60; // default comfortable window
  if (next && next.computed_start) {
    const nextStartSeconds = timeToMinutes(next.computed_start) * 60;
    const gap = nextStartSeconds - currentSecondsOfDay;
    gapToNextSec = Math.max(10, Math.round(gap));
  } else if (current && current.computed_end) {
    const currentEndSeconds = timeToMinutes(current.computed_end) * 60;
    const gap = currentEndSeconds - currentSecondsOfDay;
    gapToNextSec = Math.max(10, Math.round(gap));
  }

  return {
    current,
    next,
    driftMin,
    remainingSec,
    overrunSec,
    gapToNextSec,
    serverTime: now.toISOString()
  };
}
