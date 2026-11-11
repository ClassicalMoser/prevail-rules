import type { OpenReverseFromAttackApplyEvent } from '@events';
import type { GameState } from '@game';
import {
  GAME_EFFECT_EVENT_TYPE,
  OPEN_REVERSE_FROM_ATTACK_APPLY_EFFECT_TYPE,
} from '@events';
import { getAttackApplyAwaitingOpen } from '@queries';

/**
 * Builds the open-reverse-from-attack-apply effect. The attack already
 * measured a reverse; the apply it opens on is the state's to name, so the event
 * carries nothing, and asking for that apply here is the check that one is
 * waiting.
 *
 * @param state - A shot or a melee with a reverse waiting to open
 * @returns The event
 * @throws Error when no reverse is waiting to open
 */
export function generateOpenReverseFromAttackApplyEvent(
  state: GameState,
): OpenReverseFromAttackApplyEvent {
  // A reverse must be waiting to open, or the effect is not owed.
  getAttackApplyAwaitingOpen(state, 'reverse');

  const event: OpenReverseFromAttackApplyEvent = {
    effectType: OPEN_REVERSE_FROM_ATTACK_APPLY_EFFECT_TYPE,
    eventType: GAME_EFFECT_EVENT_TYPE,
  };
  return event;
}
