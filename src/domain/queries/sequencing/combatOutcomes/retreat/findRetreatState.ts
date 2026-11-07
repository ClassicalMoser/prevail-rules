import type { GameState, RetreatState } from '@game';
import { isFriendlyUnit } from '@queries/unit';
import { getFrontEngagementRetreatState } from './getFrontEngagementRetreatState';
import { getMeleeRetreatState } from './getMeleeRetreatState';
import { getRangedAttackRetreatState } from './getRangedAttackRetreatState';

/**
 * Finds the retreat state from the current game state context.
 * Searches in: ranged attack resolution, front engagement (movement), or melee.
 * Assumes a retreat state exists (validation should happen elsewhere).
 *
 * @param state - The game state
 * @param player - The player whose retreat state to find
 * @returns The retreat state
 * @throws Error if retreat state not found in any context
 */
export function findRetreatState(
  state: GameState,
  player: 'white' | 'black',
): RetreatState {
  const phaseState = state.currentRoundState.currentPhaseState;
  if (phaseState === 'none') {
    throw new Error('No current phase state found');
  }

  // Issue-commands can hold a ranged retreat or a front-engagement retreat.
  // A miss in one search continues to the next. The retreat must belong to `player`.
  if (phaseState.phase === 'issueCommands') {
    try {
      const retreatState = getRangedAttackRetreatState(state);
      if (isFriendlyUnit(retreatState.retreatingUnit.unit, player)) {
        return retreatState;
      }
    } catch {
      // Not in ranged attack or no retreat state, continue
    }

    try {
      const retreatState = getFrontEngagementRetreatState(state);
      if (isFriendlyUnit(retreatState.retreatingUnit.unit, player)) {
        return retreatState;
      }
    } catch {
      // Not in front engagement retreat, continue
    }
  }

  // Melee stores one retreat per side. The player argument selects the side.
  if (phaseState.phase === 'resolveMelee') {
    try {
      const retreatState = getMeleeRetreatState(state, player);
      return retreatState;
    } catch {
      // Not found, continue
    }
  }

  throw new Error(`No retreat state found for player ${player}`);
}
