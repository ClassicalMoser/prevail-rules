import type { Command, PlayerSide, UnitWithPlacement } from '@entities';
import type { GameState } from '@game';
import {
  getForwardSpacesToEdge,
  getLeftFacing,
  getOppositeFacing,
  getPlayerUnitWithPosition,
  getRightFacing,
  hasUnitInArray,
  isSameUnitInstance,
} from '@queries';
import { MAX_LINE_LENGTH } from '@ruleValues';

import {
  getLegalLineStartsForIssueCommand,
  unitMatchesTraitAndTypeRestrictions,
} from './getLegalUnitsForIssueCommand';

/**
 * Contiguous segment containing `start`, expanding along flanking directions
 * (same geometry as {@link getLinesFromUnit}), capped at {@link MAX_LINE_LENGTH}.
 * Members other than `start` need trait/type match only — not inspiration range.
 */
export function getLineSegmentFromStart(
  command: Command,
  gameState: GameState,
  start: UnitWithPlacement,
): UnitWithPlacement[] {
  const board = gameState.boardState;
  const player = start.unit.playerSide;
  const facing = start.placement.facing;
  const oppositeFacing = getOppositeFacing(facing);
  const { commandedUnits } = gameState.currentRoundState;
  const { restrictions } = command;

  const canJoin = (
    coordinate: UnitWithPlacement['placement']['coordinate'],
  ): UnitWithPlacement | undefined => {
    const unit = getPlayerUnitWithPosition(board, coordinate, player);
    if (unit === undefined) {
      return;
    }
    if (hasUnitInArray(commandedUnits, unit.unit)) {
      return;
    }
    const unitFacing = unit.placement.facing;
    if (unitFacing !== facing && unitFacing !== oppositeFacing) {
      return;
    }
    if (!unitMatchesTraitAndTypeRestrictions(unit, restrictions)) {
      return;
    }
    return unit;
  };

  const left: UnitWithPlacement[] = [];
  for (const coordinate of getForwardSpacesToEdge(
    board,
    start.placement.coordinate,
    getLeftFacing(facing),
  )) {
    if (left.length + 1 >= MAX_LINE_LENGTH) {
      break;
    }
    const joining = canJoin(coordinate);
    if (joining === undefined) {
      break;
    }
    left.unshift(joining);
  }

  const right: UnitWithPlacement[] = [];
  for (const coordinate of getForwardSpacesToEdge(
    board,
    start.placement.coordinate,
    getRightFacing(facing),
  )) {
    if (left.length + 1 + right.length >= MAX_LINE_LENGTH) {
      break;
    }
    const joining = canJoin(coordinate);
    if (joining === undefined) {
      break;
    }
    right.push(joining);
  }

  return [...left, start, ...right];
}

/**
 * Legal **ends** for a line whose **start** is already chosen: every unit on
 * the contiguous segment from that start (including the start itself — a
 * single-unit line is always legal).
 *
 * Returns `[]` when `start` is not a legal line start (inspiration + traits,
 * when applicable).
 */
export function getLegalLineEndsForIssueCommand(
  command: Command,
  player: PlayerSide,
  gameState: GameState,
  start: UnitWithPlacement,
): UnitWithPlacement[] {
  const legalStarts = getLegalLineStartsForIssueCommand(
    command,
    player,
    gameState,
  );
  const startOk = legalStarts.some(
    (candidate) =>
      isSameUnitInstance(candidate.unit, start.unit).result &&
      candidate.placement.coordinate === start.placement.coordinate,
  );
  if (!startOk) {
    return [];
  }

  return getLineSegmentFromStart(command, gameState, start);
}
