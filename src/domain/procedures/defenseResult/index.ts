// An attack's results are carried out retreat, then reverse, then rout
// (§7.5.2); each opens on its turn and is then resolved.

// The retreat opens, recording the ways back the unit may take (§9.1.3).
export { generateOpenRetreatFromAttackApplyEvent } from './generateOpenRetreatFromAttackApplyEvent';
// The unit falls back along its settled path (§9.1).
export { generateResolveRetreatEvent } from './generateResolveRetreatEvent';
// A unit with nowhere to fall back to routs instead (§9.1.6).
export { generateTriggerRoutFromRetreatEvent } from './generateTriggerRoutFromRetreatEvent';
// The reverse opens, after any retreat has moved the unit (§7.5.4).
export { generateOpenReverseFromAttackApplyEvent } from './generateOpenReverseFromAttackApplyEvent';
// The unit turns about, or holds its facing while still engaged (§7.5.5).
export { generateResolveReverseEvent } from './generateResolveReverseEvent';
// The rout opens, last of the unit's results (§7.5.3).
export { generateOpenRoutFromAttackApplyEvent } from './generateOpenRoutFromAttackApplyEvent';
// The owner's Morale penalty for every rout, however it came (§9.3.2).
export { generateResolveRoutEvent } from './generateResolveRoutEvent';
