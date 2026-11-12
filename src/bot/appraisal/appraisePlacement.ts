import type {
  Board,
  Coordinate,
  UnitPlacement,
  UnitWithPlacement,
} from '@entities';
import type { GameState } from '@game';
import type { BotTemperament } from '@bot/temperament';
import type { BattlefieldSurvey } from './battlefieldSurvey';
import {
  findEngagementType,
  findForwardSpace,
  getMeleeSupportValue,
  getFlankingSpaces,
  getOppositeFacing,
  hasUnitInArray,
  isDiagonalFacing,
  isSameUnitInstance,
} from '@queries';
import { removeUnitFromBoard } from '@transforms';
import { appraiseMelee, lossFromResult } from './appraiseCombat';
import { recallStat } from './recallStat';
import { boardDistance, facingAlignment } from './boardDistance';

/** Points for each space a unit stands nearer the distance it wants. */
const POINTS_PER_SPACE = 1.5;

/** Points for standing squarely toward the nearest enemy. */
const POINTS_FOR_FACING = 2;

/** Points for each friend standing next to it, where it can lend support. */
const POINTS_PER_NEIGHBOUR = 0.25;

/**
 * Points for each friend shoulder to shoulder with it in a line: beside it
 * and facing the same way, or exactly the opposite way (§4.3.5).
 */
const POINTS_PER_SHOULDER = 2;

/** Points lost for ending turned on the diagonal, out of any line. */
const POINTS_FOR_DIAGONAL = 1;

/** How far from its general a unit still counts as within reach of orders. */
const INSPIRATION_REACH = 2;

/**
 * The board with one unit lifted off it, remembered for the length of one
 * decision. A unit cannot support its own fight (§7.3.1), so whenever the bot
 * imagines a unit fighting from somewhere else, it counts support on a board
 * without that unit. Each decision has its own survey, so the memory goes
 * with it.
 */
const boardsWithout = new WeakMap<BattlefieldSurvey, Map<string, Board>>();

function boardWithout(
  view: GameState,
  survey: BattlefieldSurvey,
  unit: UnitWithPlacement,
): Board {
  let boards = boardsWithout.get(survey);
  if (boards === undefined) {
    boards = new Map();
    boardsWithout.set(survey, boards);
  }
  const key = unit.placement.coordinate;
  let board = boards.get(key);
  if (board === undefined) {
    board = removeUnitFromBoard(view.boardState, unit);
    boards.set(key, board);
  }
  return board;
}

/**
 * What ending a move in an enemy's space is worth: the engagement it starts.
 * Its kind is read from the two facings (§6.3.1). From behind, the defender
 * routs on the spot (§6.3.3). From the flank or the front the two fight in
 * Phase 4, and from the front a faster defender may fall back instead
 * (§6.3.2), so the fight it promises is only half as sure.
 *
 * Support decides most fights between equals (§7.3), so it is counted: the
 * mover's friends around the space it ends in, on the board as it would be
 * once the mover has left its own space, and the defender's friends around
 * it as they stand. The board will have changed by Phase 4 (§7.3.3); this is
 * the bot's estimate.
 */
function appraiseEngagement(
  view: GameState,
  survey: BattlefieldSurvey,
  mover: UnitWithPlacement,
  placement: UnitPlacement,
  defender: UnitWithPlacement,
  temperament: BotTemperament,
): number {
  const { unit } = mover;
  const kind = findEngagementType(placement.facing, defender.placement.facing);
  let value: number;
  if (kind === 'rear') {
    // A rear charge breaks the defender outright, at no risk to the charger.
    value = lossFromResult(defender.unit, {
      unitRetreated: false,
      unitReversed: false,
      unitRouted: true,
    });
  } else {
    // The mover is lifted off its own space, so it cannot support itself.
    const boardAfterMove = boardWithout(view, survey, mover);
    const ownSupport = getMeleeSupportValue(boardAfterMove, {
      placement,
      unit,
    });
    const enemySupport = getMeleeSupportValue(view.boardState, defender);
    value = appraiseMelee(
      view,
      { support: ownSupport, unit },
      { support: enemySupport, unit: defender.unit },
    );
    const outpaced =
      recallStat(view, defender.unit, 'speed') >
      recallStat(view, unit, 'speed');
    if (kind === 'front' && outpaced) {
      value /= 2;
    }
  }
  // An aggressive bot values a good fight more; one that shuns risk fears a
  // bad fight more.
  const weighted =
    value >= 0
      ? value * (0.5 + temperament.aggression)
      : value * (1.5 - temperament.riskTolerance);
  return weighted;
}

