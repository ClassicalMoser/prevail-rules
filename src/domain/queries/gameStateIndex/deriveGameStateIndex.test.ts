import type { Board } from '@entities';
import type { AuthoritativeGameState } from '@game';
import { createEmptyGameState, createUnitIndexKey } from '@factories';
import { createBoardWithEngagedUnits, createTestUnit } from '@testing';

import { deriveGameStateIndex } from './deriveGameStateIndex';

/**
 * A new game with this board in place. The board is set directly rather than
 * through `updateBoardState`, which sets the index from the subject; the
 * subject ignores the state's own index, so the stale one does no harm.
 */
function withBoard(board: Board): AuthoritativeGameState {
  return { ...createEmptyGameState('standard'), boardState: board };
}

/**
 * The index a state's record calls for: where every unit and commander is,
 * read from the board and the reserve, routed and lost lists.
 */
describe('deriveGameStateIndex function', () => {
  it('files nothing but two commanders in reserve for a game not yet mustered', () => {
    // No units anywhere, and neither commander placed.
    const state = createEmptyGameState('standard');

    expect(deriveGameStateIndex(state)).toStrictEqual({
      commanders: { black: 'reserved', white: 'reserved' },
      units: {},
    });
  });

  it('files units from the reserve and the routed, and commanders from the lost', () => {
    // One unit waiting, one routed, and black's commander lost.
    const waiting = createTestUnit('white', { attack: 3, instanceNumber: 1 });
    const routed = createTestUnit('black', { attack: 3, instanceNumber: 1 });
    const state = {
      ...createEmptyGameState('standard'),
      lostCommanders: ['black' as const],
      reservedUnits: [waiting],
      routedUnits: [routed],
    };

    const index = deriveGameStateIndex(state);

    // Each is filed by name where the record holds it.
    expect(index.units).toStrictEqual({
      [createUnitIndexKey(routed)]: 'routed',
      [createUnitIndexKey(waiting)]: 'reserved',
    });
    expect(index.commanders).toStrictEqual({
      black: 'lost',
      white: 'reserved',
    });
  });

  it('files both units of an engaged pair at their shared space', () => {
    // White and black engaged at E-5.
    const white = createTestUnit('white', { attack: 3 });
    const black = createTestUnit('black', { attack: 3 });
    const state = withBoard(createBoardWithEngagedUnits(white, black, 'E-5'));

    const index = deriveGameStateIndex(state);

    // Both stand on E-5; which way each faces stays in the space.
    expect(index.units[createUnitIndexKey(white)]).toBe('E-5');
    expect(index.units[createUnitIndexKey(black)]).toBe('E-5');
  });

  it('files a unit held both in reserve and on the board where it stands', () => {
    // Setup places the unit a moment before it leaves reserve.
    const white = createTestUnit('white', { attack: 3 });
    const onBoard = withBoard(
      createBoardWithEngagedUnits(
        white,
        createTestUnit('black', { attack: 3 }),
        'E-5',
      ),
    );
    const state = { ...onBoard, reservedUnits: [white] };

    // The board is read last, and the last place read stands.
    expect(deriveGameStateIndex(state).units[createUnitIndexKey(white)]).toBe(
      'E-5',
    );
  });
});
