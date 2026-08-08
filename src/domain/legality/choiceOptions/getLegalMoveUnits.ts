import type { PlayerSide, UnitWithPlacement } from '@entities';
import type { GameState } from '@game';
import {
  getOtherPlayer,
  getOwnedPlayerCardState,
  getPositionOfUnit,
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
  const remainingUnits =
    phaseState.step === 'firstPlayerResolveCommands'
      ? phaseState.remainingUnitsFirstPlayer
      : phaseState.remainingUnitsSecondPlayer;

  if (remainingUnits.length === 0) {
    return null;
  }

  let inPlay;
  try {
    inPlay = getOwnedPlayerCardState(gameState.cardState, player).inPlay;
  } catch {
    return null;
  }
  if (inPlay === null || inPlay.command.type !== 'movement') {
    return null;
  }

  const units: UnitWithPlacement[] = [];
  for (const unit of remainingUnits) {
    if (unit.playerSide !== player) {
      continue;
    }
    try {
      const placement = getPositionOfUnit(gameState.boardState, unit);
      units.push({ placement, unit });
    } catch {
      // Not on board (or otherwise unlocatable) — skip.
    }
  }

  if (units.length === 0) {
    return null;
  }

  return { player, units };
}
