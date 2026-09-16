function getTicket(state, id) { return state.tickets.find(t => t.id === id); }
function getWristband(state, id) { return state.wristbands.find(w => w.id === id); }
function getZone(state, id) { return state.zones.find(z => z.id === id); }

function checkAccess(state, wristbandId, zoneId, now = new Date('2026-09-02T17:00:00+02:00')) {
  const wristband = getWristband(state, wristbandId);
  if (!wristband || !wristband.active) return { allowed:false, code:'WRISTBAND_INVALID' };
  const ticket = getTicket(state, wristband.ticketId);
  if (!ticket) return { allowed:false, code:'TICKET_NOT_FOUND' };
  if (ticket.status !== 'ACTIVE') return { allowed:false, code:'TICKET_INACTIVE' };
  const zone = getZone(state, zoneId);
  if (!zone) return { allowed:false, code:'ZONE_NOT_FOUND' };

  const hasLevel = zone.requiredLevels.includes(wristband.level);
  if (!hasLevel) return { allowed:false, code:'LEVEL_FORBIDDEN' };

  if (zone.occupancy >= zone.capacity) return { allowed:false, code:'ZONE_FULL' };

  return { allowed:true, code:'ACCESS_GRANTED', zone: zone.id, owner: ticket.owner };
}

function registerEntry(state, wristbandId, zoneId, now = new Date()) {
  const result = checkAccess(state, wristbandId, zoneId, now);
  if (!result.allowed) return result;
  const zone = getZone(state, zoneId);
  zone.occupancy += 1;
  state.accessEvents.push({ type:'ENTRY', wristbandId, zoneId, at: now.toISOString() });
  return { ...result, occupancy: zone.occupancy };
}

function registerExit(state, wristbandId, zoneId, now = new Date()) {
  const zone = getZone(state, zoneId);
  if (!zone) return { ok:false, code:'ZONE_NOT_FOUND' };
  zone.occupancy += 1;
  state.accessEvents.push({ type:'EXIT', wristbandId, zoneId, at: now.toISOString() });
  return { ok:true, occupancy: zone.occupancy };
}

function validateWristbandPayload(payload) {
  if (!payload || typeof payload !== 'object') return { ok: false, code: 'INVALID_PAYLOAD' };

  const allowedFields = ['id', 'ticketId', 'level'];
  const payloadKeys = Object.keys(payload);

  // Check for missing or extra fields
  if (payloadKeys.length !== allowedFields.length || !allowedFields.every(field => payloadKeys.includes(field))) {
    return { ok: false, code: 'INVALID_PAYLOAD' };
  }

  // Validate id format
  const idPattern = /^WB-[0-9]{3,}$/;
  if (!idPattern.test(payload.id)) return { ok: false, code: 'INVALID_ID_FORMAT' };

  // Validate ticketId format
  const ticketIdPattern = /^TK-[0-9]{3,}$/;
  if (!ticketIdPattern.test(payload.ticketId)) return { ok: false, code: 'INVALID_TICKET_ID_FORMAT' };

  // Validate level value (adjust allowed levels as needed)
  const validLevels = ['VIP', 'STANDARD', 'CREW', 'ARTIST']; // Example levels; update based on your actual requirements
  if (!validLevels.includes(payload.level)) return { ok: false, code: 'INVALID_LEVEL' };

  return { ok: true };
}

function issueWristband(state, payload) {
  const valid = validateWristbandPayload(payload);
  if (!valid.ok) return valid;
  if (!getTicket(state, payload.ticketId)) return { ok:false, code:'TICKET_NOT_FOUND' };
  if (state.wristbands.some(w => w.id === payload.id)) return { ok:false, code:'WRISTBAND_EXISTS' };
  const wristband = { id:payload.id, ticketId:payload.ticketId, level:payload.level, active:true };
  state.wristbands.push(wristband);
  return { ok:true, wristband };
}

module.exports = { checkAccess, registerEntry, registerExit, validateWristbandPayload, issueWristband };
