import type {
  Coordinate,
  UnitFacing,
  UnitPlacement,
  UnitWithPlacement,
} from '@entities';
import type { GameState } from '@game';
import {
  getCurrentUnitStat,
  getFacingsOneTurnAway,
  getForwardSpace,
  getOppositeFacing,
  getRearwardSpace,
  getSpacesBehind,
  isDiagonalFacing,
} from '@queries';
import { canMoveInto } from './canMoveInto';
import { canMoveThrough } from './canMoveThrough';
import { checkDiagonalMove } from './checkDiagonalMove';

/**
 * Represents the result of an explored move.
 */
export interface MoveResult {
  /** The placement of the unit after the move. */
  placement: UnitPlacement;
  /** The amount of flexibility used to reach the placement. */
  flexibilityUsed: number;
  /** The amount of speed used to reach the placement. */
  speedUsed: number;
}

/**
 * Explores every placement a unit's move may legally end on, by walking the
 * state graph of §5. From any point in a move a unit can do only two things:
 * step 1 Speed into the space it faces (§5.1.2, §5.1.3), or spend
 * 1 Flexibility to turn 45° either way or about (§5.2.1). Turns and steps
 * come in any order and may repeat (§5.2.2), so the walk applies both edges
 * from every state until the two allowances run out.
 *
 * A retreat walks the same graph under two extra constraints: every space it
 * passes through or ends on lies behind the starting rank (§9.1.2, and it
 * may not end where it started), and before its first step back it may turn
 * by at most 45° in all, never about (§9.1.4) — after the first step the
 * ordinary turn rule applies.
 *
 * @param gameState - The current game state
 * @param unitWithPlacement - The unit and its starting position
 * @param direction - The direction of movement: 'advance' or 'retreat'
 * @returns Set of all explored move destinations with their metadata, including the amount of flexibility and speed used to reach each destination
 */
