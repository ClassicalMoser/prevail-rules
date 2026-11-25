import type { UnitInstance } from '@entities';
import type { AuthoritativeGameState } from '@game';
import { PLAY_CARDS_PHASE } from '@game';
import { getSingleUnitWithPlacementAtCoordinate } from '@queries';
import {
  createGameStateWithEngagedUnits,
  createPlayableGame,
  createTestUnit,
  placed,
  replaceBoard,
  resolvingShootOrder,
} from '@testing';
import { addUnitToBoard, updatePhaseState } from '@transforms';

import {
  getLegalRangedAttackSupporters,
  getLegalRangedAttackTargets,
} from './getLegalRangedAttackOptions';

/**
 * Black carries out a Shoot order in each case, holding the initiative. A
 * unit facing north from E-5 has D-4 to D-6 in its arc one space out, and
 * C-3 to C-7 two spaces out; row A is the northern edge.
 */

/**
 * The game with these units on the board, Black carrying out a Shoot order
 * for the units on the given spaces.
 */
function blackShootingWith(
  units: Parameters<typeof createPlayableGame>[0],
  ordered: readonly Parameters<
    typeof getSingleUnitWithPlacementAtCoordinate
  >[1][],
): AuthoritativeGameState {
  const game = createPlayableGame(units, { initiative: 'black' });
  const orderedUnits: UnitInstance[] = ordered.map(
    (coordinate) =>
      getSingleUnitWithPlacementAtCoordinate(game.boardState, coordinate).unit,
  );
  const shooting = resolvingShootOrder(game, orderedUnits);
  return shooting;
}

describe('getLegalRangedAttackTargets function', () => {
  it('offers the enemies in the arc within Range, and not a friend there', () => {
    // Black's Range-2 unit faces north. A white unit and a black one stand
    // in its arc.
    const state = blackShootingWith(
      [
        { coord: 'E-5', facing: 'north', player: 'black', range: 2 },
        { coord: 'D-5', facing: 'north', player: 'black' },
        { coord: 'C-7', facing: 'south', player: 'white' },
      ],
      ['E-5'],
    );
    const shooter = getSingleUnitWithPlacementAtCoordinate(
      state.boardState,
      'E-5',
    );
    const enemy = getSingleUnitWithPlacementAtCoordinate(
      state.boardState,
      'C-7',
    );

    // Only the enemy is a target.
    expect(getLegalRangedAttackTargets(shooter, state)).toStrictEqual([enemy]);
  });

  it('offers no enemy outside the arc or beyond Range', () => {
    // Black's Range-1 unit faces north. One white unit is two spaces out,
    // another at its flank.
    const state = blackShootingWith(
      [
        { coord: 'E-5', facing: 'north', player: 'black', range: 1 },
        { coord: 'C-5', facing: 'south', player: 'white' },
        { coord: 'E-6', facing: 'west', player: 'white' },
      ],
      ['E-5'],
    );
    const shooter = getSingleUnitWithPlacementAtCoordinate(
      state.boardState,
      'E-5',
    );

    expect(getLegalRangedAttackTargets(shooter, state)).toStrictEqual([]);
  });

  it('offers no enemy locked in a melee, even in the arc', () => {
    // A black unit and a white one are engaged on D-5, in front of Black's
    // free shooter on E-5.
    const engagedBlack = createTestUnit('black', { attack: 2 });
    const engagedWhite = createTestUnit('white', { attack: 2 });
    const engaged = createGameStateWithEngagedUnits(
      engagedBlack,
      engagedWhite,
      'D-5',
    );
    const shooter = placed(
      createTestUnit('black', { range: 2 }),
      'E-5',
      'north',
    );
    const state = replaceBoard(
      engaged,
      addUnitToBoard(engaged.boardState, shooter),
    );

    // You cannot shoot into a melee (§4.3.11 step 3, §7.4.2).
    expect(getLegalRangedAttackTargets(shooter, state)).toStrictEqual([]);
  });
});

