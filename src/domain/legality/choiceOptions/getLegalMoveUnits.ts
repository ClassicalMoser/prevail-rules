import type { PlayerSide, UnitWithPlacement } from '@entities';
import type { GameState } from '@game';
import {
  getBoardSpace,
  getIssueCommandsPhaseState,
  getOtherPlayer,
  findPositionOfUnit,
  hasSingleUnit,
  isFriendlyUnit,
  getRemainingUnitsForPlayer,
} from '@queries';

/**
 * Atomic move-unit selection context: which player is resolving a movement
 * command start, and which remaining units (with board placements) may move.
 *
 * Destinations are not expanded here — use {@link getLegalUnitMoves} per unit.
 * `moveCommander` integrity belongs in {@link isValidMoveUnitEvent}.
 */
export interface LegalMoveUnits {
  player: PlayerSide;
  /**
   * Remaining commanded units that are on the board and free to start a move.
   * Empty when none can, which ends the order with no move made.
   */
  units: readonly UnitWithPlacement[];
}

/**
 * Returns atomic move-unit candidates when issueCommands is awaiting the start
 * of a movement command resolution (CRS pending, remaining units, movement
 * card in play).
 *
 * Engaged units are excluded — they cannot legally start a move.
 * Does not enumerate destinations or moveCommander flags.
 *
 * Nobody able to move is a real answer, an empty list, and the order ends
 * without a move. Being asked outside the start of a movement order is the
 * caller's mistake and throws.
 *
 * @throws Error outside the issue commands phase, off a resolve step, while a
 * command is already being resolved, or when the card in play is not a
 * movement order
 */
export function getLegalMoveUnits<S extends GameState>(
  gameState: S,
): LegalMoveUnits {
  const phaseState = getIssueCommandsPhaseState(gameState);
  if (
    phaseState.step !== 'firstPlayerResolveCommands' &&
    phaseState.step !== 'secondPlayerResolveCommands'
  ) {
    throw new Error(`Not on a resolve commands step: ${phaseState.step}`);
  }
  if (phaseState.currentCommandResolutionState !== 'pending') {
    throw new Error('A command is already being resolved');
  }

  const firstPlayer = gameState.currentInitiative;
  const secondPlayer = getOtherPlayer(firstPlayer);
  const player =
    phaseState.step === 'firstPlayerResolveCommands'
      ? firstPlayer
      : secondPlayer;
  const remainingUnits = getRemainingUnitsForPlayer(gameState, player);

  // The order is the card the player has in play, which lies face up for
  // every viewer (§4.1.2): a seat reads it as plainly as the player does. Only
  // the hand is hidden, and the order does not come from the hand.
  const inPlay = gameState.cardState[player].inPlay;
  if (inPlay === null || inPlay.command.type !== 'movement') {
    throw new Error(`The card ${player} has in play is not a movement order`);
  }

  const units: UnitWithPlacement[] = [];
  for (const unit of remainingUnits) {
    if (!isFriendlyUnit(unit, player)) {
      continue;
    }
    // A unit routed earlier is still listed but no longer on the board.
    const placement = findPositionOfUnit(gameState.boardState, unit);
    if (placement === undefined) {
      continue;
    }
    const presence = getBoardSpace(
      gameState.boardState,
      placement.coordinate,
    ).unitPresence;
    // Engaged units cannot start a movement resolution.
    if (!hasSingleUnit(presence)) {
      continue;
    }
    units.push({ placement, unit });
  }

  const legal: LegalMoveUnits = { player, units };
  return legal;
}