export function exploreUnitMoves(
  gameState: GameState,
  unitWithPlacement: UnitWithPlacement,
  direction: 'advance' | 'retreat',
): Set<MoveResult> {
  // The type names the two directions, but a caller outside the type system
  // (a test, a wire payload) still gets a clear fault rather than a walk
  // that silently explores nothing.
  if (direction !== 'advance' && direction !== 'retreat') {
    throw new Error('Invalid direction');
  }

  const board = gameState.boardState;
  const { placement: initialPlacement, unit } = unitWithPlacement;
  const initialCoordinate = initialPlacement.coordinate;
  const initialFacing = initialPlacement.facing;
  const unitSide = unit.playerSide;

  // The move's whole budget is sampled here, once, where the move begins
  // (§5.1.4): current Speed for stepping, current Flexibility for turning.
  const totalFlexibility = getCurrentUnitStat(unit, 'flexibility', gameState);
  const totalSpeed = getCurrentUnitStat(unit, 'speed', gameState);

  // A retreat moves rearward, away from the facing; an advance follows it.
  const getSpaceInDirection =
    direction === 'advance' ? getForwardSpace : getRearwardSpace;

  // A retreat is confined to the half of the board behind the unit's
  // starting rank (§2.3.2, §9.1.2). The start space is not behind its own
  // rank, so "may not end where it started" comes with the region.
  const validRetreatSpaces = getSpacesBehind(
    board,
    initialCoordinate,
    initialFacing,
  );

  // States are keyed with the budgets still unspent: the same placement
  // reached with more allowance left is a genuinely different prospect,
  // because it has more move left to spend from there.
  const visitedStates = new Set<string>();
  const getStateKey = (
    coordinate: Coordinate,
    facing: UnitFacing,
    remainingSpeed: number,
    remainingFlexibility: number,
  ): string =>
    `${coordinate}|${facing}|${remainingSpeed}|${remainingFlexibility}`;

  const results = new Set<MoveResult>();

  /**
   * Judges a space the move cannot continue from — an enemy to engage, or
   * ground that stops the unit — as an endpoint, without exploring onward.
   */
  const includeEndpointOnly = (
    coordinate: Coordinate,
    facing: UnitFacing,
    cameFrom: Coordinate,
    remainingSpeed: number,
    remainingFlexibility: number,
  ): void => {
    const isLegalEnd =
      canMoveInto(
        unitSide,
        board,
        coordinate,
        cameFrom,
        initialCoordinate,
        facing,
        remainingFlexibility,
        direction,
      ) &&
      (direction === 'advance' || validRetreatSpaces.has(coordinate));
    if (isLegalEnd) {
      results.add({
        flexibilityUsed: totalFlexibility - remainingFlexibility,
        placement: { coordinate, facing },
        speedUsed: totalSpeed - remainingSpeed,
      });
    }
  };

  /**
   * One state of the move in progress. `cameFrom` is the space the last step
   * left; engaging legality reads the step's origin (§6.2), and turning never
   * changes it. It stays out of the visited key because a move never
   * continues from an enemy's space — stepping into an enemy ends the move —
   * so the origin can only matter on the step edge that proposes the ending.
   */
  const explore = (
    coordinate: Coordinate,
    facing: UnitFacing,
    cameFrom: Coordinate,
    remainingSpeed: number,
    remainingFlexibility: number,
  ): void => {
    const stateKey = getStateKey(
      coordinate,
      facing,
      remainingSpeed,
      remainingFlexibility,
    );
    if (visitedStates.has(stateKey)) {
      return;
    }
    visitedStates.add(stateKey);

    const speedUsed = totalSpeed - remainingSpeed;
    const flexibilityUsed = totalFlexibility - remainingFlexibility;

    // ── May the move end on this state? ──────────────────────────────────
    if (coordinate === initialCoordinate && speedUsed === 0) {
      // Standing in place, turned or not, is a legal advance: the unit's own
      // space needs no one's permission. A retreat must actually fall back,
      // so its starting space is never an endpoint (§9.1.2).
      if (direction === 'advance') {
        results.add({
          flexibilityUsed,
          placement: { coordinate, facing },
          speedUsed,
        });
      }
    } else if (coordinate !== initialCoordinate) {
      // Elsewhere, the ground decides: open ground may be rested on, a
      // friend's space only passed through (§5.3), and an enemy's space
      // entered only as an engagement legal from the space the step left
      // (§6.2) — which is why the ending is judged against `cameFrom`.
      const isLegalEnd =
        canMoveInto(
          unitSide,
          board,
          coordinate,
          cameFrom,
          initialCoordinate,
          facing,
          remainingFlexibility,
          direction,
        ) &&
        (direction === 'advance' || validRetreatSpaces.has(coordinate));
      if (isLegalEnd) {
        results.add({
          flexibilityUsed,
          placement: { coordinate, facing },
          speedUsed,
        });
      }
    }

    // ── Turn edge: 1 Flexibility, 45° either way or about (§5.2.1) ───────
    if (remainingFlexibility > 0) {
      // Before its first step back, a retreat may turn at most 45° in all
      // and never about (§9.1.4): one turn, to a neighbour of the facing it
      // started with. A second pre-step turn would stack to 90°, so once the
      // facing has left the initial one, pre-step turning is spent.
      const preStepRetreat =
        direction === 'retreat' && coordinate === initialCoordinate;
      let turnTargets: Set<UnitFacing>;
      if (!preStepRetreat) {
        turnTargets = getFacingsOneTurnAway(facing);
      } else if (facing === initialFacing) {
        turnTargets = getFacingsOneTurnAway(initialFacing);
        // The about-turn is the one §5.2.1 option a retreat's opening turn
        // does not get: a retreat never begins by facing the other way.
        turnTargets.delete(getOppositeFacing(initialFacing));
      } else {
        // The one pre-step turn has been taken.
        turnTargets = new Set<UnitFacing>();
      }
      for (const newFacing of turnTargets) {
        explore(
          coordinate,
          newFacing,
          cameFrom,
          remainingSpeed,
          remainingFlexibility - 1,
        );
      }
    }

    // ── Step edge: 1 Speed, into the faced space (§5.1.2, §5.1.3) ────────
    if (remainingSpeed > 0) {
      const nextCoordinate = getSpaceInDirection(board, coordinate, facing);
      // The board edge simply ends the walk in this direction.
      if (nextCoordinate === undefined) {
        return;
      }

      // A diagonal step must pass between the two corner spaces flanking
      // the diagonal (§5.4.5) — slipping between two units standing corner
      // to corner is not allowed.
      const { result: isDiagonal } = isDiagonalFacing(facing);
      if (isDiagonal) {
        const canReachTarget = checkDiagonalMove(
          unitSide,
          totalFlexibility,
          gameState,
          coordinate,
          nextCoordinate,
          facing,
        );
        if (!canReachTarget) {
          return;
        }
      }

      // A retreat may not pass through ground that is not behind its rank
      // (§9.1.2), and whatever cannot be passed through ends the walk —
      // ending there, if legal, was already judged when the state is
      // visited below.
      const mayContinue =
        canMoveThrough(unitSide, totalFlexibility, nextCoordinate, gameState) &&
        (direction === 'advance' || validRetreatSpaces.has(nextCoordinate));

      if (mayContinue) {
        explore(
          nextCoordinate,
          facing,
          coordinate,
          remainingSpeed - 1,
          remainingFlexibility,
        );
      } else {
        // The space stops the move, but it may still be where the move
        // ends — an enemy to engage, most importantly. Judge it as an
        // endpoint without walking on from it.
        includeEndpointOnly(
          nextCoordinate,
          facing,
          coordinate,
          remainingSpeed - 1,
          remainingFlexibility,
        );
      }
    }
  };

  explore(
    initialCoordinate,
    initialFacing,
    initialCoordinate,
    totalSpeed,
    totalFlexibility,
  );

  return results;
}
