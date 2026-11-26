import type { OpenRoutFromAttackApplyEvent } from '@events';
import {
  GAME_EFFECT_EVENT_TYPE,
  OPEN_ROUT_FROM_ATTACK_APPLY_EFFECT_TYPE,
} from '@events';

/**
 * Builds the open-rout-from-attack-apply effect. The attack already measured
 * a rout, and the apply it opens on is the state's to name
 * (`getAttackApplyAwaitingOpen`), so the event carries nothing.
 *
 * @returns The event
 */
export function generateOpenRoutFromAttackApplyEvent(): OpenRoutFromAttackApplyEvent {
  // Nothing to measure: the rout was measured with the attack.
  const event: OpenRoutFromAttackApplyEvent = {
    effectType: OPEN_ROUT_FROM_ATTACK_APPLY_EFFECT_TYPE,
    eventType: GAME_EFFECT_EVENT_TYPE,
  };

  // The rout to open. It comes last of the unit's results (§7.5.3), and the
  // unit leaves the board as it opens (§9.3.1).
  return event;
}
