import { createEmptyGameState, createEmptyStandardBoard } from '@factories';
import {
  createMovementResolutionState,
  createUnitWithPlacement,
} from '@testing';

import { addCommanderToBoard } from './addCommanderToBoard';
import { carryRidingCommander } from './carryRidingCommander';

/**
 * A commander riding with a moving unit ends in the unit's final space
 * (§4.3.10); one who stays behind is left where it stands.
 *
 * Black's unit set off from E-5, where black's commander stands with it,
 * and lands on C-5.
 */
describe('carryRidingCommander function', () => {
  const mover = createUnitWithPlacement({
    coordinate: 'E-5',
    facing: 'north',
    playerSide: 'black',
  });
  const board = addCommanderToBoard(createEmptyStandardBoard(), 'black', 'E-5');

  function movement(moveCommander: boolean) {
    const resolution = createMovementResolutionState(
      createEmptyGameState('standard'),
      {
        commitment: { commitmentType: 'declined' },
        moveCommander,
        movingUnit: mover,
        targetPlacement: { coordinate: 'C-5', facing: 'north' },
      },
    );
    return resolution;
  }

  it('a riding commander leaves the start space for the landing space', () => {
    const carried = carryRidingCommander(board, movement(true), 'C-5');

    expect(carried.board['E-5']?.commanders).toStrictEqual([]);
    expect(carried.board['C-5']?.commanders).toStrictEqual(['black']);
  });

  it('a commander who stays behind is left on the start space', () => {
    const carried = carryRidingCommander(board, movement(false), 'C-5');

    expect(carried.board['E-5']?.commanders).toStrictEqual(['black']);
    expect(carried.board['C-5']?.commanders).toStrictEqual([]);
  });
});
