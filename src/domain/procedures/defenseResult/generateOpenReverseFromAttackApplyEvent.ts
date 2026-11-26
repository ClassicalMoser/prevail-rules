import type { OpenReverseFromAttackApplyEvent } from '@events';
import {
  GAME_EFFECT_EVENT_TYPE,
  OPEN_REVERSE_FROM_ATTACK_APPLY_EFFECT_TYPE,
} from '@events';

/**
 * Builds the open-reverse-from-attack-apply effect. The attack already
 * measured a reverse, and the apply it opens on is the state's to name
 * (`getAttackApplyAwaitingOpen`), so the event carries nothing.
 *
 * @returns The event
 */
export function generateOpenReverseFromAttackApplyEvent(): OpenReverseFromAttackApplyEvent {
  // Nothing to measure: the reverse was measured with the attack.
  const event: OpenReverseFromAttackApplyEvent = {
    effectType: OPEN_REVERSE_FROM_ATTACK_APPLY_EFFECT_TYPE,
    eventType: GAME_EFFECT_EVENT_TYPE,
  };

  // The reverse to open. Whether the unit then turns is judged when it
  // resolves, from where it stands after any retreat (§7.5.4, §7.5.5).
  return event;
}