/**
 * How exposed a unit would stand: each enemy close enough to reach it next
 * round threatens it, and how much depends on where the enemy stands. One
 * behind it could take it in the back, which routs it (§6.3.3); one off to
 * the side could take it in the flank (§6.3.4). One in front could meet it
 * head on, which threatens it only if the enemy's charge, with the enemy's
 * support, would beat it in the melee that follows: closing to within an
 * enemy's reach hands the enemy the charge.
 */
function appraiseExposure(
  view: GameState,
  survey: BattlefieldSurvey,
  mover: UnitWithPlacement,
  placement: UnitPlacement,
  ahead: Coordinate | undefined,
): number {
  const board = view.boardState;
  const { unit } = mover;
  const routLoss = lossFromResult(unit, {
    unitRetreated: false,
    unitReversed: false,
    unitRouted: true,
  });
  // Its own support where it would stand, worked out only if needed.
  let ownSupport: number | undefined;
  let threat = 0;
  for (const enemy of survey.enemyUnits) {
    const reach = recallStat(view, enemy.unit, 'speed') + 1;
    const distance = boardDistance(
      board,
      placement.coordinate,
      enemy.placement.coordinate,
    );
    if (distance > reach) {
      continue;
    }
    // Facing the board edge, the unit has no front to speak of.
    const alignment =
      ahead === undefined
        ? -1
        : facingAlignment(
            board,
            placement.coordinate,
            ahead,
            enemy.placement.coordinate,
          );
    if (alignment < -0.3) {
      threat += routLoss / 2;
      continue;
    }
    if (alignment <= 0.3) {
      threat += unit.unitType.cost * 0.3;
      continue;
    }
    // Head on: the enemy charges into this space, squared up (§6.2.3), with
    // its friends around the space as support and this unit's around it.
    ownSupport ??= getMeleeSupportValue(boardWithout(view, survey, mover), {
      placement,
      unit,
    });
    const enemySupport = getMeleeSupportValue(
      boardWithout(view, survey, enemy),
      {
        placement: {
          coordinate: placement.coordinate,
          facing: getOppositeFacing(placement.facing),
        },
        unit: enemy.unit,
      },
    );
    const charge = appraiseMelee(
      view,
      { support: enemySupport, unit: enemy.unit },
      { support: ownSupport, unit },
    );
    threat += Math.max(0, charge);
  }
  return threat;
}

/**
 * How well a unit would keep its place in the army. A line of units shoulder
 * to shoulder moves as one on a single order (§4.3.5), covers its members'
 * flanks, and lends support in every fight along it (§7.3), so a unit is
 * worth more in the line than out of it. A friend counts as a shoulder when
 * it stands in one of the unit's flanking spaces facing the same way or
 * exactly opposite. Friends ordered to move this phase that have not moved
 * yet are left out: the first unit of a line to step forward is not held
 * back by friends about to step up beside it, and those that follow are
 * drawn back into line beside the ones that went first. Turning on the
 * diagonal takes a unit out of any line, so it costs a little.
 */
