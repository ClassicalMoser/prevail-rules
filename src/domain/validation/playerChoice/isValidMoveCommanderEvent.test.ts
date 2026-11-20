import { createBoardWithCommander, replaceBoard } from '@testing';

import { isValidMoveCommanderEvent } from './isValidMoveCommanderEvent';

import { createEmptyGameState, createMoveCommanderEvent } from '@factories';
/**
 * IsValidMoveCommanderEvent: membership against getLegalCommanderMoves.
 */
describe('isValidMoveCommanderEvent function', () => {
  function stateWithCommanderAt(coordinate: 'A-1' | 'E-5') {
    let state = createEmptyGameState('standard');
    state = replaceBoard(state, createBoardWithCommander('white', coordinate));
    return state;
  }

  it('accepts a destination within commander move range', () => {
    const state = stateWithCommanderAt('E-5');
    const event = createMoveCommanderEvent({
      player: 'white',
      to: 'E-6',
    });

    expect(isValidMoveCommanderEvent(event, state)).toStrictEqual({
      result: true,
    });
  });

  it('rejects a destination beyond commander move range', () => {
    // From A-1, I-9 is farther than COMMANDER_MOVE_DISTANCE (entire board corners).
    const state = stateWithCommanderAt('A-1');
    const event = createMoveCommanderEvent({
      player: 'white',
      to: 'I-9',
    });

    const validation = isValidMoveCommanderEvent(event, state);
    expect(validation.result).toBe(false);
    if (validation.result !== false) {
      throw new Error('expected fail');
    }
    expect(validation.errorReason).toContain('I-9');
  });
});
