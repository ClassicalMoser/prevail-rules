import { createEmptyStandardBoard } from '@factories';
import { createTestUnit, placed } from '@testing';

import { addEngagingUnitToBoard } from './addEngagingUnitToBoard';
import { addUnitToBoard } from './addUnitToBoard';

/** An engaging unit joins the enemy it engages, and the enemy faces it. */
describe('addEngagingUnitToBoard function', () => {
  it('pairs the attacker with the defender, the defender facing it whichever way it faced before', () => {
    // White faces east; Black arrives on its flank facing south.
    const defender = createTestUnit('white');
    const attacker = createTestUnit('black');
    const board = addUnitToBoard(
      createEmptyStandardBoard(),
      placed(defender, 'E-5', 'east'),
    );

    const engaged = addEngagingUnitToBoard(
      board,
      placed(attacker, 'E-5', 'south'),
    );

    // The pair keeps the attacker's facing, so White now faces north.
    expect(engaged.board['E-5']?.unitPresence).toStrictEqual({
      presenceType: 'engaged',
      primaryFacing: 'south',
      primaryUnit: attacker,
      secondaryUnit: defender,
    });
  });

  it('refuses a space with no unit to engage', () => {
    const attacker = createTestUnit('black');

    expect(() =>
      addEngagingUnitToBoard(
        createEmptyStandardBoard(),
        placed(attacker, 'E-5', 'south'),
      ),
    ).toThrow('There is no lone enemy to engage at E-5');
  });

  it('refuses a space held by a friend', () => {
    const friend = createTestUnit('black');
    const attacker = createTestUnit('black', { attack: 3 });
    const board = addUnitToBoard(
      createEmptyStandardBoard(),
      placed(friend, 'E-5', 'east'),
    );

    expect(() =>
      addEngagingUnitToBoard(board, placed(attacker, 'E-5', 'south')),
    ).toThrow('There is no lone enemy to engage at E-5');
  });
});
