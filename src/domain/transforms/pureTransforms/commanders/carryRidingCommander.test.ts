import { createEmptyGameState } from '@factories';
import {
  createGameStateWithUnits,
  createMovementResolutionState,
  createUnitWithPlacement,
} from '@testing';

import { carryRidingCommander } from './carryRidingCommander';
import { deployCommander } from './deployCommander';

/**
 * A commander riding with a moving unit ends in the unit's final space
 * (§4.3.10); one who stays behind is left where it stands.
 *
 * Black's unit set off from E-5, where black's commander stands with it,
 * and lands on C-5.
 */
describe('carryRidingCommander function', () => {
  // Black's unit has already landed on C-5, as its callers write the unit
  // before the rider.
  const mover = createUnitWithPlacement({
    coordinate: 'C-5',
    facing: 'north',
    playerSide: 'black',
  });
  // Black's commander still stands on E-5, the unit's starting space
  // (§4.3.10).
  const state = deployCommander(
    createGameStateWithUnits([mover]),
    'black',
    'E-5',
  );

  /** The movement as declared: the unit is bound for C-5, rider or not. */
  function movement(moveCommander: boolean | 'pending') {
    const resolution = createMovementResolutionState(
      createEmptyGameState('standard'),
      {
        commitment: { commitmentType: 'declined' },
        moveCommander,
        movingUnit: mover.unit,
        targetPlacement: { coordinate: 'C-5', facing: 'north' },
      },
    );
    return resolution;
  }

  it('a riding commander leaves the start space for the landing space', () => {
    const carried = carryRidingCommander(state, movement(true), 'C-5');

    // The commander follows its unit: gone from E-5, standing on C-5, and
    // filed there.
    expect(carried.boardState.board['E-5']?.commanders).toStrictEqual([]);
    expect(carried.boardState.board['C-5']?.commanders).toStrictEqual([
      'black',
    ]);
    expect(carried.index.commanders.black).toBe('C-5');
  });

  it('a commander who stays behind is left on the start space', () => {
    const carried = carryRidingCommander(state, movement(false), 'C-5');

    // Nothing moves: the commander only goes in Phase 2 (§4.3.10). The very
    // same state comes back.
    expect(carried).toBe(state);
  });

  it('throws for a move whose rider has not been decided', () => {
    // Whether the commander rides is written with the move (§4.3.10); a move
    // not yet written cannot be carried out, so it is a fault in the caller,
    // not a commander staying behind.
    expect(() =>
      carryRidingCommander(state, movement('pending'), 'C-5'),
    ).toThrow('The move has not been written yet');
  });
});