describe('getLegalRangedAttackSupporters function', () => {
  it('offers a unit of the same order that could make the same shot itself', () => {
    // Black's order names both Range-2 units; White's unit is in both arcs.
    const state = blackShootingWith(
      [
        { coord: 'E-5', facing: 'north', player: 'black', range: 2 },
        { coord: 'E-4', facing: 'north', player: 'black', range: 2 },
        { coord: 'D-5', facing: 'south', player: 'white' },
      ],
      ['E-5', 'E-4'],
    );
    const shooter = getSingleUnitWithPlacementAtCoordinate(
      state.boardState,
      'E-5',
    );
    const supporter = getSingleUnitWithPlacementAtCoordinate(
      state.boardState,
      'E-4',
    );
    const target = getSingleUnitWithPlacementAtCoordinate(
      state.boardState,
      'D-5',
    );

    // The shooter itself is not offered: its shot is the attack (§7.3.4).
    expect(
      getLegalRangedAttackSupporters(shooter, target, state),
    ).toStrictEqual([supporter]);
  });

  it('offers no unit of the order that could not make the shot itself', () => {
    // The second unit of the order faces away from White's unit.
    const state = blackShootingWith(
      [
        { coord: 'E-5', facing: 'north', player: 'black', range: 2 },
        { coord: 'E-4', facing: 'south', player: 'black', range: 2 },
        { coord: 'D-5', facing: 'south', player: 'white' },
      ],
      ['E-5', 'E-4'],
    );
    const shooter = getSingleUnitWithPlacementAtCoordinate(
      state.boardState,
      'E-5',
    );
    const target = getSingleUnitWithPlacementAtCoordinate(
      state.boardState,
      'D-5',
    );

    expect(
      getLegalRangedAttackSupporters(shooter, target, state),
    ).toStrictEqual([]);
  });

  it('offers no unit the order does not name, or that has already shot', () => {
    // Both black units could reach White's, but only the shooter is still
    // to act in this order.
    const state = blackShootingWith(
      [
        { coord: 'E-5', facing: 'north', player: 'black', range: 2 },
        { coord: 'E-4', facing: 'north', player: 'black', range: 2 },
        { coord: 'D-5', facing: 'south', player: 'white' },
      ],
      ['E-5'],
    );
    const shooter = getSingleUnitWithPlacementAtCoordinate(
      state.boardState,
      'E-5',
    );
    const target = getSingleUnitWithPlacementAtCoordinate(
      state.boardState,
      'D-5',
    );

    // A supporter must be ordered by this same command and not yet have shot
    // (§7.3.4).
    expect(
      getLegalRangedAttackSupporters(shooter, target, state),
    ).toStrictEqual([]);
  });

  it('passes over a unit of the order that is not on the board', () => {
    // The order names a second black unit that no longer stands anywhere.
    const game = createPlayableGame(
      [
        { coord: 'E-5', facing: 'north', player: 'black', range: 2 },
        { coord: 'D-5', facing: 'south', player: 'white' },
      ],
      { initiative: 'black' },
    );
    const shooter = getSingleUnitWithPlacementAtCoordinate(
      game.boardState,
      'E-5',
    );
    const absent = createTestUnit('black', { instanceNumber: 2, range: 2 });
    const state = resolvingShootOrder(game, [shooter.unit, absent]);
    const target = getSingleUnitWithPlacementAtCoordinate(
      state.boardState,
      'D-5',
    );

    // Marked TODO(misleading) in the subject: play never reaches this.
    expect(
      getLegalRangedAttackSupporters(shooter, target, state),
    ).toStrictEqual([]);
  });

  it('throws when asked outside the issue commands phase, where no shot is being supported', () => {
    const shooter = placed(
      createTestUnit('black', { range: 2 }),
      'E-5',
      'north',
    );
    const target = placed(createTestUnit('white'), 'D-5', 'south');
    // The players are still choosing their cards.
    const state = updatePhaseState(createPlayableGame([]), {
      phase: PLAY_CARDS_PHASE,
      step: 'chooseCards',
    });

    expect(() =>
      getLegalRangedAttackSupporters(shooter, target, state),
    ).toThrow('Expected issueCommands phase, got playCards');
  });
});
