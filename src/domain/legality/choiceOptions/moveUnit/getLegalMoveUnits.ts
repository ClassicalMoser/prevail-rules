import type { PlayerSide, UnitWithPlacement } from '@entities';
import type { GameState } from '@game';
import {
  getBoardSpace,
  getCardInPlay,
  getCommandingPlayer,
  getIssueCommandsPhaseState,
  findPositionOfUnit,
  hasSingleUnit,
  isFriendlyUnit,
  getRemainingUnitsForPlayer,
} from '@queries';
import { isPending } from '@utils';

// TODO(misleading): the choice this offers is `chooseMovingUnit`, and its
// validator is `isValidChooseMovingUnitEvent`, but the name says "move units".
// Settled by a name that follows the choice (`getLegalChooseMovingUnit…`).
/**
 * Atomic move-unit selection context: which player is resolving a movement
 * command start, and which remaining units (with board placements) may move.
 *
 * Destinations are not expanded here — use `getLegalUnitMoves` per unit.
 * `moveCommander` integrity belongs in `isValidMoveUnitEvent`.
 */
export interface LegalMoveUnits {
  /** The player carrying out the Move order, who names the unit to move next. */
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
  // A unit is chosen to move only while a player is carrying out their
  // orders (§4.3.9), not while they are issuing them.
  const phaseState = getIssueCommandsPhaseState(gameState);
  if (
    phaseState.step !== 'firstPlayerResolveCommands' &&
    phaseState.step !== 'secondPlayerResolveCommands'
  ) {
    throw new Error(`Not on a resolve commands step: ${phaseState.step}`);
  }

  // Each unit is finished before the next begins (§4.3.9), so the next is
  // chosen only between them.
  if (!isPending(phaseState.currentCommandResolutionState)) {
    throw new Error('A command is already being resolved');
  }

  // The first player carries out all their orders, then the second (§4.3).
  const player = getCommandingPlayer(gameState);

  // The units this player's order named that have not yet acted (§4.3.9).
  const remainingUnits = getRemainingUnitsForPlayer(gameState, player);

  // The order is the card the player has in play, which lies face up for
  // every viewer (§4.1.2): a seat reads it as plainly as the player does. Only
  // the hand is hidden, and the order does not come from the hand.
  const inPlay = getCardInPlay(gameState.cardState, player);
  if (inPlay.command.type !== 'movement') {
    throw new Error(`The card ${player} has in play is not a movement order`);
  }

  const units: UnitWithPlacement[] = [];
  for (const unit of remainingUnits) {
    // TODO(composition): a soft guard. The remaining list is the player's own
    // ordered units, so an enemy in it is a fault in whatever wrote it, and
    // skipping hides that fault (DESIGN.md, "Faults and absence"). Settled by
    // dropping the check, or by throwing where the list is written.
    if (!isFriendlyUnit(unit, player)) {
      continue;
    }
    // A unit routed earlier is still listed but no longer on the board.
    // TODO(composition): this finds the placement, then walks to the space a
    // second time for its presence; `findUnitWithPlacementOnBoard` answers the
    // unit and placement in one walk. Settled by using it with
    // `hasEngagedUnits`, once it is agreed the offer may carry the board's
    // copy of the unit rather than the remaining list's.
    const placement = findPositionOfUnit(gameState, unit);
    if (placement === undefined) {
      continue;
    }
    const presence = getBoardSpace(
      gameState.boardState,
      placement.coordinate,
    ).unitPresence;
    // Engaged units cannot start a movement resolution.
    // A unit locked in a fight cannot move until it ends (§6.1.2).
    if (!hasSingleUnit(presence)) {
      continue;
    }
    units.push({ placement, unit });
  }

  // Who chooses, and which units they may name; `getLegalUnitMoves` then
  // lists where the chosen one may go.
  const legal: LegalMoveUnits = { player, units };
  return legal;
}