function appraiseFormation(
  view: GameState,
  survey: BattlefieldSurvey,
  mover: UnitWithPlacement,
  placement: UnitPlacement,
): number {
  const board = view.boardState;
  const flanks = getFlankingSpaces(
    board,
    placement.coordinate,
    placement.facing,
  );
  const opposite = getOppositeFacing(placement.facing);
  let score = isDiagonalFacing(placement.facing) ? -POINTS_FOR_DIAGONAL : 0;
  for (const friend of survey.ownUnits) {
    if (isSameUnitInstance(friend.unit, mover.unit)) {
      continue;
    }
    if (hasUnitInArray(survey.stillToMove, friend.unit)) {
      continue;
    }
    const { coordinate, facing } = friend.placement;
    if (
      flanks.has(coordinate) &&
      (facing === placement.facing || facing === opposite)
    ) {
      score += POINTS_PER_SHOULDER;
    } else if (boardDistance(board, placement.coordinate, coordinate) === 1) {
      score += POINTS_PER_NEIGHBOUR;
    }
  }
  return score;
}

/**
 * What a bot thinks of a unit ending its move at `placement`. Ending in an
 * enemy's space is an engagement, scored by the fight it starts. Ending
 * anywhere else is scored by how well it stands: near the distance it wants
 * from the enemy (in reach to strike for a fighter, at its Range for a
 * shooter), turned toward the enemy, out of reach of a flank or rear charge,
 * near its general, and in line with its friends.
 *
 * @param view - The game as the bot sees it
 * @param survey - Where everything stands
 * @param mover - The unit moving, and where it stands now
 * @param placement - Where and which way it would end
 * @param temperament - How the bot weighs closing in against keeping safe
 * @returns Higher is better
 */
export function appraisePlacement(
  view: GameState,
  survey: BattlefieldSurvey,
  mover: UnitWithPlacement,
  placement: UnitPlacement,
  temperament: BotTemperament,
): number {
  const { unit } = mover;
  const board = view.boardState;
  const { coordinate } = placement;
  // A move that ends in an enemy's space engages it (§6.1.1).
  const defender = survey.enemyUnits.find(
    (enemy) => enemy.placement.coordinate === coordinate,
  );
  if (defender !== undefined) {
    return appraiseEngagement(
      view,
      survey,
      mover,
      placement,
      defender,
      temperament,
    );
  }

  let score = 0;
  // The nearest enemy is the one this unit is moving against.
  let nearest: UnitWithPlacement | undefined;
  let nearestDistance = Number.POSITIVE_INFINITY;
  for (const enemy of survey.enemyUnits) {
    const distance = boardDistance(
      board,
      coordinate,
      enemy.placement.coordinate,
    );
    if (distance < nearestDistance) {
      nearest = enemy;
      nearestDistance = distance;
    }
  }
  const ahead = findForwardSpace(board, coordinate, placement.facing);
  if (nearest !== undefined) {
    // A fighter wants to be next to the enemy; a shooter wants it at Range.
    const range = recallStat(view, unit, 'range');
    const wanted = range > 0 ? range : 1;
    score -=
      temperament.aggression *
      POINTS_PER_SPACE *
      Math.abs(nearestDistance - wanted);
    // Turned toward the enemy, it meets a charge head on and can strike.
    const alignment =
      ahead === undefined
        ? -1
        : facingAlignment(
            board,
            coordinate,
            ahead,
            nearest.placement.coordinate,
          );
    score += POINTS_FOR_FACING * alignment;
  }
  // A cautious bot fears a flank or rear charge more.
  score -=
    temperament.caution *
    appraiseExposure(view, survey, mover, placement, ahead);
  // Near its general a unit can be ordered again next round.
  if (
    survey.ownCommander !== undefined &&
    boardDistance(board, coordinate, survey.ownCommander) <= INSPIRATION_REACH
  ) {
    score += temperament.caution * POINTS_FOR_FACING;
  }
  score += appraiseFormation(view, survey, mover, placement);
  return score;
}
