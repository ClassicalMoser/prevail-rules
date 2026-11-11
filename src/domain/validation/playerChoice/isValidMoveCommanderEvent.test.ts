import { createBoardWithCommander } from '@testing';

import { isValidMoveCommanderEvent } from './isValidMoveCommanderEvent';

import { createEmptyGameState, createMoveCommanderEvent } from '@factories';
/**
 * IsValidMoveCommanderEvent: membership against getLegalCommanderMoves.
 */
describe('isValidMoveCommanderEvent function', () => {
  function stateWithCommanderAt(coordinate: 'A-1' | 'E-5') {
    const state = createEmptyGameState('standard');
    state.boardState = createBoardWithCommander('white', coordinate);
    return state;
  }

  it('accepts a destination within commander move range', () => {
    const state = stateWithCommanderAt('E-5');
    const event = createMoveCommanderEvent({
      from: 'E-5',
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
      from: 'A-1',
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

  it('throws when the commander is not at the starting position', () => {
    const state = stateWithCommanderAt('E-5');
    const event = createMoveCommanderEvent({
      from: 'E-6',
      player: 'white',
      to: 'E-7',
    });

    // A move from a space the commander is not on is a fault in the event,
    // not a move to weigh; the boundary turns it into a refusal.
    expect(() => isValidMoveCommanderEvent(event, state)).toThrow(
      'Starting position does not contain specified commander',
    );
  });
});
