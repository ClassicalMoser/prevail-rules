import type { PlayerSide } from '@entities';
import type { ExpectedEventInfo } from '@events';
import type { CommandResolutionState, GameState } from '@game';
import { getExpectedMovementResolutionEvent } from './getExpectedMovementResolutionEvent';
import { getExpectedRangedAttackResolutionEvent } from './getExpectedRangedAttackResolutionEvent';

/**
 * Gets the expected event for the next substep in an ongoing command resolution.
 *
 * Phase 3 carries out a player's orders one unit at a time (§4.3.9). A card's
 * command is either a Move or a Shoot (§4.3.1), and each kind of order has
 * its own sequence of choices and effects, so this hands the order under way
 * to the sequencer for its kind. The Issue Commands phase sequencer asks it
 * once it has found an order being carried out.
 *
 * @param gameState - The game state, needed to read what's happening on the board
 * @param resolutionState - The current command resolution state
 * @param resolvingPlayer - The player currently resolving commands
 * @returns Information about what event is expected
 */
export function getExpectedCommandResolutionEvent(
  gameState: GameState,
  resolutionState: CommandResolutionState,
  resolvingPlayer: PlayerSide,
): ExpectedEventInfo {
  // The kind of order under way, read once so that a kind no card gives can
  // still be named when it is refused below.
  const kind = resolutionState.commandResolutionType;
  switch (kind) {
    // A Move order: the unit's commitment, its move, and any engagement the
    // move starts (§4.3.10).
    case 'movement': {
      const movementEvent = getExpectedMovementResolutionEvent(
        gameState,
        resolutionState,
        resolvingPlayer,
      );
      return movementEvent;
    }

    // A Shoot order: the shooter's commitment, its target, the target's
    // commitment and the shot (§4.3.11).
    case 'rangedAttack': {
      const rangedAttackEvent = getExpectedRangedAttackResolutionEvent(
        gameState,
        resolutionState,
        resolvingPlayer,
      );
      return rangedAttackEvent;
    }

    // No card gives any other kind of order, so another is a corrupt state.
    default: {
      const _exhaustive: never = kind;
      throw new Error(
        `Invalid command resolution type: ${String(_exhaustive)}`,
      );
    }
  }
}
