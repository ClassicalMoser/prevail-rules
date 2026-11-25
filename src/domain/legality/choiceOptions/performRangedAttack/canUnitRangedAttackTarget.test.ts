import { getSingleUnitWithPlacementAtCoordinate } from '@queries';
import {
  createGameState,
  createGameStateWithEngagedUnits,
  createTestUnit,
  placed,
  replaceBoard,
} from '@testing';
import { addUnitToBoard } from '@transforms';

import {
  canUnitRangedAttackTarget,
  isUnengagedUnit,
} from './canUnitRangedAttackTarget';

/**
 * A unit may shoot at a target when it is unengaged and has Range, and the
 * target is an enemy in its forward arc out to that Range (§7.4.1–7.4.2,
 * §2.4.3). The arc of a unit facing north from E-5 is D-4 to D-6 one space
 * out, and C-3 to C-7 two spaces out; row A is the northern edge.
 */
describe('canUnitRangedAttackTarget function', () => {
  it('an enemy in the arc, within Range, may be shot', () => {
    // Black's Range-2 unit faces north; White's unit is two spaces out.
    const state = createGameState([
      { coord: 'E-5', facing: 'north', player: 'black', range: 2 },
      { coord: 'C-7', facing: 'south', player: 'white' },
    ]);
    const shooter = getSingleUnitWithPlacementAtCoordinate(
      state.boardState,
      'E-5',
    );
    const target = getSingleUnitWithPlacementAtCoordinate(
      state.boardState,
      'C-7',
    );

    expect(canUnitRangedAttackTarget(shooter, target, state)).toBe(true);
  });

  it('a friend in the arc is not a target', () => {
    // Both units are Black's.
    const state = createGameState([
      { coord: 'E-5', facing: 'north', player: 'black', range: 2 },
      { coord: 'D-5', facing: 'north', player: 'black' },
    ]);
    const shooter = getSingleUnitWithPlacementAtCoordinate(
      state.boardState,
      'E-5',
    );
    const friend = getSingleUnitWithPlacementAtCoordinate(
      state.boardState,
      'D-5',
    );

    expect(canUnitRangedAttackTarget(shooter, friend, state)).toBe(false);
  });

  it('an enemy beside or beyond Range is out of reach', () => {
    // White has one unit at Black's flank and one three spaces out.
    const state = createGameState([
      { coord: 'E-5', facing: 'north', player: 'black', range: 2 },
      { coord: 'E-6', facing: 'west', player: 'white' },
      { coord: 'B-5', facing: 'south', player: 'white' },
    ]);
    const shooter = getSingleUnitWithPlacementAtCoordinate(
      state.boardState,
      'E-5',
    );
    const beside = getSingleUnitWithPlacementAtCoordinate(
      state.boardState,
      'E-6',
    );
    const beyond = getSingleUnitWithPlacementAtCoordinate(
      state.boardState,
      'B-5',
    );

    // A flanking space is not in the forward arc.
    expect(canUnitRangedAttackTarget(shooter, beside, state)).toBe(false);
    // Three spaces out is past a Range of 2.
    expect(canUnitRangedAttackTarget(shooter, beyond, state)).toBe(false);
  });

  it('a card committed for Range reaches one space further out', () => {
    // White's unit is three spaces out; Black's Range is 2.
    const state = createGameState([
      { coord: 'E-5', facing: 'north', player: 'black', range: 2 },
      { coord: 'B-5', facing: 'south', player: 'white' },
    ]);
    const shooter = getSingleUnitWithPlacementAtCoordinate(
      state.boardState,
      'E-5',
    );
    const target = getSingleUnitWithPlacementAtCoordinate(
      state.boardState,
      'B-5',
    );

    // A committed card gives +1 to the stat it names (§8.2, §4.3.11 step 2).
    expect(
      canUnitRangedAttackTarget(shooter, target, state, [
        { type: 'range', value: 1 },
      ]),
    ).toBe(true);
  });

  it('a unit with no Range cannot shoot', () => {
    // Black's unit has Range 0; White's stands right in front of it.
    const state = createGameState([
      { coord: 'E-5', facing: 'north', player: 'black', range: 0 },
      { coord: 'D-5', facing: 'south', player: 'white' },
    ]);
    const shooter = getSingleUnitWithPlacementAtCoordinate(
      state.boardState,
      'E-5',
    );
    const target = getSingleUnitWithPlacementAtCoordinate(
      state.boardState,
      'D-5',
    );

    expect(canUnitRangedAttackTarget(shooter, target, state)).toBe(false);
  });

  it('an engaged unit cannot shoot, even at an enemy in its arc', () => {
    // Black's Range-2 unit is locked in a fight on E-5; another white unit
    // stands two spaces out in its arc.
    const shooterUnit = createTestUnit('black', { range: 2 });
    const engagedEnemy = createTestUnit('white', { attack: 2 });
    const engaged = createGameStateWithEngagedUnits(
      shooterUnit,
      engagedEnemy,
      'E-5',
      'north',
    );
    const target = placed(
      createTestUnit('white', { attack: 2, instanceNumber: 2 }),
      'C-5',
      'south',
    );
    const state = replaceBoard(
      engaged,
      addUnitToBoard(engaged.boardState, target),
    );
    const shooter = placed(shooterUnit, 'E-5', 'north');

    // It is busy with its own fight (§4.3.11, §6.1.2).
    expect(canUnitRangedAttackTarget(shooter, target, state)).toBe(false);
  });
});

/**
 * A unit is free to shoot or support a shot only while it stands alone in
 * its space; two units in one space are engaged (§2.2.1, §6.1.2).
 */
describe('isUnengagedUnit function', () => {
  it('a unit alone in its space is unengaged', () => {
    const state = createGameState([
      { coord: 'E-5', facing: 'north', player: 'black' },
    ]);
    const unit = getSingleUnitWithPlacementAtCoordinate(
      state.boardState,
      'E-5',
    );

    expect(isUnengagedUnit(state, unit)).toBe(true);
  });

  it('a unit sharing its space with an enemy is engaged', () => {
    // Black's unit and White's are locked together on E-5.
    const black = createTestUnit('black', { attack: 2 });
    const white = createTestUnit('white', { attack: 2 });
    const state = createGameStateWithEngagedUnits(black, white, 'E-5');

    expect(isUnengagedUnit(state, placed(black, 'E-5', 'north'))).toBe(false);
  });

  it('a placement on a space where another unit stands alone does not pass for this unit', () => {
    // Black's first unit stands on E-5; the placement names its second unit
    // there, as a stale placement might.
    const state = createGameState([
      { coord: 'E-5', facing: 'north', player: 'black', attack: 2 },
    ]);
    const other = createTestUnit('black', { attack: 2, instanceNumber: 2 });

    expect(isUnengagedUnit(state, placed(other, 'E-5', 'north'))).toBe(false);
  });
});
