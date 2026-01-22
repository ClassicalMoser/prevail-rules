import type {
  Board,
  ExpectedEventInfo,
  GameState,
  IssueCommandsPhaseState,
  PlayerSide,
} from '@entities';
import { getExpectedMovementResolutionEvent } from './getExpectedMovementResolutionEvent';
import { getExpectedRangedAttackResolutionEvent } from './getExpectedRangedAttackResolutionEvent';

/**
 * Gets the expected event for the next substep in an ongoing command resolution.
 *
 * @param gameState - The game state, needed to read what's happening on the board
 * @param resolutionState - The current command resolution state
 * @param resolvingPlayer - The player currently resolving commands
 * @returns Information about what event is expected
 */
export function getExpectedCommandResolutionSubstepEvent<TBoard extends Board>(
  gameState: GameState<TBoard>,
  resolutionState: IssueCommandsPhaseState<TBoard>['currentCommandResolutionState'],
  resolvingPlayer: PlayerSide,
): ExpectedEventInfo<TBoard> {
  if (!resolutionState) {
    throw new Error('No command resolution state found');
  }

  // Handle movement resolution substeps
  if (resolutionState.commandResolutionType === 'movement') {
    return getExpectedMovementResolutionEvent(
      gameState,
      resolutionState,
      resolvingPlayer,
    );
  }

  // Handle ranged attack resolution substeps
  if (resolutionState.commandResolutionType === 'rangedAttack') {
    return getExpectedRangedAttackResolutionEvent(
      resolutionState,
      resolvingPlayer,
    );
  }

  // Exhaustiveness check
  const _exhaustive: never = resolutionState;
  throw new Error(
    `Invalid command resolution type: ${(_exhaustive as { commandResolutionType: string }).commandResolutionType}`,
  );
}
