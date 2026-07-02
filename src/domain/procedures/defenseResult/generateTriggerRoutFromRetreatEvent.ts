import type { Board } from '@entities';
import type { TriggerRoutFromRetreatEvent } from '@events';
import type { GameStateForBoard } from '@game';
import {
  GAME_EFFECT_EVENT_TYPE,
  RANGED_ATTACK_RESOLUTION_CONTEXT,
} from '@events';
import {
  getCurrentPhaseStateForBoard,
  getRetreatStateFromMelee,
  getRetreatStateFromRangedAttack,
} from '@queries';
/**
 * Builds the trigger-rout-from-retreat effect with explicit resolution context
 * so apply does not branch on phase or probe players.
 */
export function generateTriggerRoutFromRetreatEvent<TBoard extends Board>(
  state: GameStateForBoard<TBoard>,
  eventNumber: number,
): TriggerRoutFromRetreatEvent {
  const phaseState = getCurrentPhaseStateForBoard<TBoard>(state);

  if (phaseState.phase === 'issueCommands') {
    getRetreatStateFromRangedAttack(state);
    return {
      effectType: 'triggerRoutFromRetreat',
      eventNumber,
      eventType: GAME_EFFECT_EVENT_TYPE,
      retreatResolutionContext: RANGED_ATTACK_RESOLUTION_CONTEXT,
    };
  }

  if (phaseState.phase === 'resolveMelee') {
    const firstPlayer = state.currentInitiative;
    const secondPlayer = firstPlayer === 'white' ? 'black' : 'white';

    try {
      getRetreatStateFromMelee(state, firstPlayer);
      return {
        effectType: 'triggerRoutFromRetreat',
        eventNumber,
        eventType: GAME_EFFECT_EVENT_TYPE,
        retreatResolutionContext: 'melee',
        retreatingPlayer: firstPlayer,
      };
    } catch {
      getRetreatStateFromMelee(state, secondPlayer);
      return {
        effectType: 'triggerRoutFromRetreat',
        eventNumber,
        eventType: GAME_EFFECT_EVENT_TYPE,
        retreatResolutionContext: 'melee',
        retreatingPlayer: secondPlayer,
      };
    }
  }

  throw new Error(`Retreat rout not expected in phase: ${phaseState.phase}`);
}
