import { createEmptyGameState, createEmptyStandardBoard } from '@factories';
import { replaceBoard } from '@testing';

import { addCommanderToBoard } from './addCommanderToBoard';
import { defeatCommander } from './defeatCommander';

/**
 * A commander is defeated (§4.2.8): off the board, among the lost, and filed
 * as lost, in one write.
 */
describe('defeatCommander function', () => {
  // Black's commander stands on E-5.
  const state = replaceBoard(
    createEmptyGameState('standard'),
    addCommanderToBoard(createEmptyStandardBoard(), 'black', 'E-5'),
  );

  it('takes the commander off the board and records it as lost', () => {
    const defeated = defeatCommander(state, 'black');

    // Gone from E-5, among the lost, and filed as lost.
    expect(defeated.boardState.board['E-5']?.commanders).toStrictEqual([]);
    expect(defeated.lostCommanders).toStrictEqual(['black']);
    expect(defeated.index.commanders.black).toBe('lost');
  });

  it('throws for a commander not on the board', () => {
    // White's commander was never placed, so it cannot fall.
    expect(() => defeatCommander(state, 'white')).toThrow(
      'The white commander is not on the board',
    );
  });
});
