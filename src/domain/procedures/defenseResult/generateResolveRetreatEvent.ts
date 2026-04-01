import type { Board } from '@entities';
import type { ResolveRetreatEvent } from '@events';
import type { GameStateWithBoard, RetreatState } from '@game';
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
export function generateResolveRetreatEvent<TBoard extends Board>(
  state: GameStateWithBoard<TBoard>,
  eventNumber: number,
): ResolveRetreatEvent<TBoard, 'resolveRetreat'> {
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

  const finalPlacement = retreatState.finalPosition!;

  return {
    eventType: GAME_EFFECT_EVENT_TYPE,
    effectType: RESOLVE_RETREAT_EFFECT_TYPE,
    eventNumber,
    boardType: retreatState.boardType,
    startingPosition: retreatState.retreatingUnit,
    finalPosition: {
      boardType: retreatState.retreatingUnit.boardType,
      unit: retreatState.retreatingUnit.unit,
      placement: finalPlacement,
    },
  } as unknown as ResolveRetreatEvent<TBoard, 'resolveRetreat'>;
}
