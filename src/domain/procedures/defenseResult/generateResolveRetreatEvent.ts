import type { ResolveRetreatEvent } from '@events';
import type { GameState, RetreatState } from '@game';
import { GAME_EFFECT_EVENT_TYPE, RESOLVE_RETREAT_EFFECT_TYPE } from '@events';
import {
  getCurrentPhaseState,
  getFrontEngagementRetreatState,
  getRangedAttackRetreatState,
  getNextMeleeRetreatStateAwaitingMove,
} from '@queries';

/**
 * Generates a ResolveRetreatEvent by reading the finalPosition from the retreat state.
 * The finalPosition is already determined (either auto-selected if single option,
 * or chosen by player via chooseRetreatOption if multiple options).
 *
 * This is a **convergence event** that performs the actual unit movement on the board.
 *
 * @param state - The current game state
 * @returns A complete ResolveRetreatEvent with the retreating unit and final position
 */
export function generateResolveRetreatEvent(
  state: GameState,
  eventNumber: number,
): ResolveRetreatEvent {
  const phaseState = getCurrentPhaseState(state);

  let retreatState: RetreatState;
  if (phaseState.phase === 'issueCommands') {
    // TODO(composition): any ranged fault, including a retreat not yet opened,
    // falls through to the front engagement. `findRetreatState` walks both
    // parents without throwing but needs a player. Settled by passing the
    // retreating player, or a player-free total query.
    try {
      retreatState = getRangedAttackRetreatState(state);
    } catch {
      retreatState = getFrontEngagementRetreatState(state);
    }
  } else if (phaseState.phase === 'resolveMelee') {
    retreatState = getNextMeleeRetreatStateAwaitingMove(state);
  } else {
    throw new Error(
      `Retreat resolution not expected in phase: ${phaseState.phase}`,
    );
  }

  // The retreat to carry out was chosen, or was the only one.
  const chosen = retreatState.chosenRetreat;
  if (chosen === 'pending') {
    throw new Error('No retreat has been chosen yet');
  }

  const gameEffectEvent: ResolveRetreatEvent = {
    effectType: RESOLVE_RETREAT_EFFECT_TYPE,
    eventNumber,
    eventType: GAME_EFFECT_EVENT_TYPE,
    finalPosition: {
      placement: chosen.placement,
      unit: retreatState.retreatingUnit.unit,
    },
    path: chosen.path,
    startingPosition: retreatState.retreatingUnit,
  };

  return gameEffectEvent;
}
