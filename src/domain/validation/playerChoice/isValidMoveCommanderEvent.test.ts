import { createEmptyGameState, createMoveCommanderEvent } from '@factories';
import { createBoardWithCommander, replaceBoard } from '@testing';

import { isValidMoveCommanderEvent } from './isValidMoveCommanderEvent';

/**
 * In Phase 2 a commander moves up to four spaces from where it stands
 * (§4.2.2). The event names only where it ends; the validator reads where it
 * starts from the board and checks the destination against the moves the
 * rules offer from there.
 *
 * White's commander stands alone on E-5 of an otherwise empty board.
 */
describe('isValidMoveCommanderEvent function', () => {
  const commanderOnE5 = replaceBoard(
    createEmptyGameState('standard'),
    createBoardWithCommander('white', 'E-5'),
  );

  it('accepts a destination within four spaces', () => {
    // E-9 is four steps east of E-5, as far as a commander goes.
    const event = createMoveCommanderEvent({ player: 'white', to: 'E-9' });

    expect(isValidMoveCommanderEvent(event, commanderOnE5)).toStrictEqual({
      result: true,
    });
  });

  it('refuses a destination five spaces away, naming where the commander stands', () => {
    // E-10 is one step past the commander's reach.
    const event = createMoveCommanderEvent({ player: 'white', to: 'E-10' });

    expect(isValidMoveCommanderEvent(event, commanderOnE5)).toStrictEqual({
      errorReason:
        'Destination E-10 is not a legal commander move for white from E-5',
      result: false,
    });
  });

  it('throws, naming the side, when its commander is not on the board', () => {
    // A new game, both commanders still off the board.
    const noCommander = createEmptyGameState('standard');
    const event = createMoveCommanderEvent({ player: 'white', to: 'E-6' });

    // A fallen commander's move is passed over by the sequencer, so asking
    // for one is a fault left for validatePlayerChoice to catch.
    expect(() => isValidMoveCommanderEvent(event, noCommander)).toThrow(
      'The white commander is not on the board',
    );
  });
});
