import type { MoveCommanderEvent } from '@events';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events';
import { createBoardWithCommander, createEmptyGameState } from '@testing';

import { isValidMoveCommanderEvent } from './isValidMoveCommanderEvent';

/**
 * IsValidMoveCommanderEvent: membership against getLegalCommanderMoves.
 */
describe(isValidMoveCommanderEvent, () => {
  function stateWithCommanderAt(coordinate: 'A-1' | 'E-5') {
    const state = createEmptyGameState();
    state.boardState = createBoardWithCommander('white', coordinate);
    return state;
  }

  it('accepts a destination within commander move range', () => {
    const state = stateWithCommanderAt('E-5');
    const event: MoveCommanderEvent = {
      choiceType: 'moveCommander',
      eventNumber: 0,
      eventType: PLAYER_CHOICE_EVENT_TYPE,
      from: 'E-5',
      player: 'white',
      to: 'E-6',
    };

    expect(isValidMoveCommanderEvent(event, state)).toStrictEqual({
      result: true,
    });
  });

  it('rejects a destination beyond commander move range', () => {
    // From A-1, I-9 is farther than COMMANDER_MOVE_DISTANCE (entire board corners).
    const state = stateWithCommanderAt('A-1');
    const event: MoveCommanderEvent = {
      choiceType: 'moveCommander',
      eventNumber: 0,
      eventType: PLAYER_CHOICE_EVENT_TYPE,
      from: 'A-1',
      player: 'white',
      to: 'I-9',
    };

    const validation = isValidMoveCommanderEvent(event, state);
    expect(validation.result).toBe(false);
    if (validation.result !== false) {
      throw new Error('expected fail');
    }
    expect(validation.errorReason).toContain('I-9');
  });

  it('rejects when the commander is not at the starting position', () => {
    const state = stateWithCommanderAt('E-5');
    const event: MoveCommanderEvent = {
      choiceType: 'moveCommander',
      eventNumber: 0,
      eventType: PLAYER_CHOICE_EVENT_TYPE,
      from: 'E-6',
      player: 'white',
      to: 'E-7',
    };

    const validation = isValidMoveCommanderEvent(event, state);
    expect(validation.result).toBe(false);
    if (validation.result !== false) {
      throw new Error('expected fail');
    }
    expect(validation.errorReason).toMatch(
      /Starting position does not contain specified commander/i,
    );
  });
});
