import { createEmptyGameState, createUnitIndexKey } from '@factories';
import {
  createBoardWithUnits,
  createTestUnit,
  placed,
  replaceBoard,
} from '@testing';

import { moveUnitIntoEngagement } from './moveUnitIntoEngagement';

/**
 * A unit moves into a lone enemy's space and engages it, its space and its
 * entry in the index changing in one write.
 */
describe('moveUnitIntoEngagement function', () => {
  it('lifts the attacker, pairs it with the defender, and files it there', () => {
    // White faces east at E-5; black stands at D-5 and engages from the
    // north, facing south.
    const defender = createTestUnit('white');
    const attacker = createTestUnit('black');
    const state = replaceBoard(
      createEmptyGameState('standard'),
      createBoardWithUnits([
        placed(defender, 'E-5', 'east'),
        placed(attacker, 'D-5', 'south'),
      ]),
    );

    const engaged = moveUnitIntoEngagement(state, attacker, {
      coordinate: 'E-5',
      facing: 'south',
    });

    // D-5 is empty; the pair stands on E-5 with the attacker's facing.
    expect(engaged.boardState.board['D-5']?.unitPresence).toStrictEqual({
      presenceType: 'none',
    });
    expect(engaged.boardState.board['E-5']?.unitPresence).toStrictEqual({
      presenceType: 'engaged',
      primaryFacing: 'south',
      primaryUnit: attacker,
      secondaryUnit: defender,
    });
    // The attacker is filed at E-5; the defender never moved.
    expect(engaged.index.units[createUnitIndexKey(attacker)]).toBe('E-5');
    expect(engaged.index.units[createUnitIndexKey(defender)]).toBe('E-5');
  });
});
