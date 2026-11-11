import type { UnitWithPlacement } from '@entities';
import {
  createChooseMovingUnitEvent,
  createChooseShooterEvent,
  createPerformRangedAttackEvent,
} from '@factories';
import {
  getMovementResolutionState,
  getRangedAttackResolutionState,
  getSingleUnitWithPlacementAtCoordinate,
} from '@queries';
import {
  createPlayableGame,
  readyToAimShot,
  resolvingMoveOrder,
  resolvingShootOrder,
} from '@testing';
import { applyEvent } from '@transforms';
import { validatePlayerChoice } from '@validation';

/**
 * Naming a unit in an order. An event names a unit by who it is; what the
 * unit is, its stats, is what the board says it is. A client that sends a
 * unit with other stats than the one it fields is still naming that unit,
 * and the game goes on with the unit it has.
 *
 * Black's unit stands on E-5 facing north with Range 2; white's stands on
 * C-7 facing south. Black holds initiative.
 */
function game() {
  return createPlayableGame(
    [
      { coord: 'E-5', facing: 'north', player: 'black', range: 2 },
      { coord: 'C-7', facing: 'south', player: 'white' },
    ],
    { initiative: 'black' },
  );
}

/**
 * The same unit, sent by a client that gave it stats it does not have: a
 * Speed and an Attack no unit of its kind carries.
 */
function claimedStronger(named: UnitWithPlacement): UnitWithPlacement {
  const stats = { ...named.unit.unitType.stats, attack: 99, speed: 99 };
  const stronger: UnitWithPlacement = {
    ...named,
    unit: {
      ...named.unit,
      unitType: { ...named.unit.unitType, stats },
    },
  };
  return stronger;
}

describe('naming a unit in an order', () => {
  it('moves the unit the board holds, whatever stats the client claims for it', () => {
    const start = game();
    const onBoard = getSingleUnitWithPlacementAtCoordinate(
      start.boardState,
      'E-5',
    );
    const resolving = resolvingMoveOrder(start, [onBoard.unit]);

    const event = createChooseMovingUnitEvent({
      player: 'black',
      unit: claimedStronger(onBoard),
    });
    // The unit is the one the order allows, so the game accepts the choice.
    expect(validatePlayerChoice(event, resolving)).toStrictEqual({
      result: true,
    });
    const named = applyEvent(event, resolving);

    // The move opens for the unit as the board has it.
    expect(getMovementResolutionState(named).movingUnit).toStrictEqual(onBoard);
  });

  it('shoots with the unit the board holds, whatever stats the client claims for it', () => {
    const start = game();
    const onBoard = getSingleUnitWithPlacementAtCoordinate(
      start.boardState,
      'E-5',
    );
    const resolving = resolvingShootOrder(start, [onBoard.unit]);

    const named = applyEvent(
      createChooseShooterEvent({
        player: 'black',
        unit: claimedStronger(onBoard),
      }),
      resolving,
    );

    // The shot opens for the shooter as the board has it.
    expect(getRangedAttackResolutionState(named).attackingUnit).toStrictEqual(
      onBoard.unit,
    );
  });

  it('aims at the unit the board holds, whatever stats the client claims for it', () => {
    const start = game();
    const shooter = getSingleUnitWithPlacementAtCoordinate(
      start.boardState,
      'E-5',
    );
    const target = getSingleUnitWithPlacementAtCoordinate(
      start.boardState,
      'C-7',
    );
    const ready = readyToAimShot(
      resolvingShootOrder(start, [shooter.unit]),
      shooter,
      null,
    );

    const aimed = applyEvent(
      createPerformRangedAttackEvent({
        player: 'black',
        supportingUnits: [],
        targetUnit: claimedStronger(target),
      }),
      ready,
    );

    // The shot is aimed at the target as the board has it.
    expect(getRangedAttackResolutionState(aimed).defendingUnit).toStrictEqual(
      target.unit,
    );
  });
});
