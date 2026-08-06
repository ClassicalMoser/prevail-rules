import type { UnitPlacement } from '@entities';
import type { ResolveRetreatEvent } from '@events';
import type { GameState, RetreatState } from '@game';
import { GAME_EFFECT_EVENT_TYPE, RESOLVE_RETREAT_EFFECT_TYPE } from '@events';
import {
  getCurrentPhaseState,
  getRetreatStateFromRangedAttack,
  getRetreatStateReadyForResolveFromMelee,
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
    retreatState = getRetreatStateFromRangedAttack(state);
  } else if (phaseState.phase === 'resolveMelee') {
    retreatState = getRetreatStateReadyForResolveFromMelee(state);
  } else {
    throw new Error(
      `Retreat resolution not expected in phase: ${phaseState.phase}`,
    );
  }

  if (retreatState.finalPosition === 'pending') {
    throw new Error('Retreat state has no final position');
  }

  const finalPlacement: UnitPlacement = retreatState.finalPosition;

  const gameEffectEvent: ResolveRetreatEvent = {
    effectType: RESOLVE_RETREAT_EFFECT_TYPE,
    eventNumber,
    eventType: GAME_EFFECT_EVENT_TYPE,
    finalPosition: {
      placement: finalPlacement,
      unit: retreatState.retreatingUnit.unit,
    },
    startingPosition: retreatState.retreatingUnit,
  };

  return gameEffectEvent;
}
