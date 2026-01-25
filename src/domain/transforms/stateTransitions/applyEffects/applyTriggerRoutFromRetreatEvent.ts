import type { Board, GameState, RoutState } from '@entities';
import type { TriggerRoutFromRetreatEvent } from '@events';
import {
  getRetreatStateFromMelee,
  getRetreatStateFromRangedAttack,
} from '@queries';
import { updateRetreatRoutState } from '@transforms/pureTransforms';

/**
 * Applies a TriggerRoutFromRetreatEvent to the game state.
 * Creates a rout state in the retreat state when there are no legal retreat options.
 *
 * @param event - The trigger rout from retreat event to apply
 * @param state - The current game state
 * @returns A new game state with the rout state created in the retreat state
 */
export function applyTriggerRoutFromRetreatEvent<TBoard extends Board>(
  event: TriggerRoutFromRetreatEvent<TBoard>,
  state: GameState<TBoard>,
): GameState<TBoard> {
  const phaseState = state.currentRoundState.currentPhaseState;
  if (!phaseState) {
    throw new Error('No current phase state found');
  }

  // Get the retreat state based on the current phase
  let retreatState;
  if (phaseState.phase === 'issueCommands') {
    // Ranged attack resolution - only one retreat state possible
    retreatState = getRetreatStateFromRangedAttack(state);
  } else if (phaseState.phase === 'resolveMelee') {
    // Melee resolution - need to find which player is retreating
    // Try first player (current initiative)
    const firstPlayer = state.currentInitiative;
    try {
      retreatState = getRetreatStateFromMelee(state, firstPlayer);
    } catch {
      // Try second player
      const secondPlayer = firstPlayer === 'white' ? 'black' : 'white';
      retreatState = getRetreatStateFromMelee(state, secondPlayer);
    }
  } else {
    throw new Error(`Retreat rout not expected in phase: ${phaseState.phase}`);
  }

  // Create rout state for the retreating unit
  const routState: RoutState = {
    substepType: 'rout',
    player: retreatState.retreatingUnit.unit.playerSide,
    unitsToRout: new Set([retreatState.retreatingUnit.unit]),
    numberToDiscard: undefined,
    cardsChosen: false,
    completed: false,
  };

  // Update the retreat state with rout state using the pure transform
  return updateRetreatRoutState(state, routState);
}
