import type { PlayerSide, UnitWithPlacement } from '@entities';
import type { GameState } from '@game';
import {
  getBoardSpace,
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
 *
 * `null` when a moveUnit choice is not expected.
 */
export interface LegalMoveUnits {
  player: PlayerSide;
  /** Remaining commanded units that are on the board and free to start a move. */
  units: readonly UnitWithPlacement[];
}

/**
 * Returns atomic move-unit candidates when issueCommands is awaiting the start
 * of a movement command resolution (CRS pending, remaining units, movement
 * card in play).
 *
 * Engaged units are excluded — they cannot legally start a move.
 * Does not enumerate destinations or moveCommander flags.
 */
export function getLegalMoveUnits<S extends GameState>(
  gameState: S,
): LegalMoveUnits | null {
  const phaseState = gameState.currentRoundState.currentPhaseState;
  if (phaseState === 'none' || phaseState.phase !== 'issueCommands') {
    return null;
  }
  if (
    phaseState.step !== 'firstPlayerResolveCommands' &&
    phaseState.step !== 'secondPlayerResolveCommands'
  ) {
    return null;
  }
  if (phaseState.currentCommandResolutionState !== 'pending') {
    return null;
  }

  const firstPlayer = gameState.currentInitiative;
  const secondPlayer = getOtherPlayer(firstPlayer);
  const player =
    phaseState.step === 'firstPlayerResolveCommands'
      ? firstPlayer
      : secondPlayer;
  const remainingUnits = getRemainingUnitsForPlayer(gameState, player);

  if (remainingUnits.length === 0) {
    return null;
  }

  // The order is the card the player has in play, which lies face up for
  // every viewer (§4.1.2): a seat reads it as plainly as the player does. Only
  // the hand is hidden, and the order does not come from the hand.
  const inPlay = gameState.cardState[player].inPlay;
  if (inPlay === null || inPlay.command.type !== 'movement') {
    return null;
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

  if (units.length === 0) {
    return null;
  }

  return { player, units };
}
