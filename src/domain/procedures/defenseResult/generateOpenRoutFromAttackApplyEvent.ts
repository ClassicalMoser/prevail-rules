import type { OpenRoutFromAttackApplyEvent } from '@events';
import type { GameState } from '@game';
import {
  GAME_EFFECT_EVENT_TYPE,
  OPEN_ROUT_FROM_ATTACK_APPLY_EFFECT_TYPE,
} from '@events';
import { getAttackApplyAwaitingOpen } from '@queries';

/**
 * Builds the open-rout-from-attack-apply effect. The attack already
 * measured a rout; the apply it opens on is the state's to name, so the event
 * carries nothing, and asking for that apply here is the check that one is
 * waiting.
 *
 * @param state - A shot or a melee with a rout waiting to open
 * @returns The event
 * @throws Error when no rout is waiting to open
 */
export function generateOpenRoutFromAttackApplyEvent(
  state: GameState,
): OpenRoutFromAttackApplyEvent {
  // A rout must be waiting to open, or the effect is not owed.
  getAttackApplyAwaitingOpen(state, 'rout');

  const event: OpenRoutFromAttackApplyEvent = {
    effectType: OPEN_ROUT_FROM_ATTACK_APPLY_EFFECT_TYPE,
    eventType: GAME_EFFECT_EVENT_TYPE,
  };
  return event;
}
